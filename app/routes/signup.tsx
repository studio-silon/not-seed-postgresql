import React, {useState} from 'react';
import {Form, useLoaderData} from '@remix-run/react';
import {Button} from '../stories/Button';
import {Input} from '../stories/Input';
import {Eye, EyeOff} from 'lucide-react';
import {commitSession, getSession, getUser} from '../utils/sessions.server';
import {LoaderFunctionArgs, redirect} from '@remix-run/node';
import {getCookie, setCookie} from '~/utils/cookies.server';
import metaTitle from '~/utils/meta';
import {User} from '~/system/.server/user';
import {Site} from '~/system/.server/site';
import {Textarea} from '~/stories/Textarea';
import Checkbox from '~/stories/Checkbox';

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
    const {title, needToken, termsAndConditions} = useLoaderData<typeof loader>();
    const [showPassword, setShowPassword] = useState(false);

    const [agree, setAgree] = useState(false);

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-sm space-y-8">
                <h1 className="text-2xl font-medium text-center">Sign up to {title}</h1>

                <Form method="post" className="space-y-4">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm mb-1">약관</label>
                            <Textarea value={termsAndConditions} className="h-52" />
                        </div>

                        <div>
                            <Checkbox variant="primary" size="sm" label="동의합니다." checked={agree} onChange={() => setAgree(!agree)} />
                        </div>

                        {needToken && (
                            <div>
                                <label className="block text-sm mb-1">토큰</label>
                                <Input type="text" name="token" placeholder="토큰 입력" required />
                            </div>
                        )}

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

                        <Button type="submit" variant="primary" size="md" className="w-full" disabled={!agree}>
                            가입
                        </Button>

                        <div className="text-center text-sm">
                            이미 계정이 있으신가요?{' '}
                            <a href="/login" className="text-blue-600 hover:underline">
                                로그인
                            </a>
                        </div>
                    </div>
                </Form>
            </div>
        </div>
    );
}
