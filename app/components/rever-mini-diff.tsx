import {cn} from '~/utils/classMerge';

export function ReverMiniDiff({rever, className = ''}: {rever: {type: number; added: number; removed: number}; className?: string}) {
    return (
        <span className={cn('text-sm', className)}>
            {rever.type === 2 ? (
                <span className="text-red-500">-all</span>
            ) : rever.added === 0 && rever.removed === 0 ? (
                <span className="text-gray-500">0</span>
            ) : rever.added !== 0 && rever.removed !== 0 ? (
                <>
                    <span className="text-green-500">+{rever.added}</span>&nbsp;<span className="text-red-500">-{rever.removed}</span>
                </>
            ) : rever.added !== 0 ? (
                <span className="text-green-500">+{rever.added}</span>
            ) : (
                <span className="text-red-500">-{rever.removed}</span>
            )}
        </span>
    );
}
