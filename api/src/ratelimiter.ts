import { json } from './utils/responses';

const windowLength = 20 * 1000; // 20 seconds
const maxRequests = 10; // 10 requests per minute

const dateIsInWindow = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    return diff < windowLength;
};

type RateLimiterState = {
    windowStart: Date;
    requests: number;
};

export type RateLimiterResult = {
    rateLimited: boolean;
};

export class RateLimiterDurableObject {
    state: DurableObjectState;

    constructor(state: DurableObjectState) {
        this.state = state;
    }

    async fetch(request: Request): Promise<Response> {
        const clientIp =
            request.headers.get('CF-Connecting-IP') ||
            request.headers.get('X-Forwarded-For') ||
            'fallback';

        // get the current client state or initialize it
        let currentClientState: RateLimiterState | undefined =
            await this.state.storage.get<RateLimiterState>(clientIp);
        if (!currentClientState) {
            currentClientState = {
                windowStart: new Date(),
                requests: 0,
            };
        }

        // check if current time is still in the last window start
        if (!dateIsInWindow(currentClientState.windowStart)) {
            // if not, reset the counter and set the new window start
            currentClientState.windowStart = new Date();
            currentClientState.requests = 0;
        }

        // increment the requests
        currentClientState.requests++;

        // console.log(JSON.stringify(currentClientState));

        // set the state in storage
        await this.state.storage.put(clientIp, currentClientState);

        // check if the limit is reached
        if (currentClientState.requests > maxRequests) {
            const result: RateLimiterResult = {
                rateLimited: true,
            };
            return json(result, 200);
        }

        const result: RateLimiterResult = {
            rateLimited: false,
        };

        return json(result, 200);
    }
}

const isValidResponse = (json: unknown): json is RateLimiterResult => {
    return typeof json === 'object' && json !== null && 'rateLimited' in json;
};

export const parseRateLimiterResult = async (
    response: Response
): Promise<RateLimiterResult | { error: string }> => {
    if (response.status !== 200) {
        return { error: `RateLimiterDurableObject returned status ${response.status}` };
    }

    const json = await response.json();

    if (!isValidResponse(json)) {
        return { error: 'RateLimiterDurableObject returned invalid response' };
    }

    return json;
};
