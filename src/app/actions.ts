
'use server'

import { getAdminServices } from '@/firebase/server-admin';
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from 'next/navigation';
import { WriteBatch } from 'firebase-admin/firestore';

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function generateRandomSuffix(length = 4): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function buildPromoCode(name: string): string {
  const clean = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z]/g, '')
    .toUpperCase();
  const prefix = clean.length >= 2 ? clean.substring(0, 4) : 'AMB';
  return `${prefix}${generateRandomSuffix(4)}`;
}

// ─────────────────────────────────────────────
// SIGNUP
// ─────────────────────────────────────────────

export async function signupUser(previousState: any, formData: FormData) {
  const { firestore, auth: adminAuth } = getAdminServices();

  if (!firestore || !adminAuth) {
    return {
      error: "Erreur serveur : Firebase n'est pas initialisé. Vérifiez les variables d'environnement et redémarrez le serveur."
    };
  }

  const name = (formData.get('name') as string)?.trim();
  const email = (formData.get('email') as string)?.trim();
  const password = (formData.get('password') as string);

  if (!name || !email || !password) {
    return { error: 'Nom, email et mot de passe sont obligatoires.' };
  }
  if (password.length < 6) {
    return { error: 'Le mot de passe doit contenir au moins 6 caractères.' };
  }

  let uid: string;

  try {
    // 1. Créer l'utilisateur Firebase Auth
    const userRecord = await adminAuth.createUser({ email, password, displayName: name });
    uid = userRecord.uid;
  } catch (authError: any) {
    if (authError.code === 'auth/email-already-exists') {
      return { error: 'Cet email est déjà utilisé.' };
    }
    if (authError.code === 'auth/weak-password') {
      return { error: 'Le mot de passe doit contenir au moins 6 caractères.' };
    }
    console.error('[signupUser] Erreur Auth:', authError);
    return { error: `Erreur lors de la création du compte : ${authError.message}` };
  }

  try {
    // 2. Générer un code promo unique — API Admin : firestore.collection().where().get()
    const ambassadorsCol = firestore.collection('ambassadors');

    const isCodeUnique = async (code: string): Promise<boolean> => {
      const snap = await ambassadorsCol.where('referralCode', '==', code).get();
      return snap.empty;
    };

    let promoCode = '';

    // Tentatives principales
    for (let i = 0; i < 10; i++) {
      const candidate = buildPromoCode(name);
      if (await isCodeUnique(candidate)) {
        promoCode = candidate;
        break;
      }
      console.log(`[signupUser] Collision code promo (tentative ${i + 1})`);
    }

    // Fallback timestamp
    if (!promoCode) {
      for (let i = 0; i < 5; i++) {
        const ts = Date.now().toString().slice(-6);
        const candidate = `AMB${ts}${generateRandomSuffix(2)}`;
        if (await isCodeUnique(candidate)) {
          promoCode = candidate;
          console.warn(`[signupUser] Fallback timestamp utilisé: ${promoCode}`);
          break;
        }
        await new Promise(r => setTimeout(r, 1));
      }
    }

    // Dernier recours : UID
    if (!promoCode) {
      promoCode = `AMB${uid.substring(0, 8).toUpperCase()}`;
      console.error(`[signupUser] Fallback UID utilisé: ${promoCode}`);
    }

    const referralLink = `https://ttrgestion.com/?ref=${promoCode}`;

    // 3. Écriture atomique dans Firestore
    const batch = firestore.batch();
    batch.set(firestore.collection('users').doc(uid), {
      id: uid,
      name,
      email,
      createdAt: new Date().toISOString(),
      isAmbassador: true,
    });
    batch.set(ambassadorsCol.doc(uid), {
      id: uid,
      name,
      email,
      role: 'ambassadeur',
      level: 1,
      monoyi: 0,
      referralCode: promoCode,
      referralLink,
      avatarUrl: `https://picsum.photos/seed/${uid}/40/40`,
      verificationStatus: 'not_verified',
      isVerified: false,
      createdAt: new Date().toISOString(),
    });

    await batch.commit();
    console.log(`[signupUser] ✅ Inscription réussie pour ${name} — code: ${promoCode}`);

    return { success: true };

  } catch (error: any) {
    // Si l'écriture Firestore échoue, supprimer l'utilisateur Auth pour éviter un état incohérent
    console.error('[signupUser] Erreur Firestore:', error);
    try {
      await adminAuth.deleteUser(uid);
      console.warn(`[signupUser] Utilisateur Auth ${uid} supprimé suite à l'échec Firestore.`);
    } catch (deleteErr) {
      console.error('[signupUser] Impossible de supprimer l\'utilisateur Auth:', deleteErr);
    }
    return { error: `Erreur lors de la création du profil : ${error.message}` };
  }
}


