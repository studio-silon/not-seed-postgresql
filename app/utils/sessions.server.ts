import {Session, createCookie, createCookieSessionStorage, createFileSessionStorage, redirect} from '@remix-run/node';
import {prisma} from '~/db.server';
import {UserData} from '~/system/.server/wiki';

export type SessionData = {
    userId: number;
};

export type SessionFlashData = {
    error: string;
};

const sessionCookie = createCookie('PHPSESSID', {
    secrets: ['s3cret1'],
    sameSite: 'lax',
    httpOnly: true,
});

export const {getSession, commitSession, destroySession} = createFileSessionStorage<SessionData, SessionFlashData>({
    dir: '/app/session',
    cookie: sessionCookie,
});

export type SessionType = Session<SessionData, SessionFlashData>;

export async function getUserSession(request: Request) {
    const session = await getSession(request.headers.get('Cookie'));
    return session;
}

export async function getUser(request: Request) {
    const session = await getUserSession(request);
    const userId = session.get('userId');
    if (!userId) return null;

    return prisma.user.findUnique({
        where: {id: userId},
        include: {
            permissions: true,
            siteInfo: {
                select: {
                    id: true,
                },
            },
        },
    });
}

export async function requireUser(request: Request) {
    const user = await getUser(request);
    if (!user) {
        throw redirect('/login');
    }
    return user;
}

export async function getUserData(request: Request): Promise<UserData> {
    const session = await getUserSession(request);
    const userId = session.get('userId');

    const ips = request.headers.get('X-Forwarded-For')?.split(', ');

    return {userId, ipAddress: (ips && ips[ips?.length - 1]) || '0.0.0.0'};
}