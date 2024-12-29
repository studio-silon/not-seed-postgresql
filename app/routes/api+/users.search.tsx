import {json, type LoaderFunctionArgs} from '@remix-run/node';

import {prisma} from '~/db.server';

export async function loader({request}: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';

    const users = await prisma.user.findMany({
        where: {username: {contains: query}},
        take: 10,
        orderBy: {
            username: 'asc',
        },
        select: {
            id: true,
            username: true,
        },
    });

    return json({users});
}
