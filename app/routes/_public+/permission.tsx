import React from 'react';
import {json, LoaderFunctionArgs, ActionFunctionArgs} from '@remix-run/node';
import {useLoaderData, Form, Link} from '@remix-run/react';
import {Button} from '~/components/ui/button';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '~/components/ui/select';
import {Frame} from '~/components/frame';
import {getUser, getUserData} from '~/utils/sessions.server';
import {ArrowLeft, Plus, Trash2} from 'lucide-react';
import metaTitle from '~/utils/meta';
import {permissions} from '~/system/user';
import {Combobox} from '~/components/combobox';
import {useUserSearch} from '~/utils/useUserSearch';
import {prisma} from '~/db.server';
import {User} from '~/system/.server/user';
import {Input} from '~/components/ui/input';

export const meta = metaTitle<typeof loader>(() => `Permission Management`);

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
                className="w-52"
                placeholder="Search users..."
            />
            <input type="hidden" name="userId" value={selectedUser?.id || ''} />
        </>
    );
}

export async function loader({request}: LoaderFunctionArgs) {
    const user = await getUser(request);

    if (!(await User.checkPermission('grant', user))) {
        throw new Response('Forbidden', {status: 403});
    }

    const allPermissions = await prisma.permission.findMany({
        include: {
            user: true,
        },
    });

    return json({allPermissions, canAdmin: !!user?.siteInfo || (await User.checkPermission('admin', user))});
}

export async function action({request}: ActionFunctionArgs) {
    const formData = await request.formData();
    const action = formData.get('_action') as string;
    const user = await getUser(request);
    const userData = await getUserData(request);

    const canAdmin = !!user?.siteInfo || (await User.checkPermission('admin', user));

    if (!user || !(await User.checkPermission('grant', user))) {
        throw new Response('Forbidden', {status: 403});
    }

    if (action === 'add') {
        const userId = parseInt(formData.get('userId') as string);
        const type = formData.get('type') as string;
        const log = formData.get('log') as string;

        if (type === 'admin' && !canAdmin) {
            throw new Response('Forbidden', {status: 403});
        }

        await prisma.permission.create({
            data: {
                userId,
                type,
                log,
            },
        });

        await prisma.permissionHistory.create({
            data: {
                targetUser: {
                    connect: {
                        id: userId,
                    },
                },
                action: type,
                type: 1,
                user: {
                    connect: {
                        id: user.id,
                    },
                },
                log,
            },
        });
    } else if (action === 'delete') {
        const id = parseInt(formData.get('id') as string);

        const target = await prisma.permission.findUnique({
            where: {id},
            include: {
                user: {
                    include: {
                        permissions: true,
                    },
                },
            },
        });

        if (!target) return null;

        if (target.user.permissions.map((p) => p.type).includes('admin')) {
            if (!(await User.checkPermission('revoke_admin', user))) return null;
        }

        await prisma.permission.delete({
            where: {id},
        });

        await prisma.permissionHistory.create({
            data: {
                targetUser: {
                    connect: {
                        id: target.user.id,
                    },
                },
                action: target.type,
                type: 2,
                user: {
                    connect: {
                        id: user.id,
                    },
                },
            },
        });
    }

    return null;
}

export default function PermissionRoute() {
    const {allPermissions, canAdmin} = useLoaderData<typeof loader>();

    return (
        <Frame>
            <div className="flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">권한 관리</h1>
                    <Link to="/wiki">
                        <Button variant="ghost" size="sm" className="size-8 p-0">
                            <ArrowLeft className="h-4 w-4 m-auto" />
                        </Button>
                    </Link>
                </div>

                <div className="space-y-6">
                    <Form method="post" className="flex flex-wrap gap-4 items-end border-b pb-6">
                        <input type="hidden" name="_action" value="add" />

                        <div className="space-y-2">
                            <label className="text-sm font-medium">User</label>
                            <UserSearch />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Permission Type</label>
                            <Select name="type" defaultValue="group">
                                <SelectTrigger className="w-52">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(permissions)
                                        .filter(([type]) => type !== 'admin' || canAdmin)
                                        .map(([key, label]) => (
                                            <SelectItem value={key} key={key}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Log Message</label>
                            <Input type="text" name="log" className="w-52" placeholder="Reason for permission change..." />
                        </div>

                        <Button type="submit" className="flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Add Permission
                        </Button>
                    </Form>

                    <div className="space-y-4">
                        {allPermissions.map((permission) => (
                            <div key={permission.id} className="flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/50 rounded-lg">
                                <div className="space-y-1">
                                    <div className="text-sm font-medium">
                                        {permission.user.username} - {permissions[permission.type as keyof typeof permissions]}
                                    </div>
                                    <div className="text-sm text-muted-foreground">{permission.log}</div>
                                </div>
                                <Form method="post">
                                    <input type="hidden" name="_action" value="delete" />
                                    <input type="hidden" name="id" value={permission.id} />
                                    <Button type="submit" variant="ghost" size="sm" className="text-red-600 hover:text-red-700 size-8 p-0">
                                        <Trash2 className="w-4 h-4 m-auto" />
                                    </Button>
                                </Form>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Frame>
    );
}
