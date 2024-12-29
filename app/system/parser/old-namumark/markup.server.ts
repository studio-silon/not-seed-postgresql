import {UserData} from '@/system/wiki';

import renderer from './namumark.server';
import parse from './src';

import {prisma} from '~/db.server';
import {JoinName, SplitName} from '~/utils/wiki';

export default async function markup(title: string, namespace: string, content: string, userData: UserData) {
    let match: RegExpMatchArray | null;
    if ((match = /^(#(redirect|넘겨주기)|### 리다이렉션) (.*)$/gm.exec(content))) {
        return {
            type: 'redirect',
            value: match[3] || '',
        };
    }

    const ast = parse('\n' + content);

    const data = await renderer.run(JoinName(namespace, title), ast, {
        id: userData.userId
            ? (
                  await prisma.user.findUnique({
                      where: {
                          id: userData.userId,
                      },
                      select: {
                          username: true,
                      },
                  })
              )?.username || ''
            : '',
        ip: userData.ipAddress || '0.0.0.0',
    });

    return {
        value: data.value,
        categories: data.categories,
        backlinks: data.backlinks.map((backlink) => {
            const [namespace, title] = SplitName(backlink.name);

            return {
                type: backlink.type,
                namespace,
                title,
            };
        }),
    };
}
