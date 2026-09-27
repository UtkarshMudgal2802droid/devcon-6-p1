import { z } from 'zod';
export declare const delayNoticeSchema: z.ZodObject<{
    train: z.ZodString;
    station: z.ZodString;
    expectedTime: z.ZodString;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    train: string;
    station: string;
    expectedTime: string;
    reason?: string | undefined;
}, {
    train: string;
    station: string;
    expectedTime: string;
    reason?: string | undefined;
}>;
export declare const bulkDelayNoticeSchema: z.ZodArray<z.ZodObject<{
    train: z.ZodString;
    station: z.ZodString;
    expectedTime: z.ZodString;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    train: string;
    station: string;
    expectedTime: string;
    reason?: string | undefined;
}, {
    train: string;
    station: string;
    expectedTime: string;
    reason?: string | undefined;
}>, "many">;
//# sourceMappingURL=schema.d.ts.map