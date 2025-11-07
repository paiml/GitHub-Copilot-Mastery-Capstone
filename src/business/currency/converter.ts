import type { CurrencyCode, ExchangeRate, Money } from "../../shared/types/invoice.ts";
import { config } from "../../shared/utils/config.ts";
import { logger } from "../../shared/utils/logger.ts";

interface CacheEntry {
  rate: ExchangeRate;
  expiresAt: number;
}

export class CurrencyConverter {
  private rateCache: Map<string, CacheEntry> = new Map();
  private readonly API_URL = config.exchangeRate.apiUrl;
  private readonly CACHE_TTL = config.exchangeRate.cacheTtl * 1000;

  async convert(
    amount: number,
    from: CurrencyCode,
    to: CurrencyCode,
    date?: Date,
  ): Promise<Money> {
    if (from === to) {
      return { amount, currency: to };
    }

    const rate = await this.getExchangeRate(from, to, date);
    const converted = amount * rate.rate;
    const rounded = Math.round(converted * 10000) / 10000;

    logger.info("Currency converted", {
      amount,
      from,
      to,
      rate: rate.rate,
      result: rounded,
    });

    return {
      amount: rounded,
      currency: to,
    };
  }

  private async getExchangeRate(
    from: CurrencyCode,
    to: CurrencyCode,
    date?: Date,
  ): Promise<ExchangeRate> {
    const cacheKey = `${from}-${to}-${date?.toISOString() ?? "latest"}`;
    const cached = this.rateCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      logger.debug("Using cached exchange rate", { cacheKey });
      return cached.rate;
    }

    try {
      const url = date
        ? `${this.API_URL}${from}?date=${date.toISOString().split("T")[0]}`
        : `${this.API_URL}${from}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch exchange rate: ${response.statusText}`);
      }

      const data = await response.json();
      const rate: ExchangeRate = {
        from,
        to,
        rate: data.rates[to],
        timestamp: new Date(data.date),
      };

      this.rateCache.set(cacheKey, {
        rate,
        expiresAt: Date.now() + this.CACHE_TTL,
      });

      logger.info("Fetched exchange rate", {
        from,
        to,
        rate: rate.rate,
        timestamp: rate.timestamp,
      });

      return rate;
    } catch (error) {
      logger.error("Failed to fetch exchange rate", error as Error, { from, to });
      throw error;
    }
  }

  clearCache(): void {
    this.rateCache.clear();
    logger.info("Exchange rate cache cleared");
  }
}
