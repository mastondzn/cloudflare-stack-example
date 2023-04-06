import { Hono } from 'hono';
import { logger } from 'hono/logger';

import { Database } from '@cloudflare-example/db';

import { parseRateLimiterResult } from './ratelimiter';
import type { Bindings } from './bindings';

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', logger());
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

app.get('/api/get/:country?', async (ctx) => {
    const country = ctx.req.param('country') || ctx.req.headers.get('CF-IPCountry') || 'fallback';
    const db = new Database(ctx.env.D1_DB);

    const data = await db.getCountry(country);

    if (!data) {
        return ctx.json({ error: `country ${country} not found in database` }, 404);
    }

    return ctx.json(data);
});

app.get('/api/increment', async (ctx) => {
    const country = ctx.req.headers.get('CF-IPCountry') || 'fallback';
    const db = new Database(ctx.env.D1_DB);

    const data = await db.getCountry(country);

    if (!data) {
        await db.insertCountry(country);
        await db.setCount(country, 1);
        return ctx.json({ country_name: country, count: 1 });
    }

    await db.setCount(country, data.count + 1);

    return ctx.json({ country_name: country, count: data.count + 1 });
});

export default app;
export { RateLimiterDurableObject } from './ratelimiter';
