import request from 'supertest';
import app from '../src/index';

describe('Railway Delay API', () => {
  it('should return 402 Payment Required when no payment signature is provided for single parse', async () => {
    const res = await request(app)
      .post('/api/parse/single')
      .set('Content-Type', 'text/plain')
      .send('12345 NDLS 14:30 reason: Heavy rain');
      
    expect(res.status).toBe(402);
    expect(res.headers['payment-required']).toBeDefined();
    
    // Check if the body contains x402 details
    expect(res.body).toHaveProperty('x402Version');
    expect(res.body.accepts[0].network).toBeDefined();
  });

  it('should parse a well-formed notice and return 200 when payment signature is provided', async () => {
    const res = await request(app)
      .post('/api/parse/single')
      .set('Content-Type', 'text/plain')
      .set('payment-signature', 'mock_signature_base64')
      .send('12345 NDLS 14:30 reason: Heavy rain');
      
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      train: '12345',
      station: 'NDLS',
      expectedTime: '14:30',
      reason: 'Heavy rain'
    });
  });

  it('should return 422 Unprocessable Entity for a malformed notice (missing time)', async () => {
    const res = await request(app)
      .post('/api/parse/single')
      .set('Content-Type', 'text/plain')
      .set('payment-signature', 'mock_signature_base64')
      .send('12345 NDLS reason: Heavy rain'); // Missing time
      
    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty('error');
    expect(res.body.details).toBeDefined();
  });

  it('should cap request body size', async () => {
    // Generate a payload > 100kb
    const largePayload = 'A'.repeat(101 * 1024);
    
    const res = await request(app)
      .post('/api/parse/single')
      .set('Content-Type', 'text/plain')
      .set('payment-signature', 'mock_signature_base64')
      .send(largePayload);
      
    expect(res.status).toBe(413); // Payload Too Large
  });
});
