import { drizzle, type DrizzleD1Database } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm/expressions';

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
            .where(eq(countries.country_name, countryName))
            .get();
    }

    async setCount(countryName: string, count: number) {
        return await this.db
            .update(countries)
            .set({ count })
            .where(eq(countries.country_name, countryName))
            .run();
    }

    async insertCountry(countryName: string) {
        return await this.db.insert(countries).values({ country_name: countryName }).run();
    }
}

export * from './schema';
