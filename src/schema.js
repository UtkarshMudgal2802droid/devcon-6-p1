import { z } from 'zod';
export const delayNoticeSchema = z.object({
    train: z.string().min(1, "Train number is required"),
    station: z.string().length(4, "Station code must be 4 characters"),
    expectedTime: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, "Invalid time format (HH:MM)"),
    reason: z.string().optional()
});
export const bulkDelayNoticeSchema = z.array(delayNoticeSchema);
//# sourceMappingURL=schema.js.map