import {useState} from 'react';
import {json, LoaderFunctionArgs, redirect} from '@remix-run/node';
import {Form, Link, useLoaderData, useParams} from '@remix-run/react';

import {ArrowLeft} from 'lucide-react';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '~/components/ui/alert-dialog';
import {Button} from '~/components/ui/button';
import {Input} from '~/components/ui/input';

import {Frame} from '~/components/frame';
import {ReverMiniDiff} from '~/components/rever-mini-diff';
import {UserPopover} from '~/components/user-popover';

import backLinkInit from '@/parser/backlink.server';
import {Acl} from '@/system/acl';
import {User} from '@/system/user';
import {Wiki} from '@/system/wiki';

import {getCookie, setCookie} from '~/utils/cookies.server';
import metaTitle from '~/utils/meta';
import {getUser, getUserData} from '~/utils/sessions.server';
import {urlEncoding} from '~/utils/url-encoding';
import {ReverTypeToMessage} from '~/utils/wiki';
import {JoinName} from '~/utils/wiki';

export const meta = metaTitle<typeof loader>(({data}) => (data.wiki ? '역사: ' + JoinName(data.wiki.namespace, data.wiki.title) : ''));

export async function loader({params, request}: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const [namespace, title] = Wiki.splitName(params['*'] || '');
    const historyData = await Wiki.getHistory(namespace, title, page);
    const userData = await getUserData(request);
    const user = await getUser(request);

    if (!historyData) {
        throw new Response('Page not found', {status: 404});
    }

    if (!(await Acl.isAllowed(historyData.wiki, user, userData, 'read'))) {
        throw new Response('Forbidden', {status: 403});
    }

    return json({data: historyData, canRemoveRever: await User.checkPermission('remove_rever', user)});
}

export async function action({request, params}: {request: Request; params: {'*': string}}) {
    const formData = await request.formData();
    const [namespace, title] = Wiki.splitName(params['*']);
    const rever = formData.get('rever') as string;
    const log = formData.get('log') as string;
    const actionType = formData.get('actionType') as string;
    const userData = await getUserData(request);
    const user = await getUser(request);
    const cookie = await getCookie(request);

    const wiki = await Wiki.getPage(namespace, title);

    if (!wiki) {
        throw new Response('Not found', {status: 404});
    }

    if (!(await Acl.isAllowed(wiki, user, userData, 'read'))) {
        throw new Response('Forbidden', {status: 403});
    }

    if (!(await Acl.isAllowed(wiki, user, userData, 'edit'))) {
        throw new Response('Forbidden', {status: 403});
    }

    if (rever && !isNaN(+rever)) {
        if (actionType === 'removeRever') {
            if (!user || !(await User.checkPermission('remove_rever', user))) {
                throw new Response('Forbidden', {status: 403});
            }

            await Wiki.removeRever(namespace, title, +rever);

            cookie.toast = {
                type: 'success',
                message: '리버전 삭제를 성공했습니다.',
            };

            return redirect('/recentChanges/' + urlEncoding(params['*']), {
                headers: [['Set-Cookie', await setCookie(cookie)]],
            });
        }

        if (await Wiki.revertPage(namespace, title, +rever, log || '', userData)) {
            backLinkInit(wiki);

            return redirect(`/wiki/${urlEncoding(params['*'])}`);
        }
    }

    cookie.toast = {
        type: 'error',
        message: '되돌리기를 실패했습니다.',
    };

    return redirect('/history/' + urlEncoding(params['*']), {
        headers: [['Set-Cookie', await setCookie(cookie)]],
    });
}

