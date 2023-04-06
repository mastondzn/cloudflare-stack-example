import { Button, Center, Spinner, Text, useToast, VStack } from '@chakra-ui/react';
import { useState } from 'react';

import { countries } from '@cloudflare-example/countries';

import { useCountriesQuery, useIncrementMutation } from './utils/query';

export const App = () => {
    const [count, setCount] = useState(0);
    const toast = useToast({ position: 'bottom', isClosable: true });

    const handleError = (error: unknown) => {
        const description = error instanceof Error ? error.message : 'An unknown error occurred.';
        toast({
            title: 'Error',
            description,
            status: 'error',
        });
    };

    const { data } = useCountriesQuery({
        onSuccess: (data) => setCount(data.count),
        onError: handleError,
    });

    const { mutate: increment } = useIncrementMutation({
        onSuccess: (data) => setCount(data.count),
        onError: handleError,
    });

    return (
        <Center h="100vh">
            {data ? (
                <VStack>
                    <Text fontWeight="semibold" fontSize="lg">{`Country ${
                        countries[data.country_name] || data.country_name
                    } has a count of ${count}!`}</Text>
                    <Button size="lg" onClick={() => increment()}>
                        {"Increment your country's count!"}
                    </Button>
                </VStack>
            ) : (
                <Spinner />
            )}
        </Center>
    );
};
