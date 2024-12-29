import {Wiki} from '@/system/wiki';

import renderer from './namumark.server';
import parse from './src';

import {prisma} from '~/db.server';

export default async function backLinkInit(page: {id: number; namespace: string; title: string; content: string}) {
    let data: {value: string; backlinks: {name: string; type: 'category' | 'link' | 'image' | 'include' | 'redirect'}[]; categories: string[]};

    try {
        data = await renderer.run(Wiki.joinName(page.namespace, page.title), parse(page.content));
    } catch (err) {
        console.error('위키 파싱 오류:', err);

        return;
    }

    let match: RegExpMatchArray | null;

    if ((match = /^(#(redirect|넘겨주기)|### 리다이렉션) (.*)$/gm.exec(page.content))) {
        data.backlinks.push({type: 'redirect', name: match[3]});
    }

    await prisma.backlink.deleteMany({
        where: {
            fromId: page.id,
        },
    });

    await Promise.all(
        data.backlinks.map(async (backlink) => {
            await prisma.backlink.create({
                data: {
                    from: {
                        connect: {
                            id: page.id,
                        },
                    },
                    to: backlink.name,
                    type: backlink.type,
                },
            });
        }),
    );
}
