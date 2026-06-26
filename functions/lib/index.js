"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const https_1 = require("firebase-functions/v2/https");
const express_1 = __importDefault(require("express"));
const genai_1 = require("@google/genai");
const stripe_1 = __importDefault(require("stripe"));
const admin = __importStar(require("firebase-admin"));
// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();
const app = (0, express_1.default)();
app.use(express_1.default.json({ limit: '10mb' }));
// Stripe & Gemini settings
const stripeKey = process.env.STRIPE_SECRET_KEY || '';
const stripe = stripeKey ? new stripe_1.default(stripeKey) : null;
const geminiApiKey = process.env.GEMINI_API_KEY || '';
const ai = geminiApiKey ? new genai_1.GoogleGenAI({ apiKey: geminiApiKey }) : null;
// Helper: load products collection from Firestore dynamically
async function getDynamicProducts() {
    try {
        const prodSnap = await db.collection('products').get();
        if (prodSnap.empty) {
            console.warn("Products Firestore collection is empty.");
            return [];
        }
        const productsList = [];
        prodSnap.forEach((doc) => {
            productsList.push({ id: doc.id, ...doc.data() });
        });
        return productsList;
    }
    catch (error) {
        console.error("Failed to load products dynamically from Firestore:", error);
        return [];
    }
}
// Router to support both /api/path and /path
const router = express_1.default.Router();
// API: Optical Footwear Finder/Scanner using Gemini 2.5 Flash
router.post('/scan-footwear', async (req, res) => {
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
    }
    catch (error) {
        console.error('Error scanning footwear with Gemini:', error);
        return res.status(500).json({
            error: 'Failed to process shoe scan: ' + (error.message || 'Unknown error')
        });
    }
});
// API: Create Stripe Payment Intent
router.post('/create-payment-intent', async (req, res) => {
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
    }
    catch (error) {
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
exports.api = (0, https_1.onRequest)({
    cors: true,
    maxInstances: 10,
    secrets: ['GEMINI_API_KEY', 'STRIPE_SECRET_KEY']
}, app);
//# sourceMappingURL=index.js.map