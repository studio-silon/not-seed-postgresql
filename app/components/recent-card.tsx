import {useEffect} from 'react';
import {Link, useFetcher} from '@remix-run/react';

import {loader} from '../routes/api+/sidebar';

import {Frame} from './frame';

import {urlEncoding} from '~/utils/url-encoding';
import {JoinName} from '~/utils/wiki';

function ElapsedTime({date, className = ''}: {date: number; className?: string}) {
    const isHydrated = typeof window !== 'undefined';

    const now = new Date();
    const secondsAgo = Math.floor((now.getTime() - date) / 1000);

    if (!isHydrated) return <time dateTime={String(date)} className={className} />;

    return (
        <time dateTime={String(date)} className={className}>
            {secondsAgo < 5
                ? '방금 전'
                : secondsAgo < 60
                  ? `${secondsAgo}초 전`
                  : secondsAgo < 3600
                    ? `${Math.floor(secondsAgo / 60)}분 전`
                    : secondsAgo < 86400
                      ? `${Math.floor(secondsAgo / 3600)}시간 전`
                      : secondsAgo < 604800
                        ? `${Math.floor(secondsAgo / 86400)}일 전`
                        : secondsAgo < 2592000
                          ? `${Math.floor(secondsAgo / 604800)}주 전`
                          : secondsAgo < 31536000
                            ? `${Math.floor(secondsAgo / 2592000)}달 전`
                            : `${Math.floor(secondsAgo / 31536000)}년 전`}
        </time>
    );
}

export function RecentCard() {
    const fetcher = useFetcher<typeof loader>();

    useEffect(() => {
        fetcher.load('/api/sidebar');

        const timer = setInterval(() => fetcher.load('/api/sidebar'), 1000 * 30);

        return () => clearInterval(timer);
    }, []);

    return (
        <Frame>
            <div className="flex">
                <h3 className="text-lg font-semibold">최근 변경</h3>
            </div>
            <div className="flex flex-col gap-1 mt-4">
                {fetcher.data &&
                    fetcher.data
                        .filter((change) => change.versions[0])
                        .map((change) => (
                            <div key={change.id} className="p-1.5 hover:bg-muted/50 flex justify-between align-center gap-4 rounded-md">
                                <Link to={`/wiki/${urlEncoding(JoinName(change.namespace, change.title))}`} className="text-sm text-blue-600 hover:underline">
                                    {JoinName(change.namespace, change.title)}
                                </Link>
                                <div className="text-xs text-muted-foreground">
                                    <ElapsedTime date={+new Date(change.versions[0].createdAt)} />
                                </div>
                            </div>
                        ))}
            </div>
        </Frame>
    );
}
