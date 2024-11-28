import * as Diff from 'diff';

export function calculateDifferences(str1: string, str2: string): {added: number; removed: number} {
    const diff = Diff.diffChars(str1, str2);
    let addedCount = 0;
    let removedCount = 0;

    diff.forEach((part) => {
        if (part.added) {
            addedCount += part.count || 1;
        } else if (part.removed) {
            removedCount += part.count || 1;
        }
    });

    return {added: addedCount, removed: removedCount};
}
