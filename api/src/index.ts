import { eq } from 'drizzle-orm/expressions';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { poweredBy } from 'hono/powered-by';

import { countries, createDb } from './db';
import { parseRateLimiterResult } from './ratelimiter';
import type { Bindings } from './bindings';

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', poweredBy());
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
    const db = createDb(ctx.env.D1_DB);

    const result = await db
        .select()
        .from(countries)
        .where(eq(countries.country_name, country))
        .get();

    if (!result) {
        return ctx.json({ country_name: country, count: 0 });
    }

    return ctx.json(result);
});

app.get('/api/increment', async (ctx) => {
    const country = ctx.req.headers.get('CF-IPCountry') || 'fallback';
    const db = createDb(ctx.env.D1_DB);

    const result = await db
        .select()
        .from(countries)
        .where(eq(countries.country_name, country))
        .get();

    if (!result) {
        await db.insert(countries).values({ country_name: country }).get();
    }

    return ctx.json(
        await db
            .update(countries)
            .set({ count: result.count + 1 })
            .where(eq(countries.country_name, country))
            .get()
    );
});

app.get('/api/decrement', async (ctx) => {
    const country = ctx.req.headers.get('CF-IPCountry') || 'fallback';
    const db = createDb(ctx.env.D1_DB);

    const result = await db
        .select()
        .from(countries)
        .where(eq(countries.country_name, country))
        .get();

    if (!result) {
        await db.insert(countries).values({ country_name: country }).get();
    }

    return ctx.json(
        await db
            .update(countries)
            .set({ count: result.count - 1 })
            .where(eq(countries.country_name, country))
            .get()
    );
});

export default app;
export { RateLimiterDurableObject } from './ratelimiter';
