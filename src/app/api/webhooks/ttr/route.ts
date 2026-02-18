
import 'dotenv/config';
import { NextResponse } from 'next/server';
import { getAdminServices } from '@/firebase/server-admin';
import { FieldValue } from 'firebase-admin/firestore';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
};

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
    return NextResponse.json({ message: "Webhook TTR is active. Use POST." }, { headers: corsHeaders });
}

export async function POST(request: Request) {
    // 1. Authentification (Supporte Bearer Token et x-api-key)
    const authHeader = request.headers.get('Authorization');
    const xApiKey = request.headers.get('x-api-key');
    const ttrApiKey = process.env.TTR_API_KEY;

    const providedKey = authHeader ? authHeader.replace('Bearer ', '') : xApiKey;

    if (!ttrApiKey) {
        console.error('TTR_API_KEY is not set');
        return NextResponse.json({ success: false, error: 'Configuration error' }, { status: 500, headers: corsHeaders });
    }

    if (providedKey !== ttrApiKey) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    const { firestore } = getAdminServices();
    if (!firestore) {
        return NextResponse.json({ success: false, error: 'Database error' }, { status: 500, headers: corsHeaders });
    }

    try {
        const payload = await request.json();
        console.log('[Webhook TTR] Payload reçu:', payload);

        // Mappage des champs (Flexibilité entre l'ancienne version et la nouvelle doc)
        const code = payload.ambassadorId || payload.promoCode;
        const event = payload.eventType || payload.status;
        const clientName = payload.clientName || 'Client Inconnu';
        const clientId = payload.clientEmail || payload.businessId; // On utilise l'email comme ID client unique ou businessId
        const rawAmount = payload.amount !== undefined ? payload.amount : payload.commissionAmount;
        const amount = Number(rawAmount) || 0;

        if (!code || !event || !clientId) {
            return NextResponse.json({
                success: false,
                error: 'Missing fields: code, event, and clientId (email/businessId) are required.'
            }, { status: 400, headers: corsHeaders });
        }

        // 2. Recherche de l'ambassadeur
        const ambassadorsRef = firestore.collection('ambassadors');
        const query = ambassadorsRef.where('referralCode', '==', code).limit(1);
        const snapshot = await query.get();

        if (snapshot.empty) {
            return NextResponse.json({ success: false, error: 'Code promo non trouvé' }, { status: 404, headers: corsHeaders });
        }

        const ambassadorDoc = snapshot.docs[0];
        const ambassadorId = ambassadorDoc.id;
        const ambassadorData = ambassadorDoc.data();

        const clientReferralRef = firestore.doc(`ambassadors/${ambassadorId}/clientReferrals/${clientId.replace(/\./g, '_')}`);

        // 3. Traitement selon l'événement
        if (event === 'CLIENT_SIGNUP' || event === 'inscrit') {
            await clientReferralRef.set({
                clientId: clientId,
                name: clientName,
                email: payload.clientEmail || '',
                referralDate: new Date().toISOString(),
                isActive: false,
                commissionEarned: 0,
            }, { merge: true });

            // Notification (Optionnel)
            const notifRef = firestore.collection(`ambassadors/${ambassadorId}/notifications`).doc();
            await notifRef.set({
                title: 'Nouveau client !',
                message: `${clientName} s'est inscrit avec votre code.`,
                date: new Date().toISOString(),
                isRead: false
            });

            return NextResponse.json({ success: true, message: 'Inscription enregistrée' }, { headers: corsHeaders });

        } else if (event === 'SUBSCRIPTION_PAYMENT' || event === 'actif') {
            const monoyiEarned = Math.floor(amount / 800); // 1 Monoyi = 800 FCFA

            if (monoyiEarned < 0) {
                return NextResponse.json({ success: false, error: 'Invalid amount' }, { status: 400, headers: corsHeaders });
            }

            await firestore.runTransaction(async (transaction) => {
                const ambRef = firestore.doc(`ambassadors/${ambassadorId}`);
                const referralDoc = await transaction.get(clientReferralRef);

                if (!referralDoc.exists) {
                    transaction.set(clientReferralRef, {
                        clientId: clientId,
                        name: clientName,
                        email: payload.clientEmail || '',
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

                transaction.update(ambRef, {
                    monoyi: FieldValue.increment(monoyiEarned),
                });

                // Notification de gain
                const notifRef = firestore.collection(`ambassadors/${ambassadorId}/notifications`).doc();
                transaction.set(notifRef, {
                    title: 'Commission reçue !',
                    message: `Vous avez gagné ${monoyiEarned} Monoyi (${amount} FCFA par ${clientName}).`,
                    date: new Date().toISOString(),
                    isRead: false
                });
            });

            return NextResponse.json({
                success: true,
                message: 'Paiement traité',
                monoyiEarned
            }, { headers: corsHeaders });

        } else {
            return NextResponse.json({ success: false, error: 'Unknown eventType' }, { status: 400, headers: corsHeaders });
        }

    } catch (error: any) {
        console.error('[Webhook TTR] Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: corsHeaders });
    }
}
