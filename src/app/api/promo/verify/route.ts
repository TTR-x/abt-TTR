import 'dotenv/config';
import { NextResponse } from 'next/server';
import { getAdminServices } from '@/firebase/server-admin';

// Headers CORS pour permettre l'appel depuis TTR Gestion (domaine différent)
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS(request: Request) {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(request: Request) {
    return NextResponse.json({
        message: "API promo/verify is online. Use POST method to verify a code."
    }, { status: 200, headers: corsHeaders });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const code = body.code || body.promoCode || body.ambassadorId;

        if (!code) {
            return NextResponse.json(
                { success: false, error: 'Code promo requis.' },
                { status: 400, headers: corsHeaders }
            );
        }

        const { firestore } = getAdminServices();

        if (!firestore) {
            console.error('Firestore not initialized');
            return NextResponse.json(
                { success: false, error: 'Erreur configuration serveur.' },
                { status: 500, headers: corsHeaders }
            );
        }

        // Recherche de l'ambassadeur avec ce code promo
        const ambassadorsRef = firestore.collection('ambassadors');
        const querySnapshot = await ambassadorsRef.where('referralCode', '==', code).limit(1).get();

        if (querySnapshot.empty) {
            return NextResponse.json(
                { success: false, error: 'Code promo invalide.' },
                { status: 404, headers: corsHeaders }
            );
        }

        const doc = querySnapshot.docs[0];
        const ambassador = doc.data();

        // On renvoie les infos minimales nécessaires
        return NextResponse.json({
            success: true,
            isValid: true,
            referralCode: ambassador.referralCode,
            ambassadorName: ambassador.name,
            message: 'Code promo valide.'
        }, { status: 200, headers: corsHeaders });

    } catch (error) {
        console.error('Error verifying promo code:', error);
        return NextResponse.json(
            { success: false, error: 'Erreur interne lors de la vérification.' },
            { status: 500, headers: corsHeaders }
        );
    }
}
