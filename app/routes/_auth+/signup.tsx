import {LoaderFunctionArgs, redirect} from '@remix-run/node';

import {LoginForm} from '~/components/login-form';

import {Site} from '@/system/site';
import {User} from '@/system/user';

import {commitSession, getSession, getUser} from '../../utils/sessions.server';

import {getCookie, setCookie} from '~/utils/cookies.server';
import metaTitle from '~/utils/meta';

export const meta = metaTitle(() => '회원가입');

export async function loader({request}: LoaderFunctionArgs) {
    if (await getUser(request)) {
        return redirect('/');
    }

    const siteInfo = await Site.getInfo();

    return {title: siteInfo.title, needToken: siteInfo.token !== '', termsAndConditions: siteInfo.termsAndConditions};
}

export async function action({request, params}: {request: Request; params: {'*': string}}) {
    const session = await getSession(request.headers.get('Cookie'));
    const cookie = await getCookie(request);
    const formData = await request.formData();
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const token = formData.get('token') as string;

    const siteInfo = await Site.getInfo();

    if (siteInfo.token !== '' && token !== siteInfo.token) {
        cookie.toast = {
            type: 'error',
            message: '회원가입을 실패했습니다.',
        };

        return redirect('/signup', {
            status: IS_SKIN_MODE ? 400 : 302,
            headers: [['Set-Cookie', await setCookie(cookie)]],
        });
    }

    const user = await User.signup(username, password);
    if (!user) {
        cookie.toast = {
            type: 'error',
            message: '회원가입을 실패했습니다.',
        };

        return redirect('/signup', {
            status: IS_SKIN_MODE ? 400 : 302,
            headers: [['Set-Cookie', await setCookie(cookie)]],
        });
    }

    session.set('userId', user.id);

    cookie.toast = {
        type: 'success',
        message: '회원가입이 성공했습니다!',
    };

    return redirect('/', {
        headers: [
            ['Set-Cookie', await commitSession(session)],
            ['Set-Cookie', await setCookie(cookie)],
        ],
    });
}

export default function Login() {
    return <LoginForm type="signup" />;
}
