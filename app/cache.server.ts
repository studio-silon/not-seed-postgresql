import {Site} from './system/.server/site';
import {Wiki} from './system/.server/wiki';
import {prisma} from './db.server';

interface OrphanedPage {
    title: string;
    namespace: string;
    fullName: string;
}

async function getNeededPages() {
    const neededPages: string[] = [];
    const existingDocs: Set<string> = new Set();

    const backlinks = await prisma.backlink.findMany({
        where: {
            from: {
                deleted: false,
            },
        },
    });

    for (const backlink of backlinks) {
        if (existingDocs.has(backlink.to)) continue;

        existingDocs.add(backlink.to);

        const [namespace, title] = Wiki.splitName(backlink.to);

        if (
            (
                await prisma.wiki.findUnique({
                    where: {
                        title_namespace: {
                            title,
                            namespace,
                        },
                        deleted: false,
                    },
                    select: {id: true},
                })
            )?.id
        )
            continue;

        neededPages.push(backlink.to);
    }

    return neededPages;
}

async function getOrphanedPages(): Promise<OrphanedPage[]> {
    const site = await Site.getInfo();

    const allPages = await prisma.wiki.findMany({
        where: {
            deleted: false,
        },
        select: {
            title: true,
            namespace: true,
        },
    });

    const allPageNames = new Set(allPages.map((page) => Wiki.joinName(page.namespace, page.title)));

    const startingPoints = new Set(Wiki.splitName(site.frontPage));

    const visitedPages = new Set(startingPoints);

    const queue = [...startingPoints];

    while (queue.length > 0) {
        const currentPage = queue.shift()!;

        const [namespace, title] = Wiki.splitName(currentPage);

        const backlinks = await prisma.backlink.findMany({
            where: {
                from: {
                    namespace,
                    title,
                },
                to: {
                    not: currentPage,
                },
            },
            select: {to: true},
        });

        for (const backlink of backlinks) {
            if (!visitedPages.has(backlink.to) && allPageNames.has(backlink.to)) {
                visitedPages.add(backlink.to);
                queue.push(backlink.to);
            }
        }
    }

    const orphanedPages: OrphanedPage[] = [];

    for (const page of allPages) {
        const pageName = Wiki.joinName(page.namespace, page.title);

        if (!visitedPages.has(pageName) && !startingPoints.has(pageName)) {
            const backlinks = await prisma.backlink.findMany({
                where: {
                    to: Wiki.joinName(page.namespace, page.title),
                    from: {
                        namespace: {not: page.namespace},
                        title: {not: page.title},
                    },
                },
                select: {from: true},
            });

            if (backlinks.length === 0) {
                orphanedPages.push({
                    title: page.title,
                    namespace: page.namespace,
                    fullName: pageName,
                });
            }
        }
    }

    return orphanedPages;
}

export let neededPages = await getNeededPages();
export let neededPagesLength = neededPages.length;

setInterval(async () => {
    neededPages = await getNeededPages();
    neededPagesLength = neededPages.length;
}, 86400000);

export let orphanedPages = await getOrphanedPages();
export let orphanedPagesLength = orphanedPages.length;

setInterval(async () => {
    orphanedPages = await getOrphanedPages();
    orphanedPagesLength = orphanedPages.length;
}, 86400000);
