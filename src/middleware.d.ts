import { Request, Response, NextFunction } from 'express';
interface PaymentConfig {
    price: string;
    network: string;
    asset: string;
    payTo: string;
}
export declare function x402Gate(config: PaymentConfig): (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export {};
//# sourceMappingURL=middleware.d.ts.map