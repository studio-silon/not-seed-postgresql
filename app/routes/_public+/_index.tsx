import {ActionFunctionArgs, LoaderFunctionArgs} from '@remix-run/node';

import {Site} from '@/system/site';

import {action as wikiAction, loader as wikiLoader, meta} from './wiki.$';
import Index from './wiki.$';

export {meta};

export async function loader(args: LoaderFunctionArgs) {
    const {frontPage} = await Site.getInfoForUser();

    const newArgs = Object.assign({}, args, {params: {'*': frontPage}});

    return await wikiLoader(newArgs);
}

export async function action(args: ActionFunctionArgs) {
    const {frontPage} = await Site.getInfoForUser();

    const newArgs = Object.assign({}, args, {params: {'*': frontPage}});

    return await wikiAction(newArgs);
}

export default Index;
