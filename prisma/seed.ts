import {prisma} from '~/db.server';
import {User} from '@/system/user';

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
