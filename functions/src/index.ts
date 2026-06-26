import { onRequest } from 'firebase-functions/v2/https';
import express from 'express';
import { GoogleGenAI } from '@google/genai';
import Stripe from 'stripe';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(express.json({ limit: '10mb' }));

// Stripe & Gemini settings
const stripeKey = process.env.STRIPE_SECRET_KEY || '';
const stripe = stripeKey ? new Stripe(stripeKey) : null;

const geminiApiKey = process.env.GEMINI_API_KEY || '';
const ai = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null;

// Helper: load products collection from Firestore dynamically
async function getDynamicProducts(): Promise<any[]> {
  try {
    const prodSnap = await db.collection('products').get();
    if (prodSnap.empty) {
      console.warn("Products Firestore collection is empty.");
      return [];
    }
    const productsList: any[] = [];
    prodSnap.forEach((doc) => {
      productsList.push({ id: doc.id, ...doc.data() });
    });
    return productsList;
  } catch (error) {
    console.error("Failed to load products dynamically from Firestore:", error);
    return [];
  }
}

// Router to support both /api/path and /path
const router = express.Router();

// API: Optical Footwear Finder/Scanner using Gemini 2.5 Flash
router.post('/scan-footwear', async (req: express.Request, res: express.Response) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    // Prepare Base64 data (strip prefix if present)
    let base64Data = image;
    let mimeType = 'image/jpeg';
    if (image.startsWith('data:')) {
      const parts = image.split(',');
      base64Data = parts[1];
      const match = parts[0].match(/:(.*?);/);
      if (match) {
        mimeType = match[1];
      }
    }

    // Load products from DB
    const dynamicCatalog = await getDynamicProducts();

    if (!ai) {
      console.warn("GEMINI_API_KEY is missing. Running in simulated fallback mode.");
      if (dynamicCatalog.length === 0) {
        return res.status(500).json({ error: 'Catalog is empty and Gemini key is missing' });
      }
      const randomIndex = Math.floor(Math.random() * dynamicCatalog.length);
      const matched = dynamicCatalog[randomIndex];
      return res.status(200).json({
        productId: matched.id,
        confidence: 94.5,
        reason: 'Identified via simulated local footwear matching (GEMINI_API_KEY is not configured).',
        simulated: true
      });
    }

    // Map catalog products for Gemini reference
    const catalogBrief = dynamicCatalog.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      description: p.description
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          inlineData: {
            mimeType,
            data: base64Data
          }
        },
        `Identify the footwear in this image from this specific catalog of products:
${JSON.stringify(catalogBrief, null, 2)}

You MUST match it to one of the catalog products. If it is not a perfect match, find the closest style.
Return a JSON object containing:
- "productId": (must be one of the IDs in the catalog above)
- "confidence": (a percentage float value from 0.0 to 100.0)
- "reason": (a brief one-sentence reason explaining why it matches this item)`
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            productId: { type: 'STRING' },
            confidence: { type: 'NUMBER' },
            reason: { type: 'STRING' }
          },
          required: ['productId', 'confidence', 'reason']
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error('Empty response from Gemini API');
    }

    const matchResult = JSON.parse(resultText);
    return res.status(200).json({
      ...matchResult,
      simulated: false
    });

  } catch (error: any) {
    console.error('Error scanning footwear with Gemini:', error);
    return res.status(500).json({
      error: 'Failed to process shoe scan: ' + (error.message || 'Unknown error')
    });
  }
});

// API: Create Stripe Payment Intent
router.post('/create-payment-intent', async (req: express.Request, res: express.Response) => {
  try {
    const { amount } = req.body;
    if (!amount || typeof amount !== 'number') {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    if (!stripe) {
      console.warn("STRIPE_SECRET_KEY is missing. Running in simulated fallback mode.");
      return res.status(200).json({
        clientSecret: `mock_secret_${Math.random().toString(36).substring(2, 15)}`,
        simulated: true
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // in cents
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
    });

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      simulated: false
    });

  } catch (error: any) {
    console.error('Error creating Stripe Payment Intent:', error);
    return res.status(500).json({
      error: 'Failed to create payment intent: ' + (error.message || 'Unknown error')
    });
  }
});

// Mount router under both prefixes
app.use('/api', router);
app.use('/', router);

// Export Cloud Function wrapped in onRequest
export const api = onRequest({
  cors: true,
  maxInstances: 10,
  secrets: ['GEMINI_API_KEY', 'STRIPE_SECRET_KEY']
}, app);
