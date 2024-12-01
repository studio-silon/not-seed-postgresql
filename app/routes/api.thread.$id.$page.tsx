import {LoaderFunctionArgs, json} from '@remix-run/node';
import {getThread} from '~/utils/getTherad.server';

export async function loader({request, params}: LoaderFunctionArgs & {params: {id: string; page: string}}) {
    return json(await getThread(request, +params['id'], +params['page']));
}
