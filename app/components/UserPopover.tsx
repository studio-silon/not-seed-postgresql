import {Form, Link, useFetcher, useRouteLoaderData} from '@remix-run/react';
import type {loader as RootLoader} from '../root';
import Popover from '~/stories/Popover';
import {Button} from '~/stories/Button';
import {urlEncoding} from '~/utils/url-encoding';
import Dialog from '~/stories/Dialog';
import {Input} from '~/stories/Input';
import {useState} from 'react';

export function UserPopover({className = '', username, ip}: {className?: string; username?: string; ip: string}) {
    const root = useRouteLoaderData<typeof RootLoader>('root');
    const [isOpen, setIsOpen] = useState(false);
    const fetcher = useFetcher();

    return (
        <>
            <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <fetcher.Form method="post" action="/group/">
                    <Dialog.Title>{username || ip} 차단</Dialog.Title>
                    <Dialog.Content className="space-y-4">
                        <input type="hidden" name="_action" value="add_member" />
                        <input type="hidden" name="groupId" value={1} />
                        {username ? <input type="hidden" name="username" value={username} /> : <input type="hidden" name="ip" value={ip} />}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">사유</label>
                            <Input name="log" className="mt-2" placeholder="차단 로그 작성..." value="긴급 차단" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">기간</label>
                            <Input type="datetime-local" name="expiration" className="w-48" />
                        </div>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onClick={() => setIsOpen(false)} variant="ghost">
                            취소
                        </Button>
                        <Button type="submit" onClick={() => setIsOpen(false)}>
                            차단
                        </Button>
                    </Dialog.Actions>
                </fetcher.Form>
            </Dialog>
            <Popover>
                <Popover.Trigger asChild>
                    <span className={className}>{username || ip}</span>
                </Popover.Trigger>
                <Popover.Content className="flex flex-row p-2 gap-2">
                    <Link to={username ? '/contribution/user/' + urlEncoding(username) : '/contribution/ip/' + ip}>
                        <Button variant="ghost">기여 내역</Button>
                    </Link>
                    {username && (
                        <Link to={'/wiki/사용자:' + urlEncoding(username)}>
                            <Button variant="ghost">사용자 문서 보기</Button>
                        </Link>
                    )}
                    {(root.user.siteInfo || root.user.permissions.map((p) => p.type).includes('admin')) && (
                        <Button variant="danger" onClick={() => setIsOpen(true)}>
                            차단
                        </Button>
                    )}
                </Popover.Content>
            </Popover>
        </>
    );
}