// ─────────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────────

export async function logout() {
  cookies().delete('firebase-auth');
  revalidatePath('/');
}

// ─────────────────────────────────────────────
// COMPLETE REGISTRATION
// ─────────────────────────────────────────────

export async function completeRegistration(previousState: any, formData: FormData) {
  const { firestore } = getAdminServices();
  if (!firestore) {
    return { error: "La base de données n'est pas initialisée." };
  }

  const uid = formData.get('uid') as string;
  const referralCode = formData.get('referralCode') as string;
  const country = formData.get('country') as string;
  const payoutMethod = formData.get('payoutMethod') as string;
  const feedback = formData.get('feedback') as string;
  const day = formData.get('dob-day') as string;
  const month = formData.get('dob-month') as string;
  const year = formData.get('dob-year') as string;

  if (!uid || !country || !payoutMethod || !feedback || !day || !month || !year) {
    return { error: 'Tous les champs sont obligatoires.' };
  }

  try {
    const updateData: Record<string, any> = {
      country,
      payoutMethod,
      feedback,
      dob: `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`,
    };
    if (referralCode) updateData.referredBy = referralCode;

    await firestore.collection('ambassadors').doc(uid).update(updateData);
    revalidatePath('/dashboard');
  } catch (error: any) {
    console.error('[completeRegistration] Erreur:', error);
    return { error: `Une erreur est survenue: ${error.message}` };
  }

  redirect('/dashboard');
}

// ─────────────────────────────────────────────
// GENERATE & ASSIGN PROMO CODE
// ─────────────────────────────────────────────

export async function generateAndAssignPromoCode(ambassadorId: string) {
  const { firestore } = getAdminServices();
  if (!firestore) return { error: "La base de données n'est pas initialisée." };
  if (!ambassadorId) return { error: "L'ID de l'ambassadeur est manquant." };

  try {
    const ambassadorRef = firestore.collection('ambassadors').doc(ambassadorId);
    const ambassadorSnap = await ambassadorRef.get();

    if (!ambassadorSnap.exists) return { error: "Ambassadeur non trouvé." };

    const name = ambassadorSnap.data()?.name;
    if (!name) return { error: "Le nom de l'ambassadeur est nécessaire pour générer un code." };

    let code = buildPromoCode(name);
    const snap = await firestore.collection('ambassadors').where('referralCode', '==', code).get();
    if (!snap.empty) {
      code = `${code}${generateRandomSuffix(2)}`;
    }

    const referralLink = `https://ttrgestion.com/?ref=${code}`;
    await ambassadorRef.update({ referralCode: code, referralLink });

    revalidatePath('/admin/ambassadors');
    return { success: true, newCode: code };

  } catch (error: any) {
    console.error('[generateAndAssignPromoCode] Erreur:', error);
    return { error: `Erreur lors de la génération du code: ${error.message}` };
  }
}

// ─────────────────────────────────────────────
// UPDATE PROMO CODE
// ─────────────────────────────────────────────

