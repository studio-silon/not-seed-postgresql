import {prisma} from '~/db.server';

import {JoinName, SplitName} from '~/utils/wiki';

import {v1 as uuidv1} from 'uuid';
import {calculateDifferences} from '~/utils/diff';

export interface UserData {
    userId?: number;
    ipAddress?: string;
}

export class Wiki {
    public static splitName(name: string) {
        return SplitName(name);
    }

    public static joinName(namespace: string, title: string) {
        return JoinName(namespace, title);
    }

    public static async getPage(namespace: string, title: string) {
        return await prisma.wiki.findUnique({
            where: {
                title_namespace: {
                    namespace,
                    title,
                },
            },
            include: {
                discussions: {
                    where: {status: 1},
                    select: {id: true},
                },
                acls: true,
                file: true,
            },
        });
    }

    public static async getBacklinkByTo(name: string) {
        return await prisma.backlink.findMany({
            where: {
                to: name,
            },
            include: {
                from: {
                    select: {
                        title: true,
                        namespace: true,
                    },
                },
            },
        });
    }

    public static async getPageById(id: number) {
        return await prisma.wiki.findUnique({
            where: {
                id,
            },
            include: {
                discussions: {
                    where: {status: 1},
                    select: {id: true},
                },
                acls: true,
                file: true,
            },
        });
    }
    public static async getPageWithRever(namespace: string, title: string, rever?: number) {
        const page = await prisma.wiki.findUnique({
            where: {
                title_namespace: {
                    namespace,
                    title,
                },
            },
            include: {
                discussions: {
                    where: {status: 1},
                    select: {id: true},
                },
                acls: true,
                file: true,
            },
        });

        if (!page) return null;

        const version = await prisma.wikiVersion.findFirst({
            where: {
                wikiId: page.id,
                rever: rever || page.rever,
            },
            include: {
                user: {
                    select: {
                        username: true,
                    },
                },
            },
        });

        return {page, version};
    }

    public static async updatePage(namespace: string, title: string, content: string, log: string, userData: UserData) {
        const existingPage = await prisma.wiki.findUnique({
            where: {
                title_namespace: {namespace, title},
            },
            select: {content: true},
        });

        let added = 0;
        let removed = 0;

        if (existingPage) {
            const diff = calculateDifferences(existingPage.content, content);
            added = diff.added;
            removed = diff.removed;
        }

        const wiki = await prisma.wiki.upsert({
            where: {
                title_namespace: {namespace, title},
            },
            update: {
                content,
                rever: {
                    increment: 1,
                },
                updatedAt: new Date(),
                deleted: false,
            },
            create: {
                title,
                namespace,
                content,
                deleted: false,
                rever: 1,
                createdAt: new Date(),
            },
            select: {id: true, content: true, rever: true, updatedAt: true},
        });

        await prisma.wikiVersion.create({
            data: {
                wiki: {
                    connect: {
                        id: wiki.id,
                    },
                },
                ...(userData.userId
                    ? {
                          user: {
                              connect: {
                                  id: userData.userId,
                              },
                          },
                      }
                    : {}),
                ipAddress: userData.ipAddress,
                rever: wiki.rever,
                type: 0,
                data: '',
                added,
                removed,
                content,
                log: log,
                createdAt: new Date(),
            },
        });

        return wiki;
    }

