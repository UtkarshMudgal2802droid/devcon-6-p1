import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { parseNotice } from './parser';
import { delayNoticeSchema, bulkDelayNoticeSchema } from './schema';
import { x402Gate } from './middleware';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Requirement: Input size is capped server-side (e.g. 100kb limit)
app.use(express.text({ type: '*/*', limit: '100kb' }));
app.use(cors());

// Payment configurations from environment, completely independent of request input
const paymentNetwork = process.env.NETWORK_IDENTIFIER || 'eip155:84532';
const paymentAsset = process.env.ASSET_ADDRESS || '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
const payTo = process.env.SERVER_WALLET_ADDRESS || '0x0000000000000000000000000000000000000000';

const singleParsePrice = process.env.PRICE_SINGLE || '1000';
const bulkParsePrice = process.env.PRICE_BULK || '5000';

// 1. FREE ROUTE: Health check / status
app.get('/api/status', (req: Request, res: Response) => {
  res.status(200).json({ status: 'active', message: 'Meera railway parser is running.' });
});

// 2. PAID ROUTE 1: Single parse
app.post('/api/parse/single', x402Gate({
  price: singleParsePrice,
  network: paymentNetwork,
  asset: paymentAsset,
  payTo: payTo
}), (req: Request, res: Response) => {
  try {
    const rawText = req.body;
    if (!rawText || typeof rawText !== 'string') {
      return res.status(400).json({ error: 'Body must be text' });
    }

    const parsedData = parseNotice(rawText);
    
    // Requirement: Parsed output is validated against a declared schema
    const validationResult = delayNoticeSchema.safeParse(parsedData);
    
    // Requirement: An unparseable notice returns a 4xx status
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
app.post('/api/parse/bulk', x402Gate({
  price: bulkParsePrice,
  network: paymentNetwork,
  asset: paymentAsset,
  payTo: payTo
}), (req: Request, res: Response) => {
  try {
    const rawText = req.body;
    if (!rawText || typeof rawText !== 'string') {
      return res.status(400).json({ error: 'Body must be text containing notices separated by newlines' });
    }

    const lines = rawText.split('\n').filter(l => l.trim().length > 0);
    const parsedArray = lines.map(line => parseNotice(line));

    // Validate against array schema
    const validationResult = bulkDelayNoticeSchema.safeParse(parsedArray);
    
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
