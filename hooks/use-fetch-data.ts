import {
    useQuery,
    UseQueryOptions,
    QueryFunction,
    QueryKey,
} from "@tanstack/react-query";

export const useFetchData = <
    TData = unknown,
    TQueryKey extends QueryKey = QueryKey, // Moved to 2nd position
    TError = Error // Moved to 3rd position
>(
    queryKey: TQueryKey,
    queryFn: QueryFunction<TData, TQueryKey>,
    options?: Omit<UseQueryOptions<TData, TError, TData, TQueryKey>, "queryKey" | "queryFn">
) => {
    return useQuery({
        queryKey,
        queryFn,
      
        ...options,
    });
};