    public static async movePage(namespace: string, title: string, newNamespace: string, newTitle: string, content: string, log: string, userData: UserData) {
        const existingWiki = await prisma.wiki.findUnique({
            where: {
                title_namespace: {namespace: newNamespace, title: newTitle},
            },
        });

        if (existingWiki) {
            await prisma.wiki.update({
                where: {
                    id: existingWiki.id,
                },
                data: {
                    title: `${existingWiki.title}_${uuidv1()}`,
                    updatedAt: new Date(),
                },
            });
        }

        const wiki = await prisma.wiki.update({
            where: {
                title_namespace: {namespace, title},
            },
            data: {
                namespace: newNamespace,
                title: newTitle,
                content,
                rever: {
                    increment: 1,
                },
                updatedAt: new Date(),
            },
        });

        await prisma.wikiVersion.create({
            data: {
                wiki: {
                    connect: {
                        id: wiki.id,
                    },
                },
                ...(userData.userId
                    ? {
                          user: {
                              connect: {
                                  id: userData.userId,
                              },
                          },
                      }
                    : {}),
                ipAddress: userData.ipAddress,
                rever: wiki.rever,
                type: 1,
                data: JSON.stringify([this.joinName(namespace, title), this.joinName(newNamespace, newTitle)]),
                content,
                log: log,
                createdAt: new Date(),
            },
        });

        if (existingWiki) {
            await prisma.wiki.update({
                where: {
                    id: existingWiki.id,
                },
                data: {
                    title,
                    updatedAt: new Date(),
                    rever: {
                        increment: 1,
                    },
                },
            });

            await prisma.wikiVersion.create({
                data: {
                    wiki: {
                        connect: {
                            id: existingWiki.id,
                        },
                    },
                    ...(userData.userId
                        ? {
                              user: {
                                  connect: {
                                      id: userData.userId,
                                  },
                              },
                          }
                        : {}),
                    ipAddress: userData.ipAddress,
                    rever: existingWiki.rever,
                    type: 1,
                    data: JSON.stringify([this.joinName(newNamespace, newTitle), this.joinName(namespace, title)]),
                    content: existingWiki.content,
                    log: log,
                    createdAt: new Date(),
                },
            });
        }
    }

    public static async deletePage(namespace: string, title: string, log: string, userData: UserData) {
        const wiki = await prisma.wiki.upsert({
            where: {
                title_namespace: {namespace, title},
            },
            update: {
                content: '',
                rever: {
                    increment: 1,
                },
                updatedAt: new Date(),
                deleted: true,
            },
            create: {
                title,
                namespace,
                content: '',
                deleted: true,
                rever: 1,
                createdAt: new Date(),
            },
            select: {id: true, content: true, rever: true, updatedAt: true},
        });

        await prisma.wikiVersion.create({
            data: {
                wiki: {
                    connect: {
                        id: wiki.id,
                    },
                },
                ...(userData.userId
                    ? {
                          user: {
                              connect: {
                                  id: userData.userId,
                              },
                          },
                      }
                    : {}),
                ipAddress: userData.ipAddress,
                rever: wiki.rever,
                type: 2,
                data: '',
                content: '',
                log: log,
                createdAt: new Date(),
            },
        });
    }

    public static async getHistory(namespace: string, title: string, page: number = 1) {
        const pageSize = 40;
        const skip = (page - 1) * pageSize;

        const wiki = await prisma.wiki.findUnique({
            where: {
                title_namespace: {namespace, title},
            },
            select: {
                id: true,
                namespace: true,
                title: true,
                versions: {
                    skip,
                    take: pageSize,
                    orderBy: {createdAt: 'desc'},
                    select: {
                        id: true,
                        rever: true,
                        log: true,
                        type: true,
                        data: true,
                        createdAt: true,
                        added: true,
                        removed: true,
                        user: {
                            select: {
                                username: true,
                            },
                        },
                        ipAddress: true,
                    },
                },
                acls: true,
            },
        });

        if (!wiki) {
            return null;
        }

        const totalVersions = await prisma.wikiVersion.count({
            where: {wikiId: wiki.id},
        });

        const totalPages = Math.ceil(totalVersions / pageSize);

        return {
            wiki,
            totalPages,
        };
    }

