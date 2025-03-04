import React from 'react';
import {ActionFunctionArgs,json, LoaderFunctionArgs} from '@remix-run/node';
import {Form, Link,useLoaderData} from '@remix-run/react';

import {ArrowLeft, Save} from 'lucide-react';

import {Button} from '~/components/ui/button';
import {Input} from '~/components/ui/input';
import {Textarea} from '~/components/ui/textarea';

import {Frame} from '~/components/frame';

import {Site} from '@/system/site';
import {User} from '@/system/user';

import {prisma} from '~/db.server';
import metaTitle from '~/utils/meta';
import {getUser} from '~/utils/sessions.server';

export const meta = metaTitle<typeof loader>(() => `Site Settings`);

export async function loader({request}: LoaderFunctionArgs) {
    const user = await getUser(request);

    if (!(await User.checkPermission('admin', user))) {
        throw new Response('Forbidden', {status: 403});
    }

    const siteInfo = await Site.getInfo();
    return json({siteInfo});
}

export async function action({request}: ActionFunctionArgs) {
    const user = await getUser(request);

    if (!user || !(await User.checkPermission('admin', user))) {
        throw new Response('Forbidden', {status: 403});
    }

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const footer = formData.get('footer') as string;
    const token = formData.get('token') as string;
    const termsAndConditions = formData.get('termsAndConditions') as string;
    const frontPage = formData.get('frontPage') as string;

    await prisma.siteInfo.updateMany({
        data: {
            title,
            description,
            footer,
            token,
            termsAndConditions,
            frontPage,
        },
    });

    return null;
}

export default function SettingsRoute() {
    const {siteInfo} = useLoaderData<typeof loader>();

    return (
        <Frame>
            <div className="flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">사이트 설정</h1>
                    <Link to="/wiki">
                        <Button variant="ghost" size="sm" className="size-8 p-0">
                            <ArrowLeft className="h-4 w-4 m-auto" />
                        </Button>
                    </Link>
                </div>

                <div className="space-y-6">
                    <Form method="post" className="space-y-6">
                        <div className="grid gap-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">사이트 제목</label>
                                <Input type="text" name="title" defaultValue={siteInfo.title} placeholder="사이트 제목을 입력하세요" required />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">사이트 설명</label>
                                <Input type="text" name="description" defaultValue={siteInfo.description} placeholder="사이트 설명을 입력하세요" required />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">푸터 내용</label>
                                <Input type="text" name="footer" defaultValue={siteInfo.footer} placeholder="푸터 내용을 입력하세요" required />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">가입 토큰</label>
                                <Input type="text" name="token" defaultValue={siteInfo.token} placeholder="가입 토큰을 입력하세요" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">약관</label>
                                <Textarea name="termsAndConditions" className="h-52" defaultValue={siteInfo.termsAndConditions} placeholder="약관을 입력하세요" required />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">대문 페이지</label>
                                <Input type="text" name="frontPage" defaultValue={siteInfo.frontPage} placeholder="대문 페이지 이름을 입력하세요" required />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" className="flex items-center gap-2">
                                <Save className="w-4 h-4" /> 저장하기
                            </Button>
                        </div>
                    </Form>
                </div>
            </div>
        </Frame>
    );
}
