import type { AuditLog } from "../../shared/types/invoice.ts";
import { logger } from "../../shared/utils/logger.ts";

export class AuditLogger {
  private logs: AuditLog[] = [];

  log(
    entityType: string,
    entityId: string,
    action: string,
    changes: Record<string, unknown>,
    userId?: string,
  ): AuditLog {
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

  getLogs(
    entityType: string,
    entityId: string,
  ): AuditLog[] {
    return this.logs.filter(
      (log) => log.entityType === entityType && log.entityId === entityId,
    );
  }

  getAllLogs(): AuditLog[] {
    return [...this.logs];
  }
}
