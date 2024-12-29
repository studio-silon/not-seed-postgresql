import {PrismaClient} from '@prisma/client';
import {withAccelerate} from '@prisma/extension-accelerate';

function MakePrismaClient() {
    return new PrismaClient().$extends(withAccelerate());
}

let prisma: ReturnType<typeof MakePrismaClient>;

declare global {
    // eslint-disable-next-line no-var
    var __db__: ReturnType<typeof MakePrismaClient>;
}

if (process.env.NODE_ENV === 'production') {
    prisma = MakePrismaClient();
} else {
    if (!global.__db__) {
        global.__db__ = MakePrismaClient();
    }
    prisma = global.__db__;
    prisma.$connect();
}

export {prisma};
