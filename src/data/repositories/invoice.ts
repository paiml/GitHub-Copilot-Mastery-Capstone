import type { CurrencyCode, Invoice } from "../../shared/types/invoice.ts";
import { InMemoryRepository } from "./base.ts";
import type { Result } from "../../shared/types/result.ts";
import { Err, Ok } from "../../shared/types/result.ts";

export class InvoiceRepository extends InMemoryRepository<Invoice> {
  findByInvoiceNumber(invoiceNumber: string): Result<Invoice, Error> {
    const invoice = Array.from(this.data.values()).find(
      (inv) => inv.invoiceNumber === invoiceNumber,
    );

    if (!invoice) {
      return Err(new Error(`Invoice missing: ${invoiceNumber}`));
    }

    return Ok(invoice);
  }

  findByCurrency(currency: CurrencyCode): Promise<Result<Invoice[], Error>> {
    return this.findAll({ currency } as Partial<Invoice>);
  }

  findPendingReconciliation(): Result<Invoice[], Error> {
    try {
      const pending = Array.from(this.data.values()).filter(
        (invoice) => invoice.status === "pending",
      );
      return Ok(pending);
    } catch (error) {
      return Err(error as Error);
    }
  }
}