    public static async revertPage(namespace: string, title: string, rever: number, log: string, userData: UserData) {
        const pageWithVersion = await this.getPageWithRever(namespace, title, rever);

        if (!pageWithVersion || !pageWithVersion.version) {
            return null;
        }

        const {page, version} = pageWithVersion;

        const diff = calculateDifferences(page.content, version.content);

        const updatedWiki = await prisma.wiki.update({
            where: {
                title_namespace: {
                    namespace,
                    title,
                },
            },
            data: {
                content: version.content,
                rever: {
                    increment: 1,
                },
                updatedAt: new Date(),
                deleted: false,
            },
            select: {
                id: true,
                content: true,
                rever: true,
                updatedAt: true,
            },
        });

        await prisma.wikiVersion.create({
            data: {
                wiki: {
                    connect: {
                        id: updatedWiki.id,
                    },
                },
                ...(userData.userId
                    ? {
                          user: {
                              connect: {
                                  id: userData.userId,
                              },
                          },
                      }
                    : {}),
                ipAddress: userData.ipAddress,
                rever: updatedWiki.rever,
                type: 3,
                added: diff.added,
                removed: diff.removed,
                data: JSON.stringify([rever]),
                content: version.content,
                log: log,
                createdAt: new Date(),
            },
        });

        return updatedWiki;
    }

    public static async createEditRequest(
        namespace: string,
        title: string,
        type: number,
        content: string | null,
        newNamespace: string | null,
        newTitle: string | null,
        log: string | null,
        userData: UserData,
    ) {
        const wiki = await prisma.wiki.findUnique({
            where: {
                title_namespace: {namespace, title},
            },
        });

        if (!wiki) {
            throw new Error('Wiki page not found');
        }

        return await prisma.editRequest.create({
            data: {
                wiki: {
                    connect: {id: wiki.id},
                },
                type,
                content,
                newNamespace,
                newTitle,
                log,
                ...(userData.userId ? {user: {connect: {id: userData.userId}}} : {ipAddress: userData.ipAddress}),
                status: 0,
            },
        });
    }

