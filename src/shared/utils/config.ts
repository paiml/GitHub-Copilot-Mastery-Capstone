// Configuration management
export interface Config {
  port: number;
  environment: "development" | "staging" | "production";
  database: {
    url: string;
    poolSize: number;
  };
  exchangeRate: {
    apiUrl: string;
    cacheTtl: number;
  };
  reconciliation: {
    descriptionThreshold: number;
    priceTolerancePct: number;
    quantityTolerancePct: number;
    confidenceThreshold: number;
  };
}

function getEnv(key: string, defaultValue: string): string {
  return Deno.env.get(key) ?? defaultValue;
}

function getEnvNumber(key: string, defaultValue: number): number {
  const value = Deno.env.get(key);
  return value ? parseInt(value, 10) : defaultValue;
}

export const config: Config = {
  port: getEnvNumber("PORT", 8000),
  environment: getEnv("ENVIRONMENT", "development") as Config["environment"],
  database: {
    url: getEnv("DATABASE_URL", "postgresql://localhost:5432/invoice_reconciliation"),
    poolSize: getEnvNumber("DATABASE_POOL_SIZE", 20),
  },
  exchangeRate: {
    apiUrl: getEnv("EXCHANGE_RATE_API_URL", "https://api.exchangerate-api.com/v4/latest/"),
    cacheTtl: getEnvNumber("EXCHANGE_RATE_CACHE_TTL", 3600),
  },
  reconciliation: {
    descriptionThreshold: 0.85,
    priceTolerancePct: 2.0,
    quantityTolerancePct: 2.0,
    confidenceThreshold: 0.9,
  },
};
