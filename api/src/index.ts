import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

import { isValidCountry } from '@cloudflare-example/countries';
import { Database } from '@cloudflare-example/db';

import { parseRateLimiterResult } from './ratelimiter';
import type { Bindings } from './bindings';

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', logger());
app.use('*', cors());

app.use('*', async (ctx, next) => {
    const rateLimiterIdentifier =
        ctx.req.headers.get('CF-IPCountry') ||
        ctx.req.headers.get('CF-Connecting-IP') ||
        ctx.req.headers.get('X-Forwarded-For') ||
        'localhost';

    const rateLimiterId = ctx.env.RATELIMITER.idFromName(rateLimiterIdentifier);
    const fetchResult = await ctx.env.RATELIMITER.get(rateLimiterId).fetch(ctx.req.raw);
    const limiterResult = await parseRateLimiterResult(fetchResult);

    if ('error' in limiterResult) {
        return ctx.json({ error: limiterResult.error }, 500);
    }

    if (limiterResult.rateLimited) {
        return ctx.json({ error: 'rate limited' }, 429);
    }

    return await next();
});

app.get('/api/countries/:country', async (ctx) => {
    const country = ctx.req.param('country').toUpperCase();

    if (!isValidCountry(country)) {
        return ctx.json({ error: `country ${country} is not a known country`, country }, 400);
    }

    const db = new Database(ctx.env.D1_DB);
    const data = await db.getCountry(country);

    if (!data) {
        return ctx.json({ error: `country ${country} not found in database`, country }, 404);
    }

    return ctx.json(data);
});

app.get('/api/self', async (ctx) => {
    const countryCode = ctx.req.headers.get('CF-IPCountry') || 'fallback';
    const db = new Database(ctx.env.D1_DB);

    // eslint-disable-next-line prefer-const
    let [countryData, leaderboardData] = await Promise.all([
        db.getCountry(countryCode),
        db.getLeaderboard(),
    ]);

    if (!countryData && !isValidCountry(countryCode)) {
        return ctx.json({ error: `country ${countryCode} is not a valid country code` }, 400);
    }

    if (!countryData) {
        countryData = { country_code: countryCode, count: 0 };
    }

    return ctx.json({ self: countryData, leaderboard: leaderboardData });
});

app.get('/api/increment', async (ctx) => {
    const countryCode = ctx.req.headers.get('CF-IPCountry') || 'fallback';
    const db = new Database(ctx.env.D1_DB);

    const data = await db.getCountry(countryCode);

    if (!data) {
        await db.insertCountry(countryCode);
        await db.setCount(countryCode, 1);
        return ctx.json({ country_code: countryCode, count: 1 });
    }

    await db.setCount(countryCode, data.count + 1);

    return ctx.json({ country_code: countryCode, count: data.count + 1 });
});

export default app;
export { RateLimiterDurableObject } from './ratelimiter';