export async function updatePromoCode(uid: string, newCode: string) {
  const { firestore } = getAdminServices();
  if (!firestore) return { error: "La base de données n'est pas initialisée." };
  if (!uid || !newCode) return { error: 'Informations utilisateur ou nouveau code manquants.' };
  if (newCode.length < 4 || newCode.length > 8) {
    return { error: 'Le nouveau code doit contenir entre 4 et 8 caractères.' };
  }

  try {
    const snap = await firestore.collection('ambassadors').where('referralCode', '==', newCode).get();
    if (!snap.empty && snap.docs.some(d => d.id !== uid)) {
      return { error: 'Ce code promo est déjà utilisé par un autre ambassadeur.' };
    }

    const referralLink = `https://ttrgestion.com/?ref=${newCode}`;
    await firestore.collection('ambassadors').doc(uid).update({ referralCode: newCode, referralLink });

    revalidatePath('/admin/ambassadors');
    return { success: true, newCode };

  } catch (error: any) {
    console.error('[updatePromoCode] Erreur:', error);
    return { error: `Erreur lors de la mise à jour du code: ${error.message}` };
  }
}

// ─────────────────────────────────────────────
// SEND NOTIFICATION TO ALL
// ─────────────────────────────────────────────

export async function sendNotificationToAll(previousState: any, formData: FormData) {
  const { firestore } = getAdminServices();
  if (!firestore) return { error: "La base de données n'est pas initialisée." };

  const title = formData.get('title') as string;
  const message = formData.get('message') as string;
  const link = formData.get('link') as string | undefined;

  if (!title || !message) return { error: 'Le titre et le message sont obligatoires.' };

  try {
    const ambassadorsSnapshot = await firestore.collection('ambassadors').get();
    if (ambassadorsSnapshot.empty) return { error: 'Aucun ambassadeur trouvé.' };

    const batches: WriteBatch[] = [];
    let currentBatch = firestore.batch();
    let count = 0;

    ambassadorsSnapshot.docs.forEach((ambassadorDoc) => {
      const notifRef = firestore
        .collection('ambassadors')
        .doc(ambassadorDoc.id)
        .collection('notifications')
        .doc();

      currentBatch.set(notifRef, {
        title, message,
        link: link || '',
        date: new Date().toISOString(),
        isRead: false,
      });
      count++;

      if (count === 499) {
        batches.push(currentBatch);
        currentBatch = firestore.batch();
        count = 0;
      }
    });

    if (count > 0) batches.push(currentBatch);
    await Promise.all(batches.map(b => b.commit()));

    return { success: `Notification envoyée à ${ambassadorsSnapshot.size} ambassadeurs.` };

  } catch (error: any) {
    console.error('[sendNotificationToAll] Erreur:', error);
    return { error: `Erreur lors de l'envoi: ${error.message}` };
  }
}

// ─────────────────────────────────────────────
// SEND NOTIFICATION TO USER
// ─────────────────────────────────────────────

export async function sendNotificationToUser(userId: string, title: string, message: string, link: string) {
  const { firestore } = getAdminServices();
  if (!firestore) return { error: "La base de données n'est pas initialisée." };
  if (!userId || !title || !message) return { error: 'ID utilisateur, titre et message sont obligatoires.' };

  try {
    await firestore
      .collection('ambassadors')
      .doc(userId)
      .collection('notifications')
      .add({
        title, message,
        link: link || '',
        date: new Date().toISOString(),
        isRead: false,
      });
    return { success: true };
  } catch (error: any) {
    console.error('[sendNotificationToUser] Erreur:', error);
    return { error: `Erreur lors de l'envoi : ${error.message}` };
  }
}

// ─────────────────────────────────────────────
// SEND SUPPORT MESSAGE
// ─────────────────────────────────────────────

export async function sendSupportMessage(previousState: any, formData: FormData) {
  const { firestore } = getAdminServices();
  if (!firestore) return { error: "La base de données n'est pas initialisée." };

  const userId = formData.get('userId') as string;
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const subject = formData.get('subject') as string;
  const message = formData.get('message') as string;

  if (!userId || !name || !email || !subject || !message) {
    return { error: 'Tous les champs sont obligatoires.' };
  }

  try {
    await firestore.collection('supportMessages').add({
      userId, name, email, subject, message,
      date: new Date().toISOString(),
      status: 'new',
    });
    return { success: 'Votre message a été envoyé avec succès. Notre équipe vous répondra bientôt.' };
  } catch (error: any) {
    console.error('[sendSupportMessage] Erreur:', error);
    return { error: `Erreur lors de l'envoi de votre message: ${error.message}` };
  }
}
