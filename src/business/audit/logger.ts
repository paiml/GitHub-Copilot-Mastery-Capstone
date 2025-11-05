import type { AuditLog } from "../../shared/types/invoice.ts";
import { logger } from "../../shared/utils/logger.ts";

export class AuditLogger {
  private logs: AuditLog[] = [];

  async log(
    entityType: string,
    entityId: string,
    action: string,
    changes: Record<string, unknown>,
    userId?: string,
  ): Promise<AuditLog> {
    const auditLog: AuditLog = {
      id: crypto.randomUUID(),
      entityType,
      entityId,
      action,
      userId,
      changes,
      timestamp: new Date(),
    };

    this.logs.push(auditLog);

    logger.info("Audit log created", {
      auditLogId: auditLog.id,
      entityType,
      entityId,
      action,
      userId,
    });

    return auditLog;
  }

  async getLogs(
    entityType: string,
    entityId: string,
  ): Promise<AuditLog[]> {
    return this.logs.filter(
      (log) => log.entityType === entityType && log.entityId === entityId,
    );
  }

  async getAllLogs(): Promise<AuditLog[]> {
    return [...this.logs];
  }
}
