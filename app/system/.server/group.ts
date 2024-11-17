import {prisma} from '~/db.server';

export class Group {
    public static async findUserGroups(userId?: number, ipAddress?: string) {
        const groupUsers = await prisma.groupUsers.findMany({
            where: {
                AND: [{OR: [{userId: userId || null}, {ip: ipAddress || null}]}, {OR: [{expiration: null}, {expiration: {gt: Math.floor(Date.now() / 1000)}}]}],
            },
            include: {
                group: true,
            },
        });

        return groupUsers.map((gu) => gu.group);
    }

    public static async isInGroup(groupName: string, userId?: number, ipAddress?: string) {
        const count = await prisma.groupUsers.count({
            where: {
                group: {
                    name: groupName,
                },
                AND: [
                    {
                        OR: [{userId: userId || null}, {ip: ipAddress || null}],
                    },
                    {
                        OR: [{expiration: null}, {expiration: {gt: Math.floor(Date.now() / 1000)}}],
                    },
                ],
            },
        });

        return count > 0;
    }

    public static async addToGroup(
        groupName: string,
        options: {
            userId?: number;
            ipAddress?: string;
            expiration?: number;
        },
    ) {
        const group = await prisma.group.findFirst({
            where: {name: groupName},
        });

        if (!group) {
            throw new Error(`Group ${groupName} not found`);
        }

        await prisma.groupUsers.create({
            data: {
                groupId: group.id,
                userId: options.userId || null,
                ip: options.ipAddress || null,
                expiration: options.expiration || null,
            },
        });
    }

    public static async removeFromGroup(groupName: string, userId?: number, ipAddress?: string) {
        const group = await prisma.group.findFirst({
            where: {name: groupName},
        });

        if (!group) {
            throw new Error(`Group ${groupName} not found`);
        }

        await prisma.groupUsers.deleteMany({
            where: {
                groupId: group.id,
                OR: [{userId: userId || null}, {ip: ipAddress || null}],
            },
        });
    }

    public static async createGroup(name: string, note: string = ''): Promise<void> {
        await prisma.group.create({
            data: {
                name,
                note,
            },
        });
    }
}
