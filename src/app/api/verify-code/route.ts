
import 'dotenv/config'; // Load environment variables
import { NextResponse } from 'next/server';
import { getAdminServices } from '@/firebase/server-admin';
import { FieldValue } from 'firebase-admin/firestore';

// Headers CORS centralisés pour être réutilisés
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};


/**
 * Handles preflight requests for CORS.
 * This is crucial for requests coming from a different origin, especially via a proxy.
 */
export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}


/**
 * Handles GET requests to provide a helpful message.
 */
export async function GET(request: Request) {
    return NextResponse.json(
        { message: "API endpoint is active. Please use the POST method to submit data." },
        { status: 200, headers: corsHeaders }
    );
}


/**
 * API endpoint for TTR Gestion to notify the Ambassador app about referral events.
 * This version is secured with a bearer token API key and is designed to work behind a proxy.
 */
export async function POST(request: Request) {
  // 1. Vérification de la clé API partagée
  const authHeader = request.headers.get('Authorization');
  const ttrApiKey = process.env.TTR_API_KEY;

  if (!ttrApiKey) {
      console.error('FATAL: TTR_API_KEY is not defined in environment variables.');
      return NextResponse.json({ message: 'Server configuration error.' }, { status: 500, headers: corsHeaders });
  }

  if (authHeader !== `Bearer ${ttrApiKey}`) {
    console.warn(`Unauthorized attempt to access API. Received Auth Header: '${authHeader}'`);
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401, headers: corsHeaders });
  }
  
  // 2. Vérification de l'initialisation de Firestore
  const { firestore } = getAdminServices();
  if (!firestore) {
    console.error('FATAL: Firebase Admin SDK not initialized. Check server logs for missing environment variables.');
    return NextResponse.json({ message: 'Server configuration error.' }, { status: 500, headers: corsHeaders });
  }


  try {
    const { promoCode, businessId, status, commissionAmount } = await request.json();

    if (!promoCode || !businessId || !status) {
        return NextResponse.json({ message: 'promoCode, businessId, and status are required fields.' }, { status: 400, headers: corsHeaders });
    }
    
    if (status === 'actif' && typeof commissionAmount !== 'number') {
        return NextResponse.json({ message: 'commissionAmount is required for "actif" status' }, { status: 400, headers: corsHeaders });
    }

    const ambassadorsRef = firestore.collection('ambassadors');
    const query = ambassadorsRef.where('referralCode', '==', promoCode).limit(1);
    const snapshot = await query.get();

    if (snapshot.empty) {
        return NextResponse.json({ message: 'Promo code not found' }, { status: 404, headers: corsHeaders });
    }
    
    const ambassadorDoc = snapshot.docs[0];
    const ambassadorId = ambassadorDoc.id;
    const ambassador = ambassadorDoc.data();
    
    const clientReferralRef = firestore.doc(`ambassadors/${ambassadorId}/clientReferrals/${businessId}`);

    if (status === 'inscrit') {
      await clientReferralRef.set({
        clientId: businessId, 
        ambassadorId: ambassadorId,
        referralDate: new Date().toISOString(),
        isActive: false,
        commissionEarned: 0,
      }, { merge: true });
      
      return NextResponse.json({ message: 'Referral registration recorded successfully', ambassadorId }, { status: 200, headers: corsHeaders });

    } else if (status === 'actif') {
      // Conversion de la commission en FCFA vers Monoyi
      const monoyiEarned = Math.floor(commissionAmount / 800); // 1 Monoyi = 800 FCFA

      await firestore.runTransaction(async (transaction) => {
        const ambassadorRef = firestore.doc(`ambassadors/${ambassadorId}`);
        
        const referralDoc = await transaction.get(clientReferralRef);
        if (!referralDoc.exists) {
            transaction.set(clientReferralRef, {
                clientId: businessId,
                ambassadorId: ambassadorId,
                referralDate: new Date().toISOString(),
                isActive: true,
                commissionEarned: monoyiEarned,
            });
        } else {
            transaction.update(clientReferralRef, {
              isActive: true,
              commissionEarned: FieldValue.increment(monoyiEarned),
            });
        }

        transaction.update(ambassadorRef, {
          monoyi: FieldValue.increment(monoyiEarned), // Met à jour le champ monoyi
        });
      });
      
      return NextResponse.json({ message: 'Referral activation processed successfully', ambassadorId, monoyiAwarded: monoyiEarned }, { status: 200, headers: corsHeaders });

    } else {
      return NextResponse.json({ message: 'Invalid status provided' }, { status: 400, headers: corsHeaders });
    }

  } catch (error) {
    console.error('Error processing referral notification:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500, headers: corsHeaders });
  }
}
