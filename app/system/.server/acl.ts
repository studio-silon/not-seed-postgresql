import {Prisma} from '@prisma/client';
import {UserData, Wiki} from './wiki';
import {PermissionsType, User} from './user';
import {getUser} from '~/utils/sessions.server';
import geoip from 'geoip-lite';
import {Group} from './group';

export type AclType = 'read' | 'edit' | 'move' | 'delete' | 'thread_create' | 'comment_create' | 'acl';

type DontNull<T> = T extends null ? never : T;

type WikiType =
    | DontNull<Prisma.PromiseReturnType<typeof Wiki.getPage>>
    | DontNull<Prisma.PromiseReturnType<typeof Wiki.getHistory>>['wiki']
    | DontNull<Prisma.PromiseReturnType<typeof Wiki.getDiscussion>>['wiki'];

export class Acl {
    public static async isAllowed(page: WikiType, user: Prisma.PromiseReturnType<typeof getUser> | undefined, userData: UserData, type: AclType) {
        if (!page) return false;

        if (user && (await User.checkPermission('admin', user))) return true;

        const {namespaceAcls, globalAcls} = await Wiki.getAcls(page.namespace, page.title);

        const acls = [...globalAcls, ...namespaceAcls, ...page.acls];

        const isAllowed = async (acl: DontNull<Prisma.PromiseReturnType<typeof Wiki.getPage>>['acls'][0], allowed = false) => {
            switch (acl.condition_type) {
                case 'perm':
                    switch (acl.condition) {
                        case 'any':
                            allowed = acl.action;
                            break;
                        case 'member':
                            if (user) allowed = acl.action;
                            break;
                        case 'match_username_and_document_title':
                            if (typeof page === 'string' || page === null) {
                                allowed = acl.action;

                                break;
                            }

                            const title = page.title.split('/')[0];
                            if (user) {
                                if (title === user.username) allowed = acl.action;
                            } else {
                                if (title === userData.ipAddress) allowed = acl.action;
                            }
                            break;
                        default:
                            if (user && (await User.checkPermission(acl.condition as PermissionsType, user))) allowed = acl.action;
                    }
                    break;
                case 'member':
                    if (user && user.username === acl.condition) allowed = acl.action;
                    break;
                case 'ip':
                    if (userData.ipAddress === acl.condition) allowed = acl.action;
                    break;
                case 'geoip':
                    if (userData.ipAddress && geoip.lookup(userData.ipAddress)?.country === acl.condition) allowed = acl.action;
                    break;
                case 'group':
                    const userGroups = await Group.findUserGroups(user?.id, userData.ipAddress);
                    if (userGroups.some((group) => group.name === acl.condition)) {
                        allowed = acl.action;
                    }
                    break;
            }

            return allowed;
        };

        let allowed = true;

        for (const acl of acls) {
            if (acl.type !== type && !(type === 'move' || type === 'delete')) continue;

            allowed = await isAllowed(acl);
        }

        return allowed;
    }
}
