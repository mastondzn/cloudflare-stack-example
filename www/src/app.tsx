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
import {
    type CountryData,
    type Leaderboard,
    useIncrementMutation,
    useSelfQuery,
} from './utils/query';

export const App = () => {
    const toast = useToast({ position: 'bottom', isClosable: true });
    const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);
    const [selfData, setSelfData] = useState<CountryData | null>(null);

    useSelfQuery({
        onSuccess: ({ self, leaderboard }) => {
            setSelfData(self);
            setLeaderboard(leaderboard);
        },
        onError: (err) => handleError(err, toast),
    });

    const { mutate: increment, isLoading: incrementMutationIsLoading } = useIncrementMutation({
        onSuccess: ({ count, countryCode }) => {
            setSelfData({ count, countryCode });

            const hasCurrentCountry =
                leaderboard && leaderboard.some((country) => country.countryCode === countryCode);

            if (!leaderboard || !(leaderboard.length < 10 || hasCurrentCountry)) {
                return;
            }

            // wutface
            setLeaderboard(
                (hasCurrentCountry
                    ? [...leaderboard].map((country) =>
                          country.countryCode === countryCode ? { countryCode, count } : country
                      )
                    : [...leaderboard, { count, countryCode }]
                )
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10)
            );
        },
        onError: (err) => handleError(err, toast),
    });

    return (
        <Center h="100vh">
            <VStack>
                {selfData && leaderboard ? (
                    <>
                        <Text fontWeight="semibold" fontSize="lg">{`Country ${getByCountryCode(
                            selfData.countryCode
                        )} has a count of ${selfData.count}!`}</Text>
                        <Button
                            size="lg"
                            onClick={() => increment()}
                            isLoading={incrementMutationIsLoading}
                        >
                            {"Increment your country's count!"}
                        </Button>

                        <Box h="10vh" />

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
                                    {leaderboard.map(({ count, countryCode }) => (
                                        <Tr key={countryCode}>
                                            <Td>{getByCountryCode(countryCode)}</Td>
                                            <Td isNumeric={true}>{count}</Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </TableContainer>
                    </>
                ) : (
                    <Spinner />
                )}
            </VStack>
        </Center>
    );
};
