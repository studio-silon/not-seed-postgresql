import React, {useState} from 'react';
import {Form, useRouteLoaderData} from '@remix-run/react';
import {Card} from '../stories/Card';
import {Button} from '../stories/Button';
import {Input} from '../stories/Input';
import {Lock, Mail, Eye, EyeOff, UserIcon} from 'lucide-react';
import {commitSession, getSession, getUser} from '../utils/sessions.server';
import {LoaderFunctionArgs, redirect} from '@remix-run/node';
import {getCookie, setCookie} from '~/utils/cookies.server';
import {User} from '~/system/.server/user';
import metaTitle from '~/utils/meta';
import type {loader as RootLoader} from '../root';

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
    const root = useRouteLoaderData<typeof RootLoader>('root');
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-sm space-y-8">
                <h1 className="text-2xl font-medium text-center">Sign in to {root?.site.title}</h1>

                <Form method="post" className="space-y-4">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm mb-1">아이디</label>
                            <Input type="text" name="username" placeholder="아이디 입력" required />
                        </div>

                        <div>
                            <label className="block text-sm mb-1">비밀번호</label>
                            <div className="relative">
                                <Input type={showPassword ? 'text' : 'password'} name="password" placeholder="비밀번호 입력" className="pr-10" required />
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
                            로그인
                        </Button>

                        <div className="text-center text-sm">
                            계정이 없으신가요?{' '}
                            <a href="/signup" className="text-blue-600 hover:underline">
                                가입
                            </a>
                        </div>
                    </div>
                </Form>
            </div>
        </div>
    );
}
