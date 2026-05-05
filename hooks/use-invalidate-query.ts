import { useQueryClient } from "@tanstack/react-query";

export const useInvalidateQuery = () => {
    const queryClient = useQueryClient();

    return async (queryKey: string[]) => {
        await queryClient.invalidateQueries({
            queryKey,
            exact: true,
            refetchType: "active",
        });
    };
};