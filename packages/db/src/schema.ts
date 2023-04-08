import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import type { InferModel } from 'drizzle-orm';

export const countries = sqliteTable('countries', {
    countryCode: text('countryCode').primaryKey(),
    count: integer('count').notNull().default(0),
});

export type Country = InferModel<typeof countries>;
export type NewCountry = InferModel<typeof countries, 'insert'>;
