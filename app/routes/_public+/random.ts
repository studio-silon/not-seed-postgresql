import {redirect} from '@remix-run/node';

import {prisma} from '~/db.server';
import {urlEncoding} from '~/utils/url-encoding';
import {JoinName} from '~/utils/wiki';

export async function loader() {
    const totalRecords = await prisma.wiki.count();

    const randomOffset = Math.floor(Math.random() * totalRecords);

    const randomPage = await prisma.wiki.findMany({
        take: 1,
        skip: randomOffset,
    });

    return redirect('/wiki/' + urlEncoding(JoinName(randomPage[0].namespace, randomPage[0].title)));
}