    public static async getEditRequests(namespace: string, title: string) {
        const wiki = await prisma.wiki.findUnique({
            where: {
                title_namespace: {namespace, title},
            },
            select: {id: true},
        });

        if (!wiki) {
            return [];
        }

        return await prisma.editRequest.findMany({
            where: {
                wikiId: wiki.id,
                status: 0,
            },
            include: {
                user: {
                    select: {username: true},
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    public static async handleEditRequest(requestId: number, action: 'accept' | 'reject', reviewLog: string | null, userData: UserData) {
        const editRequest = await prisma.editRequest.findUnique({
            where: {id: requestId},
            include: {
                wiki: true,
            },
        });

        if (!editRequest) {
            throw new Error('Edit request not found');
        }

        if (action === 'accept') {
            switch (editRequest.type) {
                case 0:
                    await this.updatePage(editRequest.wiki.namespace, editRequest.wiki.title, editRequest.content || '', editRequest.log || '편집 요청 승락', userData);
                    break;
                case 1:
                    await this.movePage(
                        editRequest.wiki.namespace,
                        editRequest.wiki.title,
                        editRequest.newNamespace || editRequest.wiki.namespace,
                        editRequest.newTitle || editRequest.wiki.title,
                        editRequest.content || editRequest.wiki.content,
                        editRequest.log || '이동 요청 승락',
                        userData,
                    );
                    break;
                case 2:
                    await this.deletePage(editRequest.wiki.namespace, editRequest.wiki.title, editRequest.log || '삭제 요청 승락', userData);
                    break;
            }
        }

        return await prisma.editRequest.update({
            where: {id: requestId},
            data: {
                status: action === 'accept' ? 1 : 2,
                reviewedBy: userData.userId,
                reviewedAt: new Date(),
                reviewLog,
            },
        });
    }

    public static async createDiscussion(wikiId: number, title: string, userData: UserData) {
        return await prisma.discussion.create({
            data: {
                wiki: {
                    connect: {
                        id: wikiId,
                    },
                },
                title,
                status: 1,
                ...(userData.userId ? {user: {connect: {id: userData.userId}}} : {ipAddress: userData.ipAddress}),
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });
    }

    public static async getDiscussions(wikiId: number) {
        const discussions = await prisma.discussion.findMany({
            where: {
                wikiId,
            },
            orderBy: {createdAt: 'desc'},
            select: {
                id: true,
                title: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return discussions;
    }

    public static async updateDiscussion(discussionId: number, title: string) {
        return await prisma.discussion.update({
            where: {id: discussionId},
            data: {
                title,
                updatedAt: new Date(),
            },
        });
    }

    public static async addComment(discussionId: number, content: string, type: number, userData: UserData) {
        return await prisma.comment.create({
            data: {
                discussion: {connect: {id: discussionId}},
                content,
                type,
                createdAt: new Date(),
                ...(userData.userId ? {user: {connect: {id: userData.userId}}} : {ipAddress: userData.ipAddress}),
            },
        });
    }

    public static async updateDiscussionStatus(discussionId: number, status: number) {
        return await prisma.discussion.update({
            where: {id: discussionId},
            data: {
                status,
                updatedAt: new Date(),
            },
        });
    }

    public static async hideComment(commentId: number, hide: boolean, userId: number) {
        return await prisma.comment.update({
            where: {id: commentId},
            data: {
                hidden: hide,
                hiddenBy: hide ? userId : null,
                hiddenAt: hide ? new Date() : null,
            },
        });
    }

    public static async moveDiscussion(discussionId: number, targetWikiId: number) {
        return await prisma.discussion.update({
            where: {id: discussionId},
            data: {
                wiki: {
                    connect: {id: targetWikiId},
                },
                updatedAt: new Date(),
            },
        });
    }

    public static async getDiscussion(discussionId: number) {
        return await prisma.discussion.findUnique({
            where: {id: discussionId},
            include: {
                comments: {
                    orderBy: {createdAt: 'asc'},
                    select: {
                        id: true,
                        type: true,
                        content: true,
                        createdAt: true,
                        hidden: true,
                        hiddenBy: true,
                        hiddenAt: true,
                        user: {
                            select: {
                                username: true,
                            },
                        },
                        ipAddress: true,
                    },
                },
                wiki: {
                    select: {
                        title: true,
                        namespace: true,
                        id: true,
                        acls: true,
                    },
                },
            },
        });
    }

    public static async deleteComment(commentId: number) {
        return await prisma.comment.delete({
            where: {id: commentId},
        });
    }

    public static async getAcls(namespace: string | null, title: string | null) {
        const namespaceAcls = namespace
            ? await prisma.acl.findMany({
                  where: {
                      namespace,
                      wikiId: null,
                  },
                  cacheStrategy: {
                      ttl: 30,
                      swr: 30,
                  },
              })
            : [];

        const globalAcls = await prisma.acl.findMany({
            where: {
                namespace: null,
                wikiId: null,
            },
            cacheStrategy: {
                ttl: 30,
                swr: 30,
            },
        });

        return {
            namespaceAcls,
            globalAcls,
        };
    }

    public static async addAcl(namespace: string, title: string, aclData: {condition_type: string; condition: string; type: string; action: boolean}) {
        const page = await prisma.wiki.findUnique({
            where: {
                title_namespace: {namespace, title},
            },
            select: {id: true},
        });

        if (!page) {
            throw new Error('Page not found');
        }

        return await prisma.acl.create({
            data: {
                namespace,
                wiki: {
                    connect: {id: page.id},
                },
                ...aclData,
            },
        });
    }

    public static async addGlobalAcl(aclData: {condition_type: string; condition: string; type: string; action: boolean}) {
        return await prisma.acl.create({
            data: {
                ...aclData,
                namespace: null,
            },
        });
    }

    public static async addNamespaceAcl(
        namespace: string,
        aclData: {
            condition_type: string;
            condition: string;
            type: string;
            action: boolean;
        },
    ) {
        return await prisma.acl.create({
            data: {
                ...aclData,
                namespace,
                wikiId: null,
            },
        });
    }

    public static async deleteAcl(id: number) {
        return await prisma.acl.delete({
            where: {id},
        });
    }
}
