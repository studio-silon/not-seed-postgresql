import renderer from './namumark.server';
import parse from './src';

import {JoinName} from '~/utils/wiki';

export default async function markup(title: string, namespace: string, content: string): Promise<string> {
    try {
        const ast = parse(content);

        const data = await renderer.run(JoinName(namespace, title), ast);

        return data.value;
    } catch (err) {
        return '';
    }
}
