
'use server'

import { getAdminServices } from '@/firebase/server-admin';
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from 'next/navigation';
import { WriteBatch, setDoc as adminSetDoc, doc as adminDoc, updateDoc as adminUpdateDoc, deleteDoc, getDocs, getDoc, collection, query, where } from 'firebase-admin/firestore';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';


export async function signupUser(previousState: any, formData: FormData) {
  const { firestore, auth: adminAuth } = getAdminServices();

  if (!firestore || !adminAuth) {
    return { error: "Les services d'authentification ou de base de données ne sont pas initialisés." };
  }

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!name || !email || !password) {
    return { error: 'Nom, email et mot de passe sont obligatoires.' };
  }

  try {
    // 1. Créer l'utilisateur dans Firebase Auth
    const userRecord = await adminAuth.createUser({
      email: email,
      password: password,
      displayName: name,
    });

    const uid = userRecord.uid;

    // ---- Logique de génération de code promo automatique AMÉLIORÉE ----
    const generateRandomSuffix = (length: number = 4): string => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    const generatePromoCode = (name: string, uid: string): string => {
      // Nettoyer le nom : enlever accents, caractères spéciaux, espaces
      const cleanName = name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
        .replace(/[^a-zA-Z]/g, '') // Garder seulement les lettres
        .toUpperCase();

      // Prendre les 3-4 premières lettres du nom
      const namePrefix = cleanName.substring(0, Math.min(4, cleanName.length));

      // Si le nom est vide ou trop court, utiliser "AMB"
      const prefix = namePrefix.length >= 2 ? namePrefix : 'AMB';

      // Générer un suffixe aléatoire de 4 caractères
      const suffix = generateRandomSuffix(4);

      return `${prefix}${suffix}`;
    };

    // Générer un code promo unique avec retry
    let promoCode = '';
    let attempts = 0;
    const maxAttempts = 5;
    const ambassadorsRef = collection(firestore, 'ambassadors');

    while (attempts < maxAttempts) {
      promoCode = generatePromoCode(name, uid);

      // Vérifier si le code existe déjà
      const q = query(ambassadorsRef, where('referralCode', '==', promoCode));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // Code unique trouvé !
        break;
      }

      attempts++;
    }

    // Fallback si tous les essais ont échoué (très improbable)
    if (attempts >= maxAttempts) {
      const timestamp = Date.now().toString().slice(-6);
      promoCode = `AMB${timestamp}`;
      console.warn(`Fallback promo code used for user ${uid}: ${promoCode}`);
    }

    const referralLink = `https://ttrgestion.com/?ref=${promoCode}`;
    console.log(`Generated promo code for ${name}: ${promoCode}`);
    // ---- Fin de la logique ----

    // 2. Préparer les documents pour Firestore
    const userProfile = {
      id: uid,
      name: name,
      email: email,
      createdAt: new Date().toISOString(),
      isAmbassador: true,
    };

    const ambassadorProfile = {
      id: uid,
      name: name,
      email: email,
      role: 'ambassadeur',
      level: 1,
      monoyi: 0,
      referralCode: promoCode,
      referralLink: referralLink,
      avatarUrl: `https://picsum.photos/seed/${uid}/40/40`,
      verificationStatus: 'not_verified',
      isVerified: false,
      createdAt: new Date().toISOString(),
    };

    // 3. Écrire les documents dans un batch
    const batch = firestore.batch();
    const userDocRef = adminDoc(firestore, 'users', uid);
    const ambassadorDocRef = adminDoc(firestore, 'ambassadors', uid);

    batch.set(userDocRef, userProfile);
    batch.set(ambassadorDocRef, ambassadorProfile);

    await batch.commit();

    return { success: true };

  } catch (authError: any) {
    if (authError.code === 'auth/email-already-exists') {
      return { error: 'Cet email est déjà utilisé.' };
    } else if (authError.code === 'auth/weak-password') {
      return { error: 'Le mot de passe doit contenir au moins 6 caractères.' };
    }
    console.error("Erreur détaillée d'inscription (serveur):", authError);
    return { error: `La création du profil a échoué. Erreur: ${authError.message}` };
  }
}


