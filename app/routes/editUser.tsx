import React, {useState} from 'react';
import {Form, useLoaderData} from '@remix-run/react';
import {Button} from '../stories/Button';
import {Input} from '../stories/Input';
import {Eye, EyeOff} from 'lucide-react';
import {LoaderFunctionArgs, redirect} from '@remix-run/node';
import {getUser, commitSession, getSession} from '../utils/sessions.server';
import {User} from '~/system/.server/user';
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
    const {user} = useLoaderData<typeof loader>();
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-sm space-y-8">
                <h1 className="text-2xl font-medium text-center">Edit Profile</h1>

                <Form method="post" className="space-y-4">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm mb-1">아이디</label>
                            <Input type="text" name="username" placeholder="아이디 입력" defaultValue={user.username} required />
                        </div>

                        <div>
                            <label className="block text-sm mb-1">비밀번호</label>
                            <div className="relative">
                                <Input type={showPassword ? 'text' : 'password'} name="password" placeholder="새 비밀번호 입력" className="pr-10" />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <Button type="submit" variant="primary" size="md" className="w-full">
                            업데이트
                        </Button>

                        <div className="text-center text-sm">
                            <a href="/" className="text-blue-600 hover:underline">
                                돌아가기
                            </a>
                        </div>
                    </div>
                </Form>
            </div>
        </div>
    );
}
