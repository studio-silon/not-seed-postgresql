import {LoaderFunctionArgs, redirect} from '@remix-run/node';

import {LoginForm} from '~/components/login-form';

import {User} from '@/system/user';

import {getSession, getUser} from '../../utils/sessions.server';

import {getCookie, setCookie} from '~/utils/cookies.server';
import metaTitle from '~/utils/meta';

export const meta = metaTitle(() => 'Edit Profile');

export async function loader({request}: LoaderFunctionArgs) {
    const user = await getUser(request);

    if (!user) {
        const cookie = await getCookie(request);
        cookie.toast = {
            type: 'error',
            message: '로그인이 필요합니다.',
        };

        return redirect('/login', {
            headers: [['Set-Cookie', await setCookie(cookie)]],
        });
    }

    return {user};
}

export async function action({request}: LoaderFunctionArgs) {
    const formData = await request.formData();
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    const session = await getSession(request.headers.get('Cookie'));
    const cookie = await getCookie(request);

    const userId = session.get('userId');
    if (!userId) {
        cookie.toast = {
            type: 'error',
            message: '사용자 정보가 없습니다.',
        };
        return redirect('/login', {
            headers: [['Set-Cookie', await setCookie(cookie)]],
        });
    }

    const updatedUser = await User.update(userId, {username, password});

    if (!updatedUser) {
        cookie.toast = {
            type: 'error',
            message: '프로필 업데이트에 실패했습니다.',
        };
        return redirect('/edit', {
            headers: [['Set-Cookie', await setCookie(cookie)]],
        });
    }

    cookie.toast = {
        type: 'success',
        message: '계정이 성공적으로 업데이트되었습니다!',
    };
    return redirect('/', {
        headers: [['Set-Cookie', await setCookie(cookie)]],
    });
}

export default function EditUser() {
    return <LoginForm type="edit" />;
}
