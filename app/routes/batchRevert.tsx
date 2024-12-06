import React, {useState} from 'react';
import {Form, json, useLoaderData, useNavigation} from '@remix-run/react';
import {Button} from '~/stories/Button';
import {Input} from '~/stories/Input';
import {Frame} from '~/components/Frame';
import {ArrowLeft, Save} from 'lucide-react';
import {Link} from '@remix-run/react';
import {Wiki} from '~/system/.server/wiki';
import {User} from '~/system/.server/user';
import {ActionFunctionArgs, LoaderFunctionArgs} from '@remix-run/node';
import {getIP, getUser, getUserData} from '~/utils/sessions.server';
import {useUserSearch} from '~/utils/useUserSearch';
import {Combobox} from '~/stories/Combobox';
import {prisma} from '~/db.server';

export async function loader({request}: LoaderFunctionArgs) {
    const user = await getUser(request);

    if (!user || !(await User.checkPermission('batch_rever', user))) {
        throw new Response('Forbidden', {status: 403});
    }

    return null;
}

export async function action({request}: ActionFunctionArgs) {
    const user = await getUser(request);

    if (!user || !(await User.checkPermission('batch_rever', user))) {
        throw new Response('Forbidden', {status: 403});
    }

    const formData = await request.formData();
    const expiration = Number(formData.get('expiration'));
    const log = String(formData.get('log') || '');
    const userId = Number(formData.get('userId'));
    const ipAddress = String(formData.get('ip'));

    const result = await Wiki.batchRevert({
        expiration,
        userData: await getUserData(request),
        log,
        userId,
        ipAddress,
    });

    if (
        await prisma.user.findUnique({
            where: {id: userId},
            select: {id: true},
        })
    ) {
        await prisma.permissionHistory.create({
            data: {
                targetUser: {
                    connect: {
                        id: userId,
                    },
                },
                target: '' + new Date(expiration),
                action: 'batchRevert',
                type: 1,
                user: {
                    connect: {
                        id: user.id,
                    },
                },
                log,
            },
        });
    } else {
        await prisma.permissionHistory.create({
            data: {
                targetIp: ipAddress,
                target: '' + new Date(expiration),
                action: 'batchRevert',
                type: 1,
                user: {
                    connect: {
                        id: user.id,
                    },
                },
                log,
            },
        });
    }

    return json(result);
}

function UserSearch() {
    const {selectedUser, setSelectedUser, setSearchTerm, users} = useUserSearch();

    return (
        <>
            <Combobox
                value={selectedUser}
                onChange={setSelectedUser}
                options={users}
                displayValue={(user) => user?.username || ''}
                setSearchTerm={setSearchTerm}
                className="flex flex-1 w-full"
                placeholder="Search users..."
            />
            <input type="hidden" name="userId" value={selectedUser?.id || ''} />

            <Input type="text" name="ip" placeholder="IP 주소" disabled={selectedUser !== null} />
        </>
    );
}

export default function BatchRevertRoute() {
    const result = useLoaderData<typeof action>();

    return (
        <Frame>
            <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2 bg-white rounded-lg p-4 shadow-sm">
                    <h1 className="text-2xl font-bold">일괄 되돌리기 및 숨김</h1>
                    <Link to="/admin">
                        <Button variant="ghost" size="sm" className="size-8 p-0">
                            <ArrowLeft className="h-4 w-4 m-auto" />
                        </Button>
                    </Link>
                </div>

                <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
                    <Form method="post" className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">사용자</label>
                                <div className="flex gap-2 w-full">
                                    <UserSearch />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">기간</label>
                                <Input type="datetime-local" name="expiration" className="w-52" />
                                <p className="text-sm text-gray-500">지정된 일 수부터 해당 사용자의 모든 행위가 숨겨집니다.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">로그</label>
                                <Input type="text" name="log" className="w-52" />
                            </div>
                        </div>

                        <Button variant="danger" className="flex items-center gap-2" type="submit">
                            <Save className="w-4 h-4" /> 일괄 되돌리기 및 숨김
                        </Button>

                        {result && (
                            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
                                <h3 className="font-bold text-green-700">일괄 복귀 결과</h3>
                                <ul className="list-disc pl-5">
                                    <li>되돌리기된 페이지: {result.pagesReverted}</li>
                                    <li>숨겨진 댓글: {result.commentsHidden}</li>
                                    <li>되돌리기 실패: {result.revertFailures}</li>
                                </ul>
                            </div>
                        )}
                    </Form>
                </div>
            </div>
        </Frame>
    );
}
