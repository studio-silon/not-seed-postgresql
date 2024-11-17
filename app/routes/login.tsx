import React, {useState} from 'react';
import {Form} from '@remix-run/react';
import {Card} from '../stories/Card';
import {Button} from '../stories/Button';
import {Input} from '../stories/Input';
import {Lock, Mail, Eye, EyeOff, UserIcon} from 'lucide-react';
import {commitSession, getSession, getUser} from '../utils/sessions.server';
import {LoaderFunctionArgs, redirect} from '@remix-run/node';
import {getCookie, setCookie} from '~/utils/cookies.server';
import {User} from '~/system/.server/user';
import metaTitle from '~/utils/meta';

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
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50/5 backdrop-blur px-4">
            <Card className="w-full max-w-md bg-white/5 backdrop-blur border border-secondary-300/20">
                <Card.Header className="space-y-2">
                    <Card.Title className="text-2xl font-semibold text-center text-brand">I am Not Seed</Card.Title>
                    <Card.Description className="text-center text-secondary-600">Welcome back! Please login to your account.</Card.Description>
                </Card.Header>

                <Card.Content>
                    <Form className="space-y-4" method="post">
                        <div className="space-y-2">
                            <div className="relative">
                                <Input type="text" name="username" placeholder="아이디" className="pl-10" required leftIcon={<UserIcon size={16} />} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="relative">
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    placeholder="비밀번호"
                                    className="pl-10 pr-10"
                                    required
                                    leftIcon={<Lock size={16} />}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <a href="/forgot-password" className="text-brand hover:underline">
                                비밀번호 찾기
                            </a>
                        </div>

                        <Button type="submit" className="w-full bg-brand hover:bg-brand/90">
                            로그인
                        </Button>
                    </Form>
                </Card.Content>

                <Card.Footer className="flex flex-col space-y-4 text-center">
                    <div className="text-sm text-gray-600">
                        아직 계정이 없으신가요?{' '}
                        <a href="/signup" className="text-brand hover:underline">
                            회원가입
                        </a>
                    </div>
                </Card.Footer>
            </Card>
        </div>
    );
}
