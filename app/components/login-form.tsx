import React, {useState} from 'react';
import {Form, useLoaderData, useRouteLoaderData} from '@remix-run/react';
import {cn} from '~/lib/utils';
import {Button} from '~/components/ui/button';
import {Card, CardContent} from '~/components/ui/card';
import {Input} from '~/components/ui/input';
import {Label} from '~/components/ui/label';
import {Eye, EyeOff} from 'lucide-react';
import type {loader as RootLoader} from '../root';
import {Checkbox} from './ui/checkbox';
import {Textarea} from './ui/textarea';

interface LoginFormProps extends React.ComponentProps<'div'> {
    type: 'login' | 'signup' | 'edit';
    initialData?: {
        username?: string;
    };
}

export function LoginForm({type, className, initialData, ...props}: LoginFormProps) {
    const root = useRouteLoaderData<typeof RootLoader>('root');
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [agree, setAgree] = useState(false);

    const isLogin = type === 'login';
    const isEdit = type === 'edit';

    let signupData = null;
    if (!isLogin && !isEdit) {
        signupData = useLoaderData<{
            title: string;
            needToken: boolean;
            termsAndConditions: string;
        }>();
    }

    return (
        <div className={cn('flex flex-col gap-6', className)} {...props}>
            <Card className="overflow-hidden border-none md:border shadow-none md:shadow">
                <CardContent className="p-0">
                    <Form method="post" className="p-0 md:p-6 sm:p-8">
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center text-left">
                                <h1 className="text-2xl font-bold">
                                    {isLogin ? 'Sign in to' : isEdit ? 'Edit Profile' : 'Sign up to'} {isLogin ? root?.site.title : signupData?.title}
                                </h1>
                            </div>

                            {!isLogin && !isEdit && (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="terms">약관</Label>
                                        <Textarea id="terms" value={signupData?.termsAndConditions} readOnly className="h-52" />
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="agree" checked={agree} onCheckedChange={(checked) => setAgree(checked as boolean)} />
                                        <Label htmlFor="agree" className="text-sm font-normal">
                                            동의합니다.
                                        </Label>
                                    </div>

                                    {signupData?.needToken && (
                                        <div className="grid gap-2">
                                            <Label htmlFor="token">토큰</Label>
                                            <Input id="token" name="token" type="text" placeholder="토큰 입력" required />
                                        </div>
                                    )}
                                </>
                            )}

                            <div className="grid gap-2">
                                <Label htmlFor="username">아이디</Label>
                                <Input id="username" name="username" type="text" placeholder="아이디 입력" required defaultValue={initialData?.username} readOnly={isEdit} />
                            </div>

                            {/*isEdit && (
                                <div className="grid gap-2">
                                    <Label htmlFor="currentPassword">현재 비밀번호</Label>
                                    <div className="relative">
                                        <Input
                                            id="currentPassword"
                                            name="currentPassword"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="현재 비밀번호 입력"
                                            required
                                            className="pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                            )*/}

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">{isEdit ? '새 비밀번호' : '비밀번호'}</Label>
                                    {isLogin && (
                                        <a href="#" className="ml-auto text-sm underline-offset-2 hover:underline">
                                            비밀번호를 잊으셨나요?
                                        </a>
                                    )}
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        name="password"
                                        type={isEdit ? (showNewPassword ? 'text' : 'password') : showPassword ? 'text' : 'password'}
                                        placeholder={isEdit ? '새 비밀번호 입력' : '비밀번호 입력'}
                                        required={!isEdit}
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => (isEdit ? setShowNewPassword(!showNewPassword) : setShowPassword(!showPassword))}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {(isEdit ? showNewPassword : showPassword) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <Button type="submit" className="w-full" disabled={!isLogin && !isEdit && !agree}>
                                {isLogin ? '로그인' : isEdit ? '수정' : '가입'}
                            </Button>

                            {/*isLogin && (
                                <>
                                    <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                                        <span className="relative z-10 bg-background px-2 text-muted-foreground">Or continue with</span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <Button variant="outline" className="w-full">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 98 96">
                                                <path
                                                    fillRule="evenodd"
                                                    clipRule="evenodd"
                                                    d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"
                                                    fill="#24292f"
                                                />
                                            </svg>
                                            <span className="sr-only">Continue with Github</span>
                                        </Button>
                                        <Button variant="outline" className="w-full">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                                <path
                                                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                                                    fill="currentColor"
                                                />
                                            </svg>
                                            <span className="sr-only">Continue with Google</span>
                                        </Button>
                                        <Button variant="outline" className="w-full">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 127.14 96.36">
                                                <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
                                            </svg>
                                            <span className="sr-only">Continue with Discord</span>
                                        </Button>
                                    </div>
                                </>
                            )*/}

                            {!isEdit && (
                                <div className="text-center text-sm">
                                    {isLogin ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}{' '}
                                    <a href={isLogin ? '/signup' : '/login'} className="underline underline-offset-4 hover:text-primary">
                                        {isLogin ? '가입' : '로그인'}
                                    </a>
                                </div>
                            )}
                        </div>
                    </Form>
                </CardContent>
            </Card>
            {!isLogin && !isEdit && (
                <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
                    By clicking continue, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
                </div>
            )}
        </div>
    );
}
