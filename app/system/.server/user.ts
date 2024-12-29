import {Prisma} from '@prisma/client';
import bcrypt from 'bcryptjs';

import {prisma} from '~/db.server';
import {getUser} from '~/utils/sessions.server';

export type PermissionsType =
    | 'admin'
    | 'revoke_admin'
    | 'update_thread_status'
    | 'delete_thread'
    | 'nsacl'
    | 'group'
    | 'hide_thread_comment'
    | 'grant'
    | 'update_thread'
    | 'aclgroup'
    | 'remove_rever'
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

    public static async update(userId: number, data: {username?: string; password?: string}) {
        const updateData: {username?: string; password?: string} = {};

        if (data.username) {
            updateData.username = data.username;
        }

        if (data.password) {
            updateData.password = await bcrypt.hash(data.password, 10);
        }

        return await prisma.user.update({
            where: {id: userId},
            data: updateData,
        });
    }

    public static async checkPermission(permission: PermissionsType, user: Prisma.PromiseReturnType<typeof getUser>) {
        if (!user) return false;

        const permissions = user.permissions.map((p) => p.type);

        return !!user.siteInfo || (permission !== 'revoke_admin' && permissions.includes('admin')) || permissions.includes(permission);
    }
}
