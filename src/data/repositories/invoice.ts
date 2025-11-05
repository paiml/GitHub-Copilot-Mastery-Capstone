import type { Invoice, CurrencyCode } from "../../shared/types/invoice.ts";
import { InMemoryRepository } from "./base.ts";
import type { Result } from "../../shared/types/result.ts";
import { Err, Ok } from "../../shared/types/result.ts";

export class InvoiceRepository extends InMemoryRepository<Invoice> {
  async findByInvoiceNumber(invoiceNumber: string): Promise<Result<Invoice, Error>> {
    const invoice = Array.from(this.data.values()).find(
      (inv) => inv.invoiceNumber === invoiceNumber,
    );

    if (!invoice) {
      return Err(new Error(`Invoice not found: ${invoiceNumber}`));
    }

    return Ok(invoice);
  }

  async findByCurrency(currency: CurrencyCode): Promise<Result<Invoice[], Error>> {
    return this.findAll({ currency } as Partial<Invoice>);
  }

  async findPendingReconciliation(): Promise<Result<Invoice[], Error>> {
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
