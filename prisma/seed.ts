import {User} from '@/system/user';

import {prisma} from '~/db.server';

async function main() {
    const user = await User.signup('admin', 'admin');
    if (!user) throw new Error("You don't need to seeding");

    await prisma.siteInfo.deleteMany();

    await prisma.siteInfo.create({
        data: {
            title: 'I am Not Seed',
            description: 'My Site Description',
            footer: '2031 Not Seed(?????)',
            token: '',
            owner: {
                connect: {
                    id: user.id,
                },
            },
        },
    });

    await prisma.group.createMany({
        data: [
            {
                name: '차단된 사용자',
                note: '차단된 사용자 그룹',
            },
        ],
    });

    console.log('Seeding completed');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
