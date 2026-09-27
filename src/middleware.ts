import { Request, Response, NextFunction } from 'express';

interface PaymentConfig {
  price: string;
  network: string;
  asset: string;
  payTo: string;
}

export function x402Gate(config: PaymentConfig) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check if the PAYMENT-SIGNATURE header is present
    const signature = req.headers['payment-signature'];

    if (!signature) {
      const paymentRequiredResponse = {
        x402Version: 2,
        error: "PAYMENT-SIGNATURE header is required",
        resource: {
          url: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
          description: "Parse railway delay notice",
          mimeType: "application/json"
        },
        accepts: [
          {
            scheme: "exact",
            network: config.network,
            amount: config.price,
            asset: config.asset,
            payTo: config.payTo,
            maxTimeoutSeconds: 60,
            extra: {
              name: "USDC",
              version: "2"
            }
          }
        ]
      };

      // 402 Payment Required response with PAYMENT-REQUIRED header
      const encodedRequirements = Buffer.from(JSON.stringify(paymentRequiredResponse)).toString('base64');
      res.setHeader('PAYMENT-REQUIRED', encodedRequirements);
      return res.status(402).json(paymentRequiredResponse);
    }

    // In a real implementation, we would verify the PAYMENT-SIGNATURE payload here using the Facilitator.
    // For the hackathon's "manual payment-header construction" requirement, we simulate successful verification.
    
    // Settle response
    const settlementResponse = {
      status: "settled",
      receipt: "mock_receipt_id_123"
    };
    const encodedSettlement = Buffer.from(JSON.stringify(settlementResponse)).toString('base64');
    res.setHeader('PAYMENT-RESPONSE', encodedSettlement);
    
    next();
  };
}
