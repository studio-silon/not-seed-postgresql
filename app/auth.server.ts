import {Authenticator} from 'remix-auth';
import {FormStrategy} from 'remix-auth-form';
import {GitHubStrategy} from 'remix-auth-github';
import {GoogleStrategy} from 'remix-auth-google';
import {DiscordStrategy} from 'remix-auth-discord';
import {sessionStorage} from './utils/sessions.server';
import {User} from '~/system/.server/user';
import {prisma} from './db.server';
import bcrypt from 'bcryptjs';

// 나중에 할거

type AuthUser = {
    id: number;
    username: string;
};

export const authenticator = new Authenticator<AuthUser>();

authenticator.use(
    new FormStrategy(async ({form}) => {
        const username = form.get('username') as string;
        const password = form.get('password') as string;

        const user = await User.signin(username, password);
        if (!user) {
            throw new Error('Invalid credentials');
        }

        return {
            id: user.id,
            username: user.username,
        };
    }),
    'user-pass',
);

async function handleSocialLogin(provider: string, providerId: string, username: string) {
    const existingSocialAccount = await prisma.socialAccount.findUnique({
        where: {providerId},
        include: {user: true},
    });

    if (existingSocialAccount) {
        return existingSocialAccount.user;
    }

    let finalUsername = username;
    let counter = 1;

    while (await prisma.user.findUnique({where: {username: finalUsername}})) {
        finalUsername = `${username}${counter}`;
        counter++;
    }

    return prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                username: finalUsername,
                password: await bcrypt.hash(Math.random().toString(36), 10),
            },
        });

        await tx.socialAccount.create({
            data: {
                provider,
                providerId,
                userId: user.id,
            },
        });

        return user;
    });
}
