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

import { getByCountryCode } from '@cloudflare-example/countries';

import { handleError } from './utils/handler';
import { useIncrementMutation, useSelfQuery } from './utils/query';
import type { CountryData } from './utils/query';

export const App = () => {
    const toast = useToast({ position: 'bottom', isClosable: true });
    const [leaderboard, setLeaderboard] = useState<Map<string, CountryData> | null>(null);
    const [selfData, setSelfData] = useState<CountryData | null>(null);

    useSelfQuery({
        onSuccess: ({ self, leaderboard }) => {
            setSelfData(self);
            setLeaderboard(
                new Map(leaderboard.map((country) => [country.country_code, country] as const))
            );
        },
        onError: (err) => handleError(err, toast),
    });

    const { mutate: increment, isLoading: incrementMutationIsLoading } = useIncrementMutation({
        onSuccess: ({ count, country_code }) => {
            setSelfData({ count, country_code });
            if (!(leaderboard instanceof Map) || !leaderboard.has(country_code)) return;

            const newLeaderboard = new Map(leaderboard);
            newLeaderboard.set(country_code, {
                country_code,
                count,
            });
            setLeaderboard(newLeaderboard);
        },
        onError: (err) => handleError(err, toast),
    });

    return (
        <Center h="100vh">
            <VStack>
                {selfData ? (
                    <>
                        <Text fontWeight="semibold" fontSize="lg">{`Country ${getByCountryCode(
                            selfData.country_code
                        )} has a count of ${selfData.count}!`}</Text>
                        <Button
                            size="lg"
                            onClick={() => increment()}
                            isLoading={incrementMutationIsLoading}
                        >
                            {"Increment your country's count!"}
                        </Button>
                    </>
                ) : (
                    <Spinner />
                )}

                <Box h="10vh" />

                {leaderboard && (
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
                                {[...leaderboard.values()].map(({ count, country_code }) => (
                                    <Tr key={country_code}>
                                        <Td>{getByCountryCode(country_code)}</Td>
                                        <Td isNumeric={true}>{count}</Td>
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
