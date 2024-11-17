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
import {Button} from '~/stories/Button';
import {History, Edit2, Star, Wrench, Anchor, Tag, X, Trash2, MessageSquare, ArrowUpRight} from 'lucide-react';
import {useState, Suspense, useEffect} from 'react';
import {Textarea} from '~/stories/Textarea';
import {getUser, getUserData} from '~/utils/sessions.server';
import {urlEncoding} from '~/utils/url-encoding';
import {Input} from '~/stories/Input';
import {Site} from '@/system/site';
import {Frame} from '~/components/Frame';
import metaTitle from '~/utils/meta';
import {JoinName} from '~/utils/wiki';
import Popover from '~/stories/Popover';
import {Toggle} from '~/stories/Toggle';
import {cn} from '~/utils/classMerge';
import {Acl} from '~/system/.server/acl';
import FileInput from '~/stories/FileInput';
import {promisify} from 'util';
import sizeOf from 'image-size';
import path from 'path';
import {prisma} from '~/db.server';
import parser from '@/parser/markup.server';
import backLinkInit from '@/parser/backlink.server';
import {Badge} from '~/stories/Badge';

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
        return json({wiki: null, parse: null, backlinks: [], name: params['*'], forbidden: true});
    }

    return defer({
        wiki,
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

    const wiki = await Wiki.getPage(namespace, oldTitle);
    let wikiId = wiki?.id;

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
    const {wiki, backlinks, name, parse, forbidden} = useLoaderData<typeof loader>();
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isRAW, setIsRAW] = useState(false);
    const [title, setTitle] = useState(name);

    useEffect(() => {
        setTitle(name);
    }, [name]);

    const isFilePage = title.startsWith('파일:') && !isDeleting;

    return (
        <Frame>
            <div className="flex flex-col mb-2 gap-2 bg-white rounded-lg p-4 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        {isEditing ? (
                            <input
                                type="text"
                                name="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="text-2xl lg:text-3xl font-bold text-gray-900 border-b border-gray-300 focus:border-gray-600 focus:outline-none w-full"
                            />
                        ) : (
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{title}</h1>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="size-8 p-0">
                            <Star className="h-4 w-4 m-auto" />
                        </Button>
                        <Toggle onClick={() => setIsEditing(!isEditing)} isActive={isEditing}>
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
                                <Toggle onClick={() => setIsDeleting(!isDeleting)} isActive={isDeleting}>
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
                                    <Toggle onClick={() => setIsRAW(!isRAW)} isActive={isRAW}>
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
                                                <Badge variant="secondary" className="hover:bg-gray-100 transition-colors">
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
            {isEditing ? (
                <Form
                    method="post"
                    onSubmit={() => {
                        setIsEditing(false);
                        setIsDeleting(false);
                    }}
                    encType={isFilePage ? 'multipart/form-data' : 'application/x-www-form-urlencoded'}
                >
                    <div className="space-y-4">
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
                            <Button type="submit">{isDeleting ? '삭제' : '저장'}</Button>
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
                                <div className="mt-8 bg-white rounded-lg p-4 shadow-sm">
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
                                                    <Link to={`/wiki/${urlEncoding(name)}`} className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50 transition-colors">
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
