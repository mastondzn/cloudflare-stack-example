import { useMutation, useQuery } from '@tanstack/react-query';

const apiBaseUrl = import.meta.env.DEV ? 'http://127.0.0.1:8787' : 'https://cf-example.synopsis.gg';

type CountryData = {
    country_name: string;
    count: number;
};

export const useCountriesQuery = (options?: {
    onError?: (err: unknown) => void;
    onSuccess?: (data: CountryData) => void;
    country?: string;
}) => {
    return useQuery<CountryData, unknown, CountryData, [string, string] | [string]>({
        queryKey: options?.country ? ['countries', options.country] : ['countries'],
        queryFn: async ({ queryKey: [, wantedCountry] }) => {
            let url = `${apiBaseUrl}/api/get`;

            if (typeof wantedCountry === 'string') {
                url = `${url}/${wantedCountry}`;
            }

            const res = await fetch(url);
            const data = (await res.json()) as
                | { country_name: string; count: number }
                | { error: string; country?: string };

            console.log(data);

            if (res.status === 404 && 'country' in data) {
                return { country_name: data.country, count: 0 };
            }

            if (res.ok && 'country_name' in data) {
                return data;
            }

            throw new Error(JSON.stringify(data));
        },
        onError: options?.onError as () => void,
        onSuccess: options?.onSuccess as (data: CountryData) => void,
    });
};

export const useLeaderboardQuery = (options?: {
    onError?: (err: unknown) => void;
    onSuccess?: (data: CountryData[]) => void;
}) => {
    return useQuery<CountryData[], unknown, CountryData[], readonly ['leaderboard']>({
        queryKey: ['leaderboard'] as const,
        queryFn: async () => {
            const res = await fetch(`${apiBaseUrl}/api/leaderboard`);

            const data = (await res.json()) as
                | { country_name: string; count: number }[]
                | { error: string };

            console.log(data);

            if (res.ok && Array.isArray(data)) {
                return data;
            }

            throw new Error(JSON.stringify(data));
        },
        onError: options?.onError as () => void,
        onSuccess: options?.onSuccess as (data: CountryData[]) => void,
    });
};

export const useIncrementMutation = (options?: {
    onError?: (err: unknown) => void;
    onSuccess?: (data: CountryData) => void;
}) => {
    return useMutation({
        mutationFn: async () => {
            const res = await fetch(`${apiBaseUrl}/api/increment`);

            const data = (await res.json()) as
                | { country_name: string; count: number }
                | { error: string };

            console.log(data);

            if (res.ok && 'country_name' in data) {
                return data;
            }

            throw new Error(JSON.stringify(data));
        },
        onSuccess: options?.onSuccess as (data: CountryData) => void,
        onError: options?.onError as () => void,
    });
};
