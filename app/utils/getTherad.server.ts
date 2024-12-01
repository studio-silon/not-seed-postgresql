import {prisma} from '~/db.server';
import {Acl} from '~/system/.server/acl';
import {User} from '~/system/.server/user';
import {getUser, getUserData} from '~/utils/sessions.server';

const pageSize = 8;

export async function getThread(request: Request, id: number, page: number) {
    const user = await getUser(request);
    const userData = await getUserData(request);

    const skip = (page - 1) * pageSize;

    const thread = await prisma.discussion.findUnique({
        where: {
            id: id,
        },
        include: {
            comments: {
                orderBy: {createdAt: 'asc'},
                skip,
                take: pageSize,
                select: {
                    id: true,
                    type: true,
                    content: true,
                    createdAt: true,
                    hidden: true,
                    hiddenBy: true,
                    hiddenAt: true,
                    user: {
                        select: {
                            username: true,
                        },
                    },
                    ipAddress: true,
                },
            },
            wiki: {
                select: {
                    title: true,
                    namespace: true,
                    id: true,
                    acls: true,
                },
            },
        },
    });

    if (!thread) {
        throw new Response('Not Found', {status: 404});
    }

    if (!(await Acl.isAllowed(thread.wiki, user, userData, 'read'))) {
        throw new Response('Forbidden', {status: 403});
    }

    const totalComments = await prisma.comment.count({
        where: {
            discussionId: id,
        },
    });

    const hasNextPage = totalComments > skip + pageSize;

    return {
        thread,
        totalComments,
        hasNextPage,
        currentPage: page,
        canUpdateState: await User.checkPermission('update_thread_status', user),
        canUpdateThread: await User.checkPermission('update_thread', user),
        canHideComments: await User.checkPermission('hide_thread_comment', user),
    };
}
