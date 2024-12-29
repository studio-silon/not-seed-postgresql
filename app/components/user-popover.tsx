import {Link, useFetcher, useRouteLoaderData} from '@remix-run/react';

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
import {Button} from '~/components/ui/button';
import {Input} from '~/components/ui/input';
import {Popover, PopoverContent, PopoverTrigger} from '~/components/ui/popover';

import type {loader as RootLoader} from '../root';

import {urlEncoding} from '~/utils/url-encoding';

export function UserPopover({className = '', username, ip}: {className?: string; username?: string; ip: string}) {
    const root = useRouteLoaderData<typeof RootLoader>('root');
    const fetcher = useFetcher();

    return (
        <>
            <AlertDialog>
                <Popover>
                    <PopoverTrigger asChild>
                        <span className={className}>{username || ip}</span>
                    </PopoverTrigger>
                    <PopoverContent className="flex flex-row p-2 gap-2">
                        <Link to={username ? '/contribution/user/' + urlEncoding(username) : '/contribution/ip/' + ip}>
                            <Button variant="ghost">기여 내역</Button>
                        </Link>
                        {username && (
                            <Link to={'/wiki/사용자:' + urlEncoding(username)}>
                                <Button variant="ghost">사용자 문서 보기</Button>
                            </Link>
                        )}
                        {(root.user?.siteInfo || root.user?.permissions.map((p: {type: string}) => p.type).includes('admin')) && (
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">차단</Button>
                            </AlertDialogTrigger>
                        )}
                    </PopoverContent>
                </Popover>
                <AlertDialogContent>
                    <fetcher.Form method="post" action="/group/">
                        <AlertDialogHeader>
                            <AlertDialogTitle>{username || ip} 차단</AlertDialogTitle>
                            <AlertDialogDescription>
                                <input type="hidden" name="_action" value="add_member" />
                                <input type="hidden" name="groupId" value={1} />
                                {username ? <input type="hidden" name="username" value={username} /> : <input type="hidden" name="ip" value={ip} />}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">사유</label>
                                    <Input name="log" className="mt-2" placeholder="차단 로그 작성..." value="긴급 차단" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">기간</label>
                                    <Input type="datetime-local" name="expiration" className="w-52" />
                                </div>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>취소</AlertDialogCancel>
                            <AlertDialogAction type="submit">차단</AlertDialogAction>
                        </AlertDialogFooter>
                    </fetcher.Form>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
