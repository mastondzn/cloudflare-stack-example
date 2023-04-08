import { useMutation, useQuery } from '@tanstack/react-query';

const apiBaseUrl = import.meta.env.DEV ? 'http://127.0.0.1:8787' : 'https://cf-example.synopsis.gg';

export type CountryData = {
    country_code: string;
    count: number;
};

export type Leaderboard = CountryData[];

export type SelfData = {
    self: CountryData;
    leaderboard: Leaderboard;
};

export const useSelfQuery = (options?: {
    onError?: (err: unknown) => void;
    onSuccess?: (data: SelfData) => void;
}) => {
    return useQuery<SelfData, unknown, SelfData, readonly ['self']>({
        queryKey: ['self'] as const,
        queryFn: async () => {
            const res = await fetch(`${apiBaseUrl}/api/self`);
            const data = (await res.json()) as SelfData | { error: string };

            if (res.ok && 'self' in data) {
                return data;
            }

            throw new Error(JSON.stringify(data));
        },
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        onSuccess: options!.onSuccess!,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        onError: options!.onError!,
    });
};

export const useIncrementMutation = (options?: {
    onError?: (err: unknown) => void;
    onSuccess?: (data: CountryData) => void;
}) => {
    return useMutation({
        mutationFn: async () => {
            const res = await fetch(`${apiBaseUrl}/api/increment`);

            const data = (await res.json()) as CountryData | { error: string };

            if (res.ok && 'country_code' in data) {
                return data;
            }

            throw new Error(JSON.stringify(data));
        },
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        onSuccess: options!.onSuccess!,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        onError: options!.onError!,
    });
};
