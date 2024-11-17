import {ActionFunctionArgs, LoaderFunctionArgs} from '@remix-run/node';
import {meta, loader as wikiLoader, action as wikiAction} from './wiki.$';
import Index from './wiki.$';
import {Site} from '~/system/.server/site';

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
