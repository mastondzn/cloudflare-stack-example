import type { CreateToastFnReturn } from '@chakra-ui/react';

export const handleError = (error: unknown, toast: CreateToastFnReturn) => {
    const description = error instanceof Error ? error.message : 'An unknown error occurred.';

    if (description.includes('rate limited')) {
        toast({
            title: 'Rate limited!',
            description: 'Go slower! Wait a bit and try again.',
            status: 'warning',
        });
        return;
    }

    toast({
        title: 'Error',
        description,
        status: 'error',
    });
};
