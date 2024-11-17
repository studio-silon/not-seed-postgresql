import {json, LoaderFunctionArgs} from '@remix-run/node';
import {Link, useLoaderData} from '@remix-run/react';
import {Frame} from '~/components/Frame';
import {prisma} from '~/db.server';
import {Button} from '~/stories/Button';
import {JoinName} from '~/utils/wiki';

export async function loader({request}: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const keyword = url.searchParams.get('keyword') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = 50;

    const searchResults = await prisma.wiki.findMany({
        take: pageSize,
        skip: (page - 1) * pageSize,
        where: {
            deleted: false,
            OR: [{namespace: {contains: keyword}}, {title: {contains: keyword}}, {content: {contains: keyword}}],
        },
        select: {
            id: true,
            namespace: true,
            title: true,
            rever: true,
        },
    });

    const count = await prisma.wiki.count({
        where: {
            deleted: false,
            OR: [{title: {contains: keyword}}, {content: {contains: keyword}}],
        },
    });
    const totalPages = Math.ceil(count / pageSize);

    return json({searchResults, keyword, page, totalPages});
}

export default function Search() {
    const {searchResults, keyword, page, totalPages} = useLoaderData<typeof loader>();

    return (
        <Frame>
            <div className="flex flex-col">
                <div className="flex items-center justify-between mb-6 bg-white rounded-lg p-4 shadow-sm">
                    <h1 className="text-2xl font-bold">검색{keyword ? ` '${keyword}'` : ''}</h1>
                </div>
                <div className="bg-white rounded-lg shadow-sm">
                    {searchResults.map((result) => (
                        <div key={result.id} className="border-b border-gray-100 p-4 hover:bg-gray-50">
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2">
                                    <Link to={`/wiki/${JoinName(result.namespace, result.title)}`} className="font-medium text-blue-600 hover:underline">
                                        {JoinName(result.namespace, result.title)}
                                    </Link>
                                    <Link to={`/wiki/${JoinName(result.namespace, result.title)}?rever=${result.rever}`} className="text-sm text-gray-500">
                                        r{result.rever}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {totalPages > 1 && (
                    <div className="flex justify-between mt-4">
                        {page > 1 && (
                            <Link to={`?keyword=${keyword}&page=${page - 1}`}>
                                <Button variant="ghost">이전</Button>
                            </Link>
                        )}
                        <span className="py-2">
                            {page} / {totalPages}
                        </span>
                        {page < totalPages && (
                            <Link to={`?keyword=${keyword}&page=${page + 1}`}>
                                <Button variant="ghost">다음</Button>
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </Frame>
    );
}
