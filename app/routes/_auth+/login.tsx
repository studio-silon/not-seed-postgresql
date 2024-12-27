import {commitSession, getSession, getUser} from '../../utils/sessions.server';
import {LoaderFunctionArgs, redirect} from '@remix-run/node';
import {getCookie, setCookie} from '~/utils/cookies.server';
import {User} from '~/system/.server/user';
import metaTitle from '~/utils/meta';
import {LoginForm} from '~/components/login-form';

export const meta = metaTitle(() => '로그인');

export async function loader({request}: LoaderFunctionArgs) {
    const cookie = await getCookie(request);
    if (await getUser(request)) {
        cookie.toast = {
            type: 'error',
            message: '이미 로그인되있습니다.',
        };

        return redirect('/', {
            headers: [['Set-Cookie', await setCookie(cookie)]],
        });
    }

    return null;
}

export async function action({request, params}: {request: Request; params: {'*': string}}) {
    const formData = await request.formData();
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    const session = await getSession(request.headers.get('Cookie'));
    const cookie = await getCookie(request);

    if (request.method === 'POST') {
        const user = await User.signin(username, password);

        if (!user) {
            cookie.toast = {
                type: 'error',
                message: '로그인을 실패했습니다.',
            };

            return redirect('/login', {
                status: IS_SKIN_MODE ? 400 : 302,
                headers: [['Set-Cookie', await setCookie(cookie)]],
            });
        }

        session.set('userId', user.id);

        cookie.toast = {
            type: 'success',
            message: '로그인이 성공했습니다!',
        };

        return redirect('/', {
            headers: [
                ['Set-Cookie', await commitSession(session)],
                ['Set-Cookie', await setCookie(cookie)],
            ],
        });
    }

    return null;
}

export default function Login() {
    return <LoginForm type="login" />;
}