export async function logout() {
  cookies().delete('firebase-auth');
  revalidatePath('/');
}

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
    const ambassadorDocRef = adminDoc(firestore, 'ambassadors', uid);

    const updateData: { [key: string]: any } = {
      country: country,
      payoutMethod: payoutMethod,
      feedback: feedback,
      dob: `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`,
    };

    if (referralCode) {
      updateData.referredBy = referralCode;
    }

    await adminUpdateDoc(ambassadorDocRef, updateData);

    revalidatePath('/dashboard');

  } catch (error: any) {
    console.error('Error completing registration:', error);
    return { error: `Une erreur est survenue: ${error.message}` };
  }

  redirect('/dashboard');
}

export async function generateAndAssignPromoCode(ambassadorId: string) {
  const { firestore } = getAdminServices();
  if (!firestore) {
    return { error: "La base de données n'est pas initialisée." };
  }

  if (!ambassadorId) {
    return { error: "L'ID de l'ambassadeur est manquant." };
  }

  try {
    const ambassadorRef = adminDoc(firestore, 'ambassadors', ambassadorId);
    const ambassadorSnap = await getDoc(ambassadorRef);

    if (!ambassadorSnap.exists()) {
      return { error: "Ambassadeur non trouvé." };
    }

    const ambassadorData = ambassadorSnap.data();
    const name = ambassadorData?.name;
    if (!name) {
      return { error: "Le nom de l'ambassadeur est nécessaire pour générer un code." };
    }

    // ---- Logique de génération de code promo ----
    let basePromoCode = name.toLowerCase().replace(/[^a-z]/g, '').substring(0, 4) + ambassadorId.slice(-3);
    if (basePromoCode.length < 4) {
      basePromoCode = 'user' + ambassadorId.slice(-3);
    }

    // Plan de secours : Vérifier si le code existe
    const ambassadorsRef = collection(firestore, 'ambassadors');
    let q = query(ambassadorsRef, where('referralCode', '==', basePromoCode));
    let querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Le code existe déjà, ajoutons un chiffre aléatoire
      basePromoCode = `${basePromoCode}${Math.floor(Math.random() * 10)}`;
      q = query(ambassadorsRef, where('referralCode', '==', basePromoCode));
      querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        basePromoCode = `${basePromoCode}${Math.floor(Math.random() * 10)}`;
      }
    }

    const finalPromoCode = basePromoCode;
    const referralLink = `https://ttrgestion.com/?ref=${finalPromoCode}`;
    // ---- Fin de la logique ----

    await adminUpdateDoc(ambassadorRef, {
      referralCode: finalPromoCode,
      referralLink: referralLink,
    });

    revalidatePath('/admin/ambassadors');
    return { success: true, newCode: finalPromoCode };

  } catch (error: any) {
    console.error('Error generating promo code:', error);
    return { error: `Une erreur est survenue lors de la génération du code: ${error.message}` };
  }
}


export async function updatePromoCode(uid: string, newCode: string) {
  const { firestore } = getAdminServices();
  if (!firestore) {
    return { error: "La base de données n'est pas initialisée." };
  }

  if (!uid || !newCode) {
    return { error: 'Informations utilisateur ou nouveau code manquants.' };
  }

  if (newCode.length < 4 || newCode.length > 8) {
    return { error: 'Le nouveau code doit contenir entre 4 et 8 caractères.' };
  }

  // Vérifier si le code existe déjà
  const ambassadorsRef = collection(firestore, 'ambassadors');
  const q = query(ambassadorsRef, where('referralCode', '==', newCode));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty && querySnapshot.docs.some(doc => doc.id !== uid)) {
    return { error: 'Ce code promo est déjà utilisé par un autre ambassadeur.' };
  }


  try {
    const referralLink = `https://ttrgestion.com/?ref=${newCode}`;

    await adminUpdateDoc(adminDoc(firestore, 'ambassadors', uid), {
      referralCode: newCode,
      referralLink: referralLink,
    });

    revalidatePath('/admin/ambassadors');
    return { success: true, newCode };

  } catch (error: any) {
    console.error('Error updating promo code:', error);
    return { error: `Une erreur est survenue lors de la mise à jour du code: ${error.message}` };
  }
}

