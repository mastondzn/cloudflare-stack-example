import { drizzle, type DrizzleD1Database } from 'drizzle-orm/d1';
import { desc, eq } from 'drizzle-orm/expressions';

import { countries, type Country } from './schema';

export class Database {
    d1: D1Database;
    db: DrizzleD1Database;

    constructor(db: D1Database) {
        this.d1 = db;
        this.db = drizzle(db);
    }

    async getCountry(countryName: string): Promise<Country | null | undefined> {
        return await this.db
            .select()
            .from(countries)
            .where(eq(countries.country_code, countryName))
            .get();
    }

    async setCount(countryName: string, count: number) {
        return await this.db
            .update(countries)
            .set({ count })
            .where(eq(countries.country_code, countryName))
            .run();
    }

    async insertCountry(countryCode: string) {
        return await this.db.insert(countries).values({ country_code: countryCode }).run();
    }

    async getLeaderboard(): Promise<Country[]> {
        return await this.db
            .select()
            .from(countries)
            .orderBy(desc(countries.count))
            .limit(10)
            .all();
    }
}

export * from './schema';