export default function HistoryPage() {
    const {
        data: {wiki, totalPages},
        canRemoveRever,
    } = useLoaderData<typeof loader>();
    const params = useParams();
    const [currentPage, setCurrentPage] = useState(1);
    const [isOpen, setIsOpen] = useState(false);
    const [isRemoveReverOpen, setIsRemoveReverOpen] = useState(false);
    const [rever, setRever] = useState(0);

    return (
        <Frame>
            <div className="flex flex-col">
                <AlertDialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
                    <AlertDialogContent>
                        <Form method="post" onSubmit={() => setIsOpen(false)}>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    <b>r{rever}</b> 버전으로 되돌리기
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    <input type="hidden" name="rever" value={rever} />
                                    <Input name="log" className="mt-2 mb-4" placeholder="편집 로그 작성..." />
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>취소</AlertDialogCancel>
                                <AlertDialogAction type="submit">되돌리기</AlertDialogAction>
                            </AlertDialogFooter>
                        </Form>
                    </AlertDialogContent>
                </AlertDialog>

                {canRemoveRever && (
                    <AlertDialog open={isRemoveReverOpen} onOpenChange={(open) => setIsRemoveReverOpen(open)}>
                        <AlertDialogContent>
                            {' '}
                            <Form method="post" onSubmit={() => setIsRemoveReverOpen(false)}>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        <b>r{rever}</b> 영구 삭제
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        <input type="hidden" name="actionType" value="removeRever" />
                                        <input type="hidden" name="rever" value={rever} />
                                        <p className="text-sm text-muted-foreground">
                                            이 작업은 이 위키에서 영구적으로 해당 리버전을 삭제하며, 되돌릴 수 없습니다. 신중하게 선택하세요.
                                        </p>
                                        <p className="text-sm text-muted-foreground mb-4">많은 경우, ACL이나 되돌리기 기능이 더 효과적일 수 있습니다.</p>
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>취소</AlertDialogCancel>
                                    <AlertDialogAction type="submit">영구 삭제</AlertDialogAction>
                                </AlertDialogFooter>
                            </Form>
                        </AlertDialogContent>
                    </AlertDialog>
                )}

                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">{params['*']}의 역사</h1>
                    <Link to={`/wiki/${params['*']}`}>
                        <Button variant="ghost" size="sm" className="size-8 p-0">
                            <ArrowLeft className="h-4 w-4 m-auto" />
                        </Button>
                    </Link>
                </div>

                <div>
                    {wiki.versions.map((version) => (
                        <div key={version.id} className="border-b border-border p-4 hover:bg-muted">
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2">
                                    <Link to={`/wiki/${params['*']}?rever=${version.rever}`} className="font-medium text-blue-600 hover:underline">
                                        r{version.rever}
                                    </Link>
                                    {version.type !== 0 && <span className="text-sm text-gray-500">{ReverTypeToMessage(version)}</span>}
                                    <ReverMiniDiff rever={version} />
                                </div>
                                <div className="ml-auto sm:ml-0 flex items-center gap-2">
                                    {version.rever > 1 && (
                                        <>
                                            <Link to={`/diff/${params['*']}?original=${version.rever - 1}&modified=${version.rever}`}>
                                                <Button variant="ghost" size="sm">
                                                    비교
                                                </Button>
                                            </Link>
                                            <Link to={`/blame/${params['*']}?rev=${version.rever}`}>
                                                <Button variant="ghost" size="sm">
                                                    Blame
                                                </Button>
                                            </Link>
                                        </>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setRever(version.rever);
                                            setIsOpen(true);
                                        }}
                                    >
                                        되돌리기
                                    </Button>
                                    {canRemoveRever && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setRever(version.rever);
                                                setIsRemoveReverOpen(true);
                                            }}
                                        >
                                            영구 삭제
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {version.log && <p className="mt-1 text-sm text-gray-600">{version.log}</p>}
                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:justify-start justify-between">
                                <UserPopover username={version.user?.username} ip={version.ipAddress ?? '0.0.0.0'} />
                                <span className="mx-2 hidden sm:inline">•</span>
                                <span>{new Date(version.createdAt).toLocaleString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-6">
                    <Button variant="ghost" disabled={currentPage <= 1} onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}>
                        이전
                    </Button>
                    <span>
                        페이지 {currentPage} / {totalPages}
                    </span>
                    <Button variant="ghost" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}>
                        다음
                    </Button>
                </div>
            </div>
        </Frame>
    );
}
