import {json, type ActionFunctionArgs} from '@remix-run/node';
import {getSession, commitSession, getUserData} from '~/utils/sessions.server';
import parser from '@/parser/markup.server';

export async function action({request}: ActionFunctionArgs) {
    const session = await getSession(request.headers.get('Cookie'));

    const form = await request.formData();
    const content = String(form.get('content') || '');
    let data: {value: string};

    const userData = await getUserData(request);

    try {
        data = await parser('미리 보기', '특수', content, userData);
    } catch (err) {
        console.error(err);

        data = {value: '<span class="wiki-error">Error</span>'};
    }

    return json(data);
}
