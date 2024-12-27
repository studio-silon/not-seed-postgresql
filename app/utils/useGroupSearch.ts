import {useFetcher} from '@remix-run/react';
import {useEffect, useState} from 'react';
import {useDebounce} from '~/utils/useDebounce';
import type {loader} from '~/routes/api+/groups.search';

interface Group {
    id: number;
    name: string;
}

export function useGroupSearch() {
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 300);
    const fetcher = useFetcher<typeof loader>();

    useEffect(() => {
        if (!debouncedSearch) return;

        fetcher.load(`/api/groups/search/?q=${encodeURIComponent(debouncedSearch)}`);
    }, [debouncedSearch]);

    return {
        selectedGroup,
        setSelectedGroup,
        searchTerm,
        setSearchTerm,
        groups: fetcher.data?.groups || [],
        isLoading: fetcher.state === 'loading',
    };
}
