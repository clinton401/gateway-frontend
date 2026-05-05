
import {
    useInfiniteQuery,
    UseInfiniteQueryOptions,
    QueryKey,
    InfiniteData,
} from "@tanstack/react-query";
import { useMemo } from "react";

interface CursorPageResponse<T> {
    data: T[];
    nextCursor: string | null;
    hasMore: boolean;
}

interface CursorPaginationResult<T> {
    data: T[];
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    fetchNextPage: () => Promise<unknown>;
    hasNextPage: boolean | undefined;
    isFetchingNextPage: boolean;
    isFetching: boolean;
    refetch: () => Promise<unknown>;
}

export function useCursorPagination<TData>(
    fetchFn: (context: {
        cursor: string | null;
        signal: AbortSignal;
    }) => Promise<CursorPageResponse<TData>>,
    queryKey: QueryKey,
    options?: Omit<
        UseInfiniteQueryOptions<
            CursorPageResponse<TData>,
            unknown,
            InfiniteData<CursorPageResponse<TData>>,
            QueryKey,
            string | null
        >,
        "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam"
    >
): CursorPaginationResult<TData> {
    const queryResult = useInfiniteQuery({
        queryKey,
        queryFn: async ({ pageParam, signal }) => {
            return fetchFn({
                cursor: pageParam ?? null,
                signal,
            });
        },
        initialPageParam: null,
        getNextPageParam: (lastPage) => {
            return lastPage.hasMore ? lastPage.nextCursor : undefined;
        },
        ...options,
    });

    const flatData = useMemo(() => {
        if (!queryResult.data) return [];
        return queryResult.data.pages.flatMap((page) => page.data);
    }, [queryResult.data]);

    return {
        data: flatData,
        isLoading: queryResult.isLoading,
        isError: queryResult.isError,
        error: queryResult.error as Error | null,
        fetchNextPage: queryResult.fetchNextPage,
        hasNextPage: queryResult.hasNextPage,
        isFetchingNextPage: queryResult.isFetchingNextPage,
        isFetching: queryResult.isFetching,
        refetch: queryResult.refetch,
    };
}