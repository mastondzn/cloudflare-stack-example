import {
    Box,
    Button,
    Center,
    Spinner,
    Table,
    TableCaption,
    TableContainer,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    useToast,
    VStack,
} from '@chakra-ui/react';
import { useState } from 'react';

import { countries } from '@cloudflare-example/countries';

import { useCountriesQuery, useIncrementMutation, useLeaderboardQuery } from './utils/query';

export const App = () => {
    const [count, setCount] = useState(0);
    const toast = useToast({ position: 'bottom', isClosable: true });

    const handleError = (error: unknown) => {
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

    const { data } = useCountriesQuery({
        onSuccess: (data) => setCount(data.count),
        onError: handleError,
    });

    const { data: leaderboardData, refetch: refetchLeaderboard } = useLeaderboardQuery();

    const { mutate: increment } = useIncrementMutation({
        onSuccess: (data) => {
            setCount(data.count);
            void refetchLeaderboard();
        },
        onError: handleError,
    });

    return (
        <Center h="100vh">
            <VStack>
                {data ? (
                    <>
                        <Text fontWeight="semibold" fontSize="lg">{`Country ${
                            countries[data.country_name] || data.country_name
                        } has a count of ${count}!`}</Text>
                        <Button size="lg" onClick={() => increment()}>
                            {"Increment your country's count!"}
                        </Button>
                    </>
                ) : (
                    <Spinner />
                )}

                <Box h="10vh" />

                {leaderboardData && (
                    <TableContainer>
                        <Table variant="simple" size="sm">
                            <TableCaption>Top 10 Countries</TableCaption>
                            <Thead>
                                <Tr>
                                    <Th>Country</Th>
                                    <Th>Count</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {leaderboardData.map((country) => (
                                    <Tr key={country.country_name}>
                                        <Td>
                                            {countries[country.country_name] ||
                                                country.country_name}
                                        </Td>
                                        <Td isNumeric={true}>{country.count}</Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </TableContainer>
                )}
            </VStack>
        </Center>
    );
};
