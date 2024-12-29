import {Wiki} from '@/system/wiki';

import {Renderer} from './src';

import {SplitName} from '~/utils/wiki';

export default new Renderer(
    async (name) => {
        const [namespace, title] = SplitName(name);

        const page = await Wiki.getPage(namespace, title);

        return page ? {content: page.content} : null;
    },
    async (name) => {
        const page = await Wiki.getPage('파일', name);

        if (!page) return null;

        return page.file ? {width: page.file.width, height: page.file.height, url: page.file.url} : null;
    },
);
