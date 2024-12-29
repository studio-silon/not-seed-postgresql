import type {LoaderFunction, LoaderFunctionArgs,MetaFunction, SerializeFrom} from '@remix-run/node';

import type {loader as rootLoader} from '~/root';

type LoaderFunction1 =
    | LoaderFunction
    | ((args: LoaderFunctionArgs & {params: {'*': string}}) => ReturnType<LoaderFunction>)
    | ((args: LoaderFunctionArgs & {params: {id: string}}) => ReturnType<LoaderFunction>)
    | ((args: LoaderFunctionArgs & {params: {id: string; page: string}}) => ReturnType<LoaderFunction>);

export default function metaTitle<LoaderType extends LoaderFunction1>(
    cb: (data: SerializeFrom<LoaderType>, rootData: SerializeFrom<typeof rootLoader>) => string,
): MetaFunction<LoaderType, {root: typeof rootLoader}> {
    return ({data, matches}) => {
        const root = matches[0];

        if (!root || !root?.data) return [];

        const siteInfo = root.data.site;

        const title = data ? cb(data, root.data) : '';

        return [{title: title ? title + ' - ' + siteInfo.title : siteInfo.title}];
    };
}
