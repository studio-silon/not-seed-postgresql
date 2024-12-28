import {
    defer,
    json,
    LoaderFunctionArgs,
    NodeOnDiskFile,
    redirect,
    unstable_composeUploadHandlers,
    unstable_createFileUploadHandler,
    unstable_parseMultipartFormData,
} from '@remix-run/node';
import {Await, useLoaderData, useParams, Form, Link} from '@remix-run/react';
import {Wiki} from '@/system/wiki';
import {Button} from '~/components/ui/button';
import {History, Edit2, Star, Wrench, Anchor, Tag, X, Trash2, MessageSquare, ArrowUpRight} from 'lucide-react';
import {useState, Suspense, useEffect} from 'react';
import {Textarea} from '~/components/ui/textarea';
import {getUser, getUserData} from '~/utils/sessions.server';
import {urlEncoding} from '~/utils/url-encoding';
import {Input} from '~/components/ui/input';
import {Site} from '@/system/site';
import {Frame} from '~/components/frame';
import metaTitle from '~/utils/meta';
import {JoinName} from '~/utils/wiki';
import Popover from '~/stories/Popover';
import {Toggle} from '~/components/ui/toggle';
import {cn} from '~/utils/classMerge';
import {Acl} from '~/system/.server/acl';
import FileInput from '~/stories/FileInput';
import {promisify} from 'util';
import sizeOf from 'image-size';
import path from 'path';
import {prisma} from '~/db.server';
import parser from '@/parser/markup.server';
import backLinkInit from '@/parser/backlink.server';
import {Badge} from '~/components/ui/badge';
import {UserPopover} from '~/components/user-popover';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '~/components/ui/alert-dialog';

const getImageSize = promisify(sizeOf);

export const meta = metaTitle<typeof loader>((data) => (data.wiki ? JoinName(data.wiki.namespace, data.wiki.title) : ''));

export async function loader({request, params}: LoaderFunctionArgs & {params: {'*': string}}) {
    const [namespace, title] = Wiki.splitName(params['*']);

    const url = new URL(request.url);
    const paramRever = url.searchParams.get('rever');

    const user = await getUser(request);
    const userData = await getUserData(request);

    let wiki: Awaited<ReturnType<typeof Wiki.getPage>> = null;

    if (paramRever && !isNaN(+paramRever)) {
        const rever = await Wiki.getPageWithRever(namespace, title, +paramRever);

        if (rever === null) {
            wiki = await Wiki.getPage(namespace, title);
        } else {
            wiki = rever.page;
            if (wiki && rever.version) {
                wiki.content = rever.version.content;
            }
        }
    } else wiki = await Wiki.getPage(namespace, title);

    if (!wiki && !title) {
        const {frontPage} = await Site.getInfo();

        return redirect('/wiki/' + urlEncoding(frontPage));
    }

    if (wiki && !(await Acl.isAllowed(wiki, user, userData, 'read'))) {
        return json({
            wiki: null,
            user: false,
            canEdit: false,
            canMove: false,
            canDelete: false,
            isStared: false,
            parse: null,
            backlinks: [],
            editRequests: [],
            name: params['*'],
            forbidden: true,
        });
    }

    const canEdit = wiki && (await Acl.isAllowed(wiki, user, userData, 'edit'));
    const canMove = wiki && (await Acl.isAllowed(wiki, user, userData, 'move'));
    const canDelete = wiki && (await Acl.isAllowed(wiki, user, userData, 'delete'));
    const isStared = wiki && user && (await Wiki.isStared(wiki.id, user.id));

    const editRequests = canEdit ? await Wiki.getEditRequests(namespace, title) : [];

    return defer({
        wiki,
        user: user?.id !== undefined,
        canEdit,
        canMove,
        canDelete,
        isStared,
        editRequests,
        backlinks:
            wiki?.namespace === '분류'
                ? await prisma.backlink.findMany({
                      where: {
                          to: params['*'],
                          type: 'category',
                      },
                      include: {
                          from: {
                              select: {
                                  title: true,
                                  namespace: true,
                              },
                          },
                      },
                  })
                : [],
        parse: wiki ? parser(wiki.title, wiki.namespace, wiki.content, userData) : null,
        name: params['*'],
        forbidden: false,
    });
}

