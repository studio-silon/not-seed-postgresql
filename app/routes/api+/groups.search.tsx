import {json, type LoaderFunctionArgs} from '@remix-run/node';

import {prisma} from '~/db.server';

export async function loader({request}: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';

    const groups = await prisma.group.findMany({
        where: {name: {contains: query}},
        take: 10,
        orderBy: {
            name: 'asc',
        },
        select: {
            id: true,
            name: true,
        },
    });

    return json({groups});
}
