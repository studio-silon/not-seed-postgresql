import React, {useState} from 'react';
import {json, LoaderFunctionArgs, ActionFunctionArgs} from '@remix-run/node';
import {useLoaderData, useParams, Form, Link} from '@remix-run/react';
import {Wiki} from '@/system/wiki';
import {Acl} from '@/system/acl';
import {Button} from '~/components/ui/button';
import {Select} from '~/components/ui/select';
import {Input} from '~/components/ui/input';
import {Frame} from '~/components/frame';
import {getUser, getUserData} from '~/utils/sessions.server';
import {ArrowLeft, Plus, Trash2} from 'lucide-react';
import metaTitle from '~/utils/meta';
import {acls} from '~/system/acl';
import {MiniTab} from '~/~/components/ui/textarea/MiniTab';
import {permissions} from '~/system/user';
import {Combobox} from '~/~/components/ui/textarea/Combobox';
import {useUserSearch} from '~/utils/useUserSearch';
import {prisma} from '~/db.server';
import {useGroupSearch} from '~/utils/useGroupSearch';

export const meta = metaTitle<typeof loader>((data) => `ACL - ${data.wiki?.title || ''}`);

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

            <input type="hidden" name="condition" value={selectedUser?.username || ''} />
        </>
    );
}

function GroupSearch() {
    const {selectedGroup, setSelectedGroup, setSearchTerm, groups} = useGroupSearch();

    return (
        <>
            <Combobox
                value={selectedGroup}
                onChange={setSelectedGroup}
                options={groups}
                displayValue={(group) => group?.name || ''}
                setSearchTerm={setSearchTerm}
                className="w-52"
                placeholder="Search groups..."
            />

            <input type="hidden" name="condition" value={selectedGroup?.name || ''} />
        </>
    );
}

export async function loader({request, params}: LoaderFunctionArgs & {params: {'*': string}}) {
    const [namespace, title] = Wiki.splitName(params['*']);
    const wiki = await Wiki.getPage(namespace, title);
    const user = await getUser(request);
    const userData = await getUserData(request);

    if (!wiki) {
        throw new Response('Not Found', {status: 404});
    }

    const acls = await Wiki.getAcls(namespace, title);

    const canManageAcl = await Acl.isAllowed(wiki, user, userData, 'acl');

    return json({wiki, acls, canManageAcl});
}

