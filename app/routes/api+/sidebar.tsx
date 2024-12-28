import {json, LoaderFunctionArgs} from '@remix-run/node';
import {prisma} from '~/db.server';

export async function loader({request}: LoaderFunctionArgs) {
    const changes = await prisma.wiki.findMany({
        take: 10,
        orderBy: {
            updatedAt: 'desc',
        },
        select: {
            id: true,
            rever: true,
            namespace: true,
            title: true,
            versions: {
                take: 1,
                orderBy: {
                    createdAt: 'desc',
                },
                select: {
                    user: {
                        select: {
                            username: true,
                        },
                    },
                    added: true,
                    removed: true,
                    log: true,
                    createdAt: true,
                    ipAddress: true,
                    type: true,
                    data: true,
                },
            },
        },
    });

    return json(changes);
}