export async function action({request, params}: {request: Request; params: {'*': string}}) {
    const formData = await request.clone().formData();
    const [namespace, oldTitle] = Wiki.splitName(params['*']);
    const newName = formData.get('title') as string;
    const isDeleting = formData.get('isDeleting') === '1';
    const log = formData.get('log') as string;
    const content = formData.get('content') as string;
    const user = await getUser(request);
    const userData = await getUserData(request);
    const actionType = formData.get('actionType') as string;

    const wiki = await Wiki.getPage(namespace, oldTitle);
    let wikiId = wiki?.id;

    if (actionType === 'toggle_star') {
        const wikiId = wiki?.id;
        if (!wikiId || !user) {
            throw new Response('Bad Request', {status: 400});
        }

        const existingStar = await prisma.star.findFirst({
            where: {wikiId, userId: user.id},
        });

        if (existingStar) {
            await prisma.star.delete({where: {id: existingStar.id}});
        } else {
            await prisma.star.create({
                data: {wikiId, userId: user.id},
            });
        }

        return redirect(`/wiki/${urlEncoding(params['*'])}`);
    }

    if (wiki && !(await Acl.isAllowed(wiki, user, userData, 'read'))) {
        throw new Response('Forbidden', {status: 403});
    }

    if (actionType === 'create_edit_request') {
        const newName = formData.get('title') as string;
        const isDeleting = formData.get('isDeleting') === '1';
        const log = formData.get('log') as string;
        const content = formData.get('content') as string;

        const requestType = isDeleting ? 2 : params['*'] !== newName ? 1 : 0;

        const [newNamespace, newTitle] = Wiki.splitName(newName);

        const editRequest = await Wiki.createEditRequest(
            namespace,
            oldTitle,
            requestType,
            content,
            requestType === 1 ? newNamespace : null,
            requestType === 1 ? newTitle : null,
            log,
            userData,
        );

        return redirect(`/wiki/${urlEncoding(params['*'])}`);
    }

    if (actionType === 'handle_edit_request') {
        const requestId = Number(formData.get('requestId'));
        const action = formData.get('action') as 'accept' | 'reject';
        const reviewLog = formData.get('reviewLog') as string;

        await Wiki.handleEditRequest(requestId, action, reviewLog, userData);

        return redirect(`/wiki/${urlEncoding(params['*'])}`);
    }

    if (wiki && !(await Acl.isAllowed(wiki, user, userData, 'edit'))) {
        throw new Response('Forbidden', {status: 403});
    }

    if (isDeleting && wiki && !(await Acl.isAllowed(wiki, user, userData, 'delete'))) {
        throw new Response('Forbidden', {status: 403});
    }

    if (params['*'] !== newName && wiki && !(await Acl.isAllowed(wiki, user, userData, 'move'))) {
        throw new Response('Forbidden', {status: 403});
    }

    if (isDeleting) {
        await Wiki.deletePage(namespace, oldTitle, log || '', userData);
    } else if (wiki && params['*'] !== newName) {
        const [newNamespace, newTitle] = Wiki.splitName(newName);
        await Wiki.movePage(namespace, oldTitle, newNamespace, newTitle, content, log || '', userData);
    } else {
        const [newNamespace, newTitle] = Wiki.splitName(newName);
        wikiId = (await Wiki.updatePage(newNamespace, newTitle, content, log || '', userData)).id;
    }

    (async () => {
        if (wikiId) {
            const [newNamespace, newTitle] = Wiki.splitName(newName);

            await backLinkInit({
                id: wikiId,
                namespace: newNamespace,
                title: newTitle,
                content,
            });
        }
    })();

    if (newName.startsWith('파일:')) {
        let fileData = await unstable_parseMultipartFormData(
            request,
            unstable_composeUploadHandlers(
                unstable_createFileUploadHandler({
                    filter({contentType}) {
                        return contentType.includes('image');
                    },
                    directory: './public/img',
                    avoidFileConflicts: false,
                    file({filename}) {
                        return new Date().toISOString() + path.extname(filename);
                    },
                    maxPartSize: 10 * 1024 * 1024, // 10MB
                }),
            ),
        );

        const file = fileData.get('file') as NodeOnDiskFile;

        if (file && wikiId !== undefined) {
            const filepath = file.getFilePath();

            const dimensions = await getImageSize(filepath);

            await prisma.wikiFile.upsert({
                where: {
                    wikiId: wikiId,
                },
                create: {
                    width: dimensions?.width || 0,
                    height: dimensions?.width || 0,
                    url: '/img/' + file.name,
                    wiki: {
                        connect: {
                            id: wikiId,
                        },
                    },
                },
                update: {
                    width: dimensions?.width || 0,
                    height: dimensions?.width || 0,
                    url: '/img/' + file.name,
                },
            });
        }
    }

    return redirect(`/wiki/${urlEncoding(newName)}`);
}

