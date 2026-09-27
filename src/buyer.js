import dotenv from 'dotenv';
dotenv.config();
async function runBuyer() {
    const url = 'http://localhost:3000/api/parse/single';
    const notice = "12345 NDLS 14:30 reason: Heavy rain";
    console.log(`[Buyer] Requesting parse for notice: "${notice}"`);
    // 1. Initial request without payment
    const initialResponse = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: notice
    });
    if (initialResponse.status === 402) {
        const paymentRequiredHeader = initialResponse.headers.get('payment-required');
        console.log(`[Buyer] Received 402 Payment Required`);
        console.log(`[Buyer] PAYMENT-REQUIRED Header received: ${paymentRequiredHeader ? 'YES' : 'NO'}`);
        const body = await initialResponse.json();
        console.log(`[Buyer] Payment options available:`, JSON.stringify(body.accepts, null, 2));
        // In a real x402 client (like @x402/client), this step is handled by the SDK
        // which processes the transaction on the network (e.g. Base Sepolia)
        console.log(`[Buyer] Executing payment on ${body.accepts[0].network}...`);
        // 2. Retry request with the payment signature
        const mockSignature = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.mock";
        console.log(`[Buyer] Resubmitting request with PAYMENT-SIGNATURE: ${mockSignature}`);
        const paidResponse = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
                'payment-signature': mockSignature
            },
            body: notice
        });
        if (paidResponse.status === 200) {
            const result = await paidResponse.json();
            console.log(`[Buyer] Success! Parsed Result:`, JSON.stringify(result, null, 2));
            const responseHeader = paidResponse.headers.get('payment-response');
            if (responseHeader) {
                const decoded = Buffer.from(responseHeader, 'base64').toString('utf8');
                console.log(`[Buyer] Settlement info from server: ${decoded}`);
            }
        }
        else {
            console.log(`[Buyer] Failed after payment. Status: ${paidResponse.status}`);
            console.log(await paidResponse.text());
        }
    }
}
runBuyer().catch(console.error);
//# sourceMappingURL=buyer.js.map