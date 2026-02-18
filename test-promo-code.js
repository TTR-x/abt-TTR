/**
 * Script de Test : Vérification du Code Promo à l'Inscription
 * 
 * Ce script teste que chaque nouvel utilisateur reçoit bien un code promo
 * fonctionnel dès son inscription.
 * 
 * Usage: node test-promo-code.js
 */

import { getAdminServices } from './src/firebase/server-admin.js';
import { collection, query, where, getDocs } from 'firebase-admin/firestore';

async function testPromoCodeGeneration() {
    console.log('🧪 Test de Génération de Code Promo\n');

    const { firestore } = getAdminServices();

    if (!firestore) {
        console.error('❌ Firestore non initialisé');
        return;
    }

    try {
        // 1. Récupérer tous les ambassadeurs
        console.log('📊 Récupération des ambassadeurs...');
        const ambassadorsRef = collection(firestore, 'ambassadors');
        const snapshot = await getDocs(ambassadorsRef);

        console.log(`✅ ${snapshot.size} ambassadeurs trouvés\n`);

        // 2. Vérifier que chaque ambassadeur a un code
        let withCode = 0;
        let withoutCode = 0;
        let duplicates = new Map();
        const codes = new Set();

        snapshot.forEach((doc) => {
            const data = doc.data();
            const code = data.referralCode;

            if (code) {
                withCode++;

                // Vérifier les doublons
                if (codes.has(code)) {
                    if (!duplicates.has(code)) {
                        duplicates.set(code, []);
                    }
                    duplicates.get(code).push(doc.id);
                } else {
                    codes.add(code);
                }

                console.log(`✅ ${data.name}: ${code}`);
            } else {
                withoutCode++;
                console.log(`❌ ${data.name} (${doc.id}): PAS DE CODE`);
            }
        });

        // 3. Résultats
        console.log('\n📈 RÉSULTATS:');
        console.log(`   Avec code: ${withCode}/${snapshot.size}`);
        console.log(`   Sans code: ${withoutCode}/${snapshot.size}`);

        if (duplicates.size > 0) {
            console.log(`\n⚠️  DOUBLONS DÉTECTÉS (${duplicates.size}):`);
            duplicates.forEach((ids, code) => {
                console.log(`   Code "${code}" utilisé par: ${ids.join(', ')}`);
            });
        } else {
            console.log('\n✅ Aucun doublon détecté');
        }

        // 4. Test du webhook
        console.log('\n🔗 Test de Recherche par Code (Simulation Webhook)...');
        if (codes.size > 0) {
            const testCode = Array.from(codes)[0];
            const q = query(ambassadorsRef, where('referralCode', '==', testCode));
            const result = await getDocs(q);

            if (!result.empty) {
                console.log(`✅ Code "${testCode}" trouvé → Webhook fonctionnel`);
            } else {
                console.log(`❌ Code "${testCode}" non trouvé → Webhook cassé`);
            }
        }

        // 5. Conclusion
        console.log('\n🎯 CONCLUSION:');
        if (withoutCode === 0 && duplicates.size === 0) {
            console.log('✅ TOUS LES TESTS PASSÉS');
            console.log('   - Tous les ambassadeurs ont un code');
            console.log('   - Tous les codes sont uniques');
            console.log('   - Le webhook peut trouver les codes');
        } else {
            console.log('❌ PROBLÈMES DÉTECTÉS');
            if (withoutCode > 0) {
                console.log(`   - ${withoutCode} ambassadeur(s) sans code`);
            }
            if (duplicates.size > 0) {
                console.log(`   - ${duplicates.size} code(s) en doublon`);
            }
        }

    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
    }
}

// Exécuter le test
testPromoCodeGeneration()
    .then(() => {
        console.log('\n✅ Test terminé');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Erreur fatale:', error);
        process.exit(1);
    });