export default function WikiRoute() {
    const {wiki, user, backlinks, canEdit, canMove, canDelete, isStared, editRequests, name, parse, forbidden} = useLoaderData<typeof loader>();
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedEditRequest, setSelectedEditRequest] = useState<any>(null);
    const [isRAW, setIsRAW] = useState(false);
    const [title, setTitle] = useState(name);

    const shouldCreateEditRequest = (action: 'edit' | 'move' | 'delete') => {
        switch (action) {
            case 'edit':
                return !canEdit;
            case 'move':
                return !canMove;
            case 'delete':
                return !canDelete;
            default:
                return false;
        }
    };

    useEffect(() => {
        setTitle(name);
    }, [name]);

    const isFilePage = title.startsWith('파일:') && !isDeleting;

    return (
        <Frame>
            <div className="flex flex-col gap-2 mb-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        {isEditing ? (
                            <input
                                type="text"
                                name="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="bg-background text-2xl lg:text-3xl font-bold text-foreground border-b border-gray-300 focus:border-gray-600 focus:outline-none w-full"
                            />
                        ) : (
                            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">{title}</h1>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {wiki && user && (
                            <Form method="post">
                                <input type="hidden" name="actionType" value="toggle_star" />
                                <Button type="submit" variant="ghost" size="sm" className={'size-8 p-0'} aria-label={isStared ? '스타 해제' : '스타 추가'}>
                                    <Star className={cn('h-4 w-4 m-auto', isStared && 'text-yellow-500')} />
                                </Button>
                            </Form>
                        )}
                        <Toggle onClick={() => setIsEditing(!isEditing)} size="sm" isActive={+isEditing as 0 | 1}>
                            <Edit2 className="h-4 w-4 m-auto" />
                        </Toggle>
                        <Link to={'/history/' + urlEncoding(name)}>
                            <Button variant="ghost" size="sm" className="size-8 p-0">
                                <History className="h-4 w-4 m-auto" />
                            </Button>
                        </Link>
                        {wiki && !wiki.deleted ? (
                            <Link to={'/discussion/' + urlEncoding(name)}>
                                <Button variant="ghost" size="sm" className={cn('size-8 p-0', wiki.discussions.length > 0 && 'bg-brand/10 hover:bg-brend/10')}>
                                    <MessageSquare className="h-4 w-4 m-auto" />
                                </Button>
                            </Link>
                        ) : null}
                        {isEditing ? (
                            !wiki || wiki.deleted ? null : (
                                <Toggle onClick={() => setIsDeleting(!isDeleting)} size="sm" isActive={+isDeleting as 0 | 1}>
                                    <Trash2 className="h-4 w-4 m-auto" />
                                </Toggle>
                            )
                        ) : (
                            <Popover>
                                <Popover.Trigger asChild>
                                    <Button variant="ghost" size="sm" className="size-8 p-0">
                                        <Wrench className="h-4 w-4 m-auto" />
                                    </Button>
                                </Popover.Trigger>
                                <Popover.Content align="center" className="p-1 rounded-lg flex gap-2 w-auto min-w-min">
                                    <Toggle onClick={() => setIsRAW(!isRAW)} size="sm" isActive={+isRAW as 0 | 1}>
                                        RAW
                                    </Toggle>
                                    <Link to={'/acl/' + urlEncoding(name)}>
                                        <Button variant="ghost" size="sm" className="size-8 p-0">
                                            ACL
                                        </Button>
                                    </Link>
                                    <Link to={'/backlink/' + urlEncoding(name)}>
                                        <Button variant="ghost" size="sm" className="size-8 p-0">
                                            <Anchor className="h-4 w-4 m-auto" />
                                        </Button>
                                    </Link>
                                </Popover.Content>
                            </Popover>
                        )}
                    </div>
                </div>
                {!isEditing && parse && (
                    <Suspense fallback={''}>
                        <Await resolve={parse}>
                            {(parse) =>
                                parse.categories &&
                                parse.categories.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-2 -mx-2">
                                        <span className="flex items-center text-gray-400 ml-2">
                                            <Tag className="h-4 w-4" />
                                        </span>
                                        {parse.categories.map((name) => (
                                            <Link key={name} to={`/wiki/${urlEncoding('분류:' + name)}`}>
                                                <Badge variant="secondary" className="hover:bg-muted transition-colors">
                                                    {name}
                                                </Badge>
                                            </Link>
                                        ))}
                                    </div>
                                )
                            }
                        </Await>
                    </Suspense>
                )}
            </div>
            {!isEditing && canEdit && editRequests && editRequests.length > 0 && (
                <div className="mt-4 mb-4">
                    <h2 className="text-lg font-semibold mb-3">편집 요청</h2>
                    <ul className="space-y-2">
                        {editRequests.map(
                            (request) =>
                                request && (
                                    <li key={request.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                                        <div>
                                            <span className="font-medium">
                                                <UserPopover username={request.user?.username} ip={request.ipAddress || '0.0.0.0'} />가 이 문서를 {request.type === 0 && '편집'}
                                                {request.type === 1 && '이동'}
                                                {request.type === 2 && '삭제'}
                                                하려고 합니다.
                                            </span>
                                            {request.log && <p className="text-sm text-muted-foreground">{request.log}</p>}
                                        </div>
                                        <Button onClick={() => setSelectedEditRequest(request)} variant="outline" size="sm">
                                            리뷰
                                        </Button>
                                    </li>
                                ),
                        )}
                    </ul>
                </div>
            )}

            {selectedEditRequest && (
                <AlertDialog open={selectedEditRequest} onOpenChange={() => setSelectedEditRequest(null)}>
                    <AlertDialogContent>
                        <Form method="post" onSubmit={() => setSelectedEditRequest(null)}>
                            <input type="hidden" name="actionType" value="handle_edit_request" />
                            <input type="hidden" name="requestId" value={selectedEditRequest.id} />

                            <AlertDialogHeader>
                                <AlertDialogTitle>편집 요청 리뷰</AlertDialogTitle>
                                <AlertDialogDescription>
                                    <p>
                                        <UserPopover username={selectedEditRequest.user?.username} ip={selectedEditRequest.ipAddress || '0.0.0.0'} />가 이 문서를{' '}
                                        {selectedEditRequest.type === 0 && '편집'}
                                        {selectedEditRequest.type === 1 && '이동'}
                                        {selectedEditRequest.type === 2 && '삭제'}
                                        하려고 합니다.
                                    </p>
                                    {selectedEditRequest.log && <p className="mt-2 text-gray-600">로그: {selectedEditRequest.log}</p>}
                                    {selectedEditRequest.type === 0 && (
                                        <pre className="mt-2 mb-2 p-2 bg-muted rounded w-full break-words whitespace-normal">{selectedEditRequest.content}</pre>
                                    )}
                                    <Input name="reviewLog" placeholder="편집 로그 작성..." className="w-full mb-4" />
                                </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                                <AlertDialogCancel type="submit" name="action" value="reject">
                                    거절
                                </AlertDialogCancel>
                                <AlertDialogAction type="submit" name="action">
                                    승락
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </Form>
                    </AlertDialogContent>
                </AlertDialog>
            )}
            {isEditing ? (
                <Form
                    method="post"
                    onSubmit={() => {
                        setIsEditing(false);
                        setIsDeleting(false);
                    }}
                    encType={isFilePage ? 'multipart/form-data' : 'application/x-www-form-urlencoded'}
                >
                    <div className="space-y-4 text-foreground">
                        <input
                            type="hidden"
                            name="actionType"
                            value={wiki && shouldCreateEditRequest(isDeleting ? 'delete' : name !== title ? 'move' : 'edit') ? 'create_edit_request' : 'update'}
                        />
                        <input type="hidden" name="title" value={title} />
                        <input type="hidden" name="isDeleting" value={isDeleting ? '1' : '0'} />

                        <Input name="log" placeholder={isDeleting ? '삭제 로그 작성...' : '편집 로그 작성...'} />
                        {isDeleting || <Textarea name="content" defaultValue={wiki?.content || ''} className="w-full h-64 p-2" placeholder="문서 내용 작성..." />}
                        {isFilePage && <FileInput accept="image" name="file" />}
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    setIsEditing(false);
                                    setIsDeleting(false);
                                    setTitle(name);
                                }}
                            >
                                취소
                            </Button>
                            <Button type="submit">
                                {wiki && shouldCreateEditRequest(isDeleting ? 'delete' : name !== title ? 'move' : 'edit') ? '편집 요청' : isDeleting ? '삭제' : '저장'}
                            </Button>
                        </div>
                    </div>
                </Form>
            ) : (
                <div className="max-w-none">
                    {wiki && !wiki.deleted ? (
                        <>
                            {wiki.file && <img src={wiki.file.url} className="m-4 h-40 rounded-lg" />}
                            {isRAW ? (
                                <pre className="p-2 rounded-lg bg-gray-100 text-wrap">{wiki.content}</pre>
                            ) : parse ? (
                                <Suspense fallback={''}>
                                    <Await resolve={parse}>{(parse) => <div className="wiki" dangerouslySetInnerHTML={{__html: parse.value}} />}</Await>
                                </Suspense>
                            ) : null}
                        </>
                    ) : !forbidden ? (
                        <div className="text-center py-12">
                            <p className="text-gray-600 mb-4">이 문서는 아직 존재하지 않습니다.</p>
                            <Button onClick={() => setIsEditing(true)}>문서 생성</Button>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-600 mb-4">읽기 권한이 부족합니다.</p>
                        </div>
                    )}
                </div>
            )}

            {!isEditing && (
                <Suspense fallback={''}>
                    <Await resolve={backlinks}>
                        {(backlinks) =>
                            backlinks.length > 0 && (
                                <div className="mt-8">
                                    <div className="flex items-center gap-2 mb-4 text-gray-800 font-medium">
                                        <ArrowUpRight className="h-4 w-4" />
                                        <span>이 분류에 속해있는 다른 문서</span>
                                    </div>
                                    <div className="h-px bg-gray-200 mb-3" />
                                    <ul className="space-y-1">
                                        {backlinks.map((backlink) => {
                                            if (!backlink) return null;
                                            const name = JoinName(backlink.from.namespace, backlink.from.title);

                                            return (
                                                <li key={name} className="group">
                                                    <Link to={`/wiki/${urlEncoding(name)}`} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors">
                                                        <span className="text-gray-600 group-hover:text-gray-900">{name}</span>
                                                        <ArrowUpRight className={cn('h-4 w-4 text-gray-400', 'opacity-0 group-hover:opacity-100 transition-opacity ml-auto')} />
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )
                        }
                    </Await>
                </Suspense>
            )}
        </Frame>
    );
}