export async function sendNotificationToAll(previousState: any, formData: FormData) {
  const { firestore } = getAdminServices();
  if (!firestore) {
    return { error: "La base de données n'est pas initialisée." };
  }

  const title = formData.get('title') as string;
  const message = formData.get('message') as string;
  const link = formData.get('link') as string | undefined;

  if (!title || !message) {
    return { error: 'Le titre et le message sont obligatoires.' };
  }

  try {
    const ambassadorsSnapshot = await firestore.collection('ambassadors').get();
    if (ambassadorsSnapshot.empty) {
      return { error: 'Aucun ambassadeur trouvé.' };
    }

    const batches: WriteBatch[] = [];
    let currentBatch = firestore.batch();
    let operationCount = 0;

    ambassadorsSnapshot.docs.forEach((ambassadorDoc) => {
      const notificationData = {
        title,
        message,
        link: link || '',
        date: new Date().toISOString(),
        isRead: false,
      };

      const notificationRef = firestore.collection('ambassadors').doc(ambassadorDoc.id).collection('notifications').doc();
      currentBatch.set(notificationRef, notificationData);
      operationCount++;

      if (operationCount === 499) {
        batches.push(currentBatch);
        currentBatch = firestore.batch();
        operationCount = 0;
      }
    });

    if (operationCount > 0) {
      batches.push(currentBatch);
    }

    await Promise.all(batches.map(batch => batch.commit()));

    return { success: `Notification envoyée à ${ambassadorsSnapshot.size} ambassadeurs.` };

  } catch (error: any) {
    console.error('Error sending notifications:', error);
    return { error: `Une erreur est survenue lors de l'envoi: ${error.message}` };
  }
}


export async function sendNotificationToUser(userId: string, title: string, message: string, link: string) {
  const { firestore } = getAdminServices();
  if (!firestore) {
    return { error: "La base de données n'est pas initialisée." };
  }

  if (!userId || !title || !message) {
    return { error: 'ID utilisateur, titre et message sont obligatoires.' };
  }

  try {
    const notificationData = {
      title,
      message,
      link: link || '',
      date: new Date().toISOString(),
      isRead: false,
    };
    await firestore.collection('ambassadors').doc(userId).collection('notifications').add(notificationData);
    return { success: true };
  } catch (error: any) {
    console.error('Error sending single notification:', error);
    return { error: `Une erreur est survenue lors de l'envoi : ${error.message}` };
  }
}

export async function sendSupportMessage(previousState: any, formData: FormData) {
  const { firestore } = getAdminServices();
  if (!firestore) {
    return { error: "La base de données n'est pas initialisée." };
  }

  const userId = formData.get('userId') as string;
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const subject = formData.get('subject') as string;
  const message = formData.get('message') as string;

  if (!userId || !name || !email || !subject || !message) {
    return { error: 'Tous les champs sont obligatoires.' };
  }

  try {
    const supportMessageData = {
      userId,
      name,
      email,
      subject,
      message,
      date: new Date().toISOString(),
      status: 'new',
    };

    await firestore.collection('supportMessages').add(supportMessageData);

    return { success: 'Votre message a été envoyé avec succès. Notre équipe vous répondra bientôt.' };
  } catch (error: any) {
    console.error('Error sending support message:', error);
    return { error: `Une erreur est survenue lors de l'envoi de votre message: ${error.message}` };
  }
}

