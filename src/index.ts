import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { parseNotice } from './parser';
import { delayNoticeSchema, bulkDelayNoticeSchema } from './schema';
import { HTTPFacilitatorClient } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";

dotenv.config();

const app = express();
const port = process.env.PORT;

// Requirement: Input size is capped server-side (e.g. 100kb limit)
app.use(express.text({ type: '*/*', limit: '100kb' }));
app.use(cors());

// Payment configurations strictly from environment variables
const paymentNetwork = process.env.NETWORK_IDENTIFIER as string;
const paymentAsset = process.env.ASSET_ADDRESS as string;
const payTo = process.env.SERVER_WALLET_ADDRESS as string;
const singleParsePrice = process.env.PRICE_SINGLE as string;
const bulkParsePrice = process.env.PRICE_BULK as string;
const facilitatorUrl = process.env.FACILITATOR_URL || "https://testnet.x402.org";

// Strict safety check: Fail to start if any crucial env var is missing
if (!paymentNetwork || !paymentAsset || !payTo || !singleParsePrice || !bulkParsePrice || !port) {
  console.error("CRITICAL: Missing environment variables. Please check your .env file.");
  process.exit(1);
}

const facilitatorClient = new HTTPFacilitatorClient({ url: facilitatorUrl });
const resourceServer = new x402ResourceServer(facilitatorClient)
  .register(paymentNetwork, new ExactEvmScheme());

// Apply x402 payment middleware to the routes
app.use(paymentMiddleware({
  "POST /api/parse/single": {
    accepts: {
      scheme: "exact",
      price: singleParsePrice,
      network: paymentNetwork,
      asset: paymentAsset,
      payTo: payTo,
    },
    description: "Parse a single railway delay notice"
  },
  "POST /api/parse/bulk": {
    accepts: {
      scheme: "exact",
      price: bulkParsePrice,
      network: paymentNetwork,
      asset: paymentAsset,
      payTo: payTo,
    },
    description: "Parse multiple railway delay notices"
  }
}, resourceServer));

// 1. FREE ROUTE: Health check / status
app.get('/api/status', (req: Request, res: Response) => {
  res.status(200).json({ status: 'active', message: 'Meera railway parser is running.' });
});

// 2. PAID ROUTE 1: Single parse
app.post('/api/parse/single', (req: Request, res: Response) => {
  try {
    const rawText = req.body;
    if (!rawText || typeof rawText !== 'string') {
      return res.status(400).json({ error: 'Body must be text' });
    }

    const parsedData = parseNotice(rawText);
    
    // Requirement: Parsed output is validated against a declared schema
    const validationResult = delayNoticeSchema.safeParse(parsedData);
    
    // Requirement: An unparseable notice returns a 4xx status
    // Because this returns 422, @x402/express will NOT inject a PAYMENT-RESPONSE settlement!
    if (!validationResult.success) {
      return res.status(422).json({
        error: 'Unparseable notice',
        details: validationResult.error.errors
      });
    }

    res.status(200).json(validationResult.data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. PAID ROUTE 2: Bulk parse
app.post('/api/parse/bulk', (req: Request, res: Response) => {
  try {
    const rawText = req.body;
    if (!rawText || typeof rawText !== 'string') {
      return res.status(400).json({ error: 'Body must be text containing notices separated by newlines' });
    }

    const lines = rawText.split('\n').filter(l => l.trim().length > 0);
    const parsedArray = lines.map(line => parseNotice(line));

    // Validate against array schema
    const validationResult = bulkDelayNoticeSchema.safeParse(parsedArray);
    
    // Requirement: An unparseable notice returns a 4xx status
    // Because this returns 422, @x402/express will NOT inject a PAYMENT-RESPONSE settlement!
    if (!validationResult.success) {
      return res.status(422).json({
        error: 'One or more notices are unparseable',
        details: validationResult.error.errors
      });
    }

    res.status(200).json(validationResult.data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export app for testing purposes
export default app;

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}
