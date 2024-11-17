import {prisma} from '~/db.server';

export class Site {
    public static async getInfo() {
        const info = await prisma.siteInfo.findFirst({
            where: {},
            cacheStrategy: {
                ttl: 60,
                swr: 30,
            },
        });

        if (!info) throw new Error('먼저 bun run seed를 해주세요.');

        return info;
    }

    public static async getInfoForUser() {
        const info = await prisma.siteInfo.findFirst({
            where: {},
            cacheStrategy: {
                ttl: 60,
                swr: 30,
            },
            select: {
                title: true,
                description: true,
                footer: true,
                frontPage: true,
            },
        });

        if (!info) throw new Error('먼저 bun run seed를 해주세요.');

        return info;
    }
}
