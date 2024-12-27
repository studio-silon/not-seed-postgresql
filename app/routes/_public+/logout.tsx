import {commitSession, getSession, getUser} from '../../utils/sessions.server';
import {LoaderFunctionArgs, redirect} from '@remix-run/node';
import {getCookie, setCookie} from '~/utils/cookies.server';
import metaTitle from '~/utils/meta';

export const meta = metaTitle(() => '로그아웃');

export async function loader({request}: LoaderFunctionArgs) {
    const session = await getSession(request.headers.get('Cookie'));
    const cookie = await getCookie(request);
    if (!(await getUser(request))) {
        cookie.toast = {
            type: 'error',
            message: '로그인되어있지 않습니다.',
        };

        return redirect('/', {
            headers: [['Set-Cookie', await setCookie(cookie)]],
        });
    }

    session.unset('userId');

    cookie.toast = {
        type: 'success',
        message: '로그아웃을 성공했습니다!',
    };

    return redirect('/', {
        headers: [
            ['Set-Cookie', await commitSession(session)],
            ['Set-Cookie', await setCookie(cookie)],
        ],
    });
}
