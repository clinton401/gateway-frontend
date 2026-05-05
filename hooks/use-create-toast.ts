import { toast } from "sonner";

const useCreateToast = () => {
    const createError = (description: string, title = "Uh oh! Something went wrong.") => {
        toast.error(title, {
            description,
        });
    };

    const createSimple = (description: string, title?: string) => {
        if (title) {
            toast(title, {
                description,
            });
        } else {
            toast(description);
        }
    };

    const createSuccess = (description: string, title = "Success") => {
        toast.success(title, {
            description,
        });
    };

    const createWarning = (description: string, title = "Heads up!") => {
        toast.warning(title, {
            description,
        });
    };

    return { createError, createSimple, createSuccess, createWarning };
};

export default useCreateToast;
