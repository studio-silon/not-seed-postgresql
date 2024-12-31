import {diffLines} from 'diff';

import {prisma} from '~/db.server';

export class Blame {
    static async create(wikiId: number, content: string, rever: number): Promise<void> {
        const version = await prisma.wikiVersion.findFirst({
            where: {
                wiki: {id: wikiId},
                rever,
            },
        });

        if (!version) {
            throw new Error('Version not found');
        }

        const previous = await prisma.blame.findFirst({
            where: {
                rever: {
                    wiki: {id: wikiId},
                    rever: rever - 1,
                },
            },
            select: {
                rever: {
                    select: {
                        rever: true,
                        content: true,
                    },
                },
                lineOwners: true,
            },
        });

        const lineOwners: Record<number, number> = {};
        let diff = '';

        if (previous) {
            const previousLineOwners: Record<number, number> = JSON.parse(previous.lineOwners);
            const changes = diffLines(previous.rever.content, content);

            const removedLines = new Map<string, number>();
            let newLineIndex = 0;
            let oldLineIndex = 0;

            for (const change of changes) {
                if (change.removed) {
                    const lines = change.value.split('\n').filter((line) => line);
                    lines.forEach((line) => {
                        removedLines.set(line, previousLineOwners[oldLineIndex++] || rever);
                    });
                } else if (!change.added) {
                    const unchangedLines = change.value.split('\n').filter((line) => line);
                    oldLineIndex += unchangedLines.length;
                }
            }

            oldLineIndex = 0;
            for (const change of changes) {
                if (change.added) {
                    const addedLines = change.value.split('\n');
                    for (const line of addedLines) {
                        if (line) {
                            if (removedLines.has(line)) {
                                lineOwners[newLineIndex] = removedLines.get(line)!;
                                removedLines.delete(line);
                            } else {
                                lineOwners[newLineIndex] = rever;
                            }
                            newLineIndex++;
                        }
                    }
                } else if (!change.removed) {
                    const unchangedLines = change.value.split('\n');
                    for (const line of unchangedLines) {
                        if (line) {
                            lineOwners[newLineIndex] = previousLineOwners[oldLineIndex] || rever;
                            newLineIndex++;
                            oldLineIndex++;
                        }
                    }
                }
            }

            diff = JSON.stringify(changes);
        } else {
            content
                .split('\n')
                .filter((line) => line)
                .forEach((_, index) => {
                    lineOwners[index] = rever;
                });
        }

        await prisma.blame.create({
            data: {
                rever: {
                    connect: {id: version.id},
                },
                diff,
                lineOwners: JSON.stringify(lineOwners),
            },
        });
    }
}
