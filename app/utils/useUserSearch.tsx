import {useEffect, useState} from 'react';
import {useFetcher} from '@remix-run/react';

import type {loader} from '~/routes/api+/users.search';
import {useDebounce} from '~/utils/useDebounce';

interface User {
    id: number;
    username: string;
}

export function useUserSearch() {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 300);
    const fetcher = useFetcher<typeof loader>();

    useEffect(() => {
        if (!debouncedSearch) return;

        fetcher.load(`/api/users/search/?q=${encodeURIComponent(debouncedSearch)}`);
    }, [debouncedSearch]);

    return {
        selectedUser,
        setSelectedUser,
        searchTerm,
        setSearchTerm,
        users: fetcher.data?.users || [],
        isLoading: fetcher.state === 'loading',
    };
}
