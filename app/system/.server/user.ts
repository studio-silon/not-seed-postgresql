import {prisma} from '~/db.server';
import bcrypt from 'bcryptjs';
import {Prisma} from '@prisma/client';
import {getUser} from '~/utils/sessions.server';

export type PermissionsType =
    | 'admin'
    | 'revoke_admin'
    | 'update_thread_status'
    | 'nsacl'
    | 'hide_thread_comment'
    | 'grant'
    | 'update_thread'
    | 'aclgroup'
    | 'hide_document'
    | 'hide_rever'
    | 'batch_rever';

export class User {
    public static async signup(username: string, password: string) {
        const user = await prisma.user.findUnique({
            where: {
                username,
            },
        });

        if (user) return false;

        return await prisma.user.create({
            data: {
                username,
                password: await bcrypt.hash(password, 10),
            },
        });
    }

    public static async signin(username: string, password: string) {
        const user = await prisma.user.findUnique({
            where: {
                username,
            },
        });

        if (!user) return false;

        return await new Promise((res: (type: typeof user | false) => void) =>
            bcrypt.compare(password, user?.password || '', async (err, result) => {
                if (result) {
                    res(user);
                } else {
                    res(false);
                }
            }),
        );
    }

    public static async checkPermission(permission: PermissionsType, user: Prisma.PromiseReturnType<typeof getUser>) {
        if (!user) return false;

        const permissions = user.permissions.map((p) => p.type);

        return !!user.siteInfo || (permission !== 'revoke_admin' && permissions.includes('admin')) || permissions.includes(permission);
    }
}
