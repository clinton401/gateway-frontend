import {
    useInfiniteQuery,
    UseInfiniteQueryOptions,
    QueryKey,
    InfiniteData,
} from "@tanstack/react-query";
import { useMemo } from "react";

// 1. Define strict shape for API response
interface BasePageResponse<T> {
    data: T[];
    nextPage?: number | null;
}

interface InfiniteScrollResult<T> {
    data: T[];
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    fetchNextPage: () => void;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    isFetching: boolean;
    refetch: () => void;
}

export const useInfiniteScroll = <TData>(
    // Fetcher is STRICT
    fetchFn: (context: { pageParam: number; signal: AbortSignal }) => Promise<BasePageResponse<TData>>,

    // Key is STRICT
    queryKey: QueryKey,

    // Options are strictly typed to remove 'any'
    options?: Omit<
        UseInfiniteQueryOptions<
            BasePageResponse<TData>,                       // 1. TQueryFnData
            Error,                                         // 2. TError
            InfiniteData<BasePageResponse<TData>, number>, // 3. TData
            QueryKey,                                      // 4. TQueryKey
            number                                         // 5. TPageParam
        >,
        "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam"
    >
): InfiniteScrollResult<TData> => {

    const queryResult = useInfiniteQuery({
        queryKey,
        queryFn: async ({ pageParam, signal }) => {
            return fetchFn({ pageParam: pageParam as number, signal });
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage: BasePageResponse<TData>) => {
            return lastPage.nextPage ?? undefined;
        },
        ...options,
    });

    // Performance Optimization: Memoize the data flattening
    const flatData = useMemo(() => {
        // Because we strictly typed the query options above, TypeScript now knows 
        // exactly what queryResult.data is. No 'as any' needed.
        const pages = queryResult.data?.pages ?? [];

        return pages.flatMap((page) => page.data);
    }, [queryResult.data]);

    return {
        data: flatData,
        isLoading: queryResult.isLoading,
        isError: queryResult.isError,
        error: queryResult.error,
        fetchNextPage: queryResult.fetchNextPage,
        hasNextPage: queryResult.hasNextPage,
        isFetchingNextPage: queryResult.isFetchingNextPage,
        isFetching: queryResult.isFetching,
        refetch: queryResult.refetch,
    };
};