export async function action({request, params}: ActionFunctionArgs & {params: {'*': string}}) {
    const formData = await request.formData();
    const [namespace, title] = Wiki.splitName(params['*']);
    const action = formData.get('_action') as string;

    const wiki = await Wiki.getPage(namespace, title);
    const user = await getUser(request);
    const userData = await getUserData(request);

    if (!wiki) {
        throw new Response('Not Found', {status: 404});
    }

    const canManageAcl = await Acl.isAllowed(wiki, user, userData, 'acl');
    if (!canManageAcl) {
        throw new Response('Forbidden', {status: 403});
    }

    if (action === 'add') {
        const conditionType = formData.get('conditionType') as string;
        const condition = formData.get('condition') as string;
        const aclType = formData.get('type') as string;
        const range = formData.get('range') as string;
        const allow = formData.get('allow') === 'true';

        if (range === 'document') {
            await Wiki.addAcl(namespace, title, {
                condition_type: conditionType,
                condition,
                type: aclType,
                action: allow,
            });
        } else if (range === 'namespace') {
            await Wiki.addNamespaceAcl(namespace, {
                condition_type: conditionType,
                condition,
                type: aclType,
                action: allow,
            });
        } else {
            await Wiki.addGlobalAcl({
                condition_type: conditionType,
                condition,
                type: aclType,
                action: allow,
            });
        }

        if (user)
            await prisma.permissionHistory.create({
                data: {
                    targetPage: {
                        connect: {
                            id: wiki.id,
                        },
                    },
                    target: aclType,
                    targetType: conditionType,
                    range,
                    action: allow ? '허용' : '거부',
                    type: 3,
                    user: {
                        connect: {
                            id: user.id,
                        },
                    },
                },
            });
    } else if (action === 'delete') {
        const id = parseInt(formData.get('id') as string);
        const acl = await prisma.acl.findUnique({
            where: {
                id,
            },
        });
        await Wiki.deleteAcl(id);

        if (acl && user)
            await prisma.permissionHistory.create({
                data: {
                    targetPage: {
                        connect: {
                            id: wiki.id,
                        },
                    },
                    target: acl.type,
                    targetType: acl.condition_type,
                    action: acl.action ? '허용' : '거부',
                    type: 4,
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

export default function AclRoute() {
    const {
        wiki,
        acls: {namespaceAcls, globalAcls},
        canManageAcl,
    } = useLoaderData<typeof loader>();
    const params = useParams();
    const [type, setType] = useState('read');
    const [range, setRange] = useState('document');
    const [conditionType, setConditionType] = useState('perm');

    const wikiAcls = range === 'document' ? wiki.acls : range === 'namespace' ? namespaceAcls : globalAcls;

    return (
        <Frame>
            <div className="flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">{params['*']}의 ACL</h1>
                    <Link to={`/wiki/${params['*']}`}>
                        <Button variant="ghost" size="sm" className="size-8 p-0">
                            <ArrowLeft className="h-4 w-4 m-auto" />
                        </Button>
                    </Link>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex gap-1">
                            <MiniTab isActive={range === 'global'} onClick={() => setRange('global')}>
                                전체 문서 ACL
                            </MiniTab>
                            <MiniTab isActive={range === 'namespace'} onClick={() => setRange('namespace')}>
                                이름공간 ACL
                            </MiniTab>
                            <MiniTab isActive={range === 'document'} onClick={() => setRange('document')}>
                                문서 ACL
                            </MiniTab>
                        </div>

                        <div className="flex gap-1">
                            {Object.entries(acls).map(([key, label]) => (
                                <MiniTab isActive={type === key} onClick={() => setType(key)} key={key}>
                                    {label}
                                </MiniTab>
                            ))}
                        </div>
                    </div>
                    {canManageAcl && (
                        <Form method="post" className="flex flex-wrap gap-4 items-end border-b pb-6">
                            <input type="hidden" name="_action" value="add" />
                            <input type="hidden" name="type" value={type} />
                            <input type="hidden" name="range" value={range} />
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Condition Type</label>
                                <Select name="conditionType" className="w-52" value={conditionType} onChange={(e) => setConditionType(e.target.value)}>
                                    <option value="perm">Permission</option>
                                    <option value="member">Member</option>
                                    <option value="ip">IP Address</option>
                                    <option value="geoip">geoip</option>
                                    <option value="group">group</option>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Condition</label>
                                {conditionType === 'perm' ? (
                                    <Select name="condition" className="w-52">
                                        <option value="any">아무나</option>
                                        <option value="member">회원</option>
                                        <option value="ip">IP 사용자</option>
                                        <option value="match_username_and_document_title">사용자 이름과 문서 이름이 일치</option>
                                        {Object.entries(permissions).map(([key, label]) => (
                                            <option value={key} key={key}>
                                                {label}
                                            </option>
                                        ))}
                                    </Select>
                                ) : conditionType === 'member' ? (
                                    <UserSearch />
                                ) : conditionType === 'group' ? (
                                    <GroupSearch />
                                ) : (
                                    <Input name="condition" placeholder="Condition value..." className="w-52" />
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Action</label>
                                <Select name="allow" className="w-52">
                                    <option value="true">허용</option>
                                    <option value="false">차단</option>
                                </Select>
                            </div>
                            <Button type="submit" className="flex items-center gap-2">
                                <Plus className="w-4 h-4" /> 규칙 추가
                            </Button>
                        </Form>
                    )}

                    <div className="space-y-4">
                        {wikiAcls
                            .filter((acl) => acl.type === type)
                            .map((acl) => (
                                <div key={acl.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div className="space-y-1">
                                        <div className="text-sm font-medium">
                                            {acl.condition_type === 'perm'
                                                ? '권한'
                                                : acl.condition_type === 'member'
                                                  ? '사용자'
                                                  : acl.condition_type === 'geoip'
                                                    ? 'geoip'
                                                    : acl.condition_type === 'group'
                                                      ? '그룹'
                                                      : 'IP'}
                                            : {acl.condition}
                                        </div>
                                        <div className="text-sm text-gray-500">{acl.action ? '허용' : '차단'}</div>
                                    </div>
                                    <Form method="post">
                                        <input type="hidden" name="_action" value="delete" />
                                        <input type="hidden" name="id" value={acl.id} />
                                        {canManageAcl && (
                                            <Button type="submit" variant="ghost" size="sm" className="text-red-600 hover:text-red-700 size-8 p-0">
                                                <Trash2 className="w-4 h-4 m-auto" />
                                            </Button>
                                        )}
                                    </Form>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </Frame>
    );
}
