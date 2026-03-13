/**
 * Script para exportar dados do Firebase (Firestore + Realtime Database)
 * e salvar como JSON para importação no MongoDB.
 *
 * Uso:
 *   npx ts-node scripts/export-firebase.ts
 *
 * Requer variáveis de ambiente do Firebase no .env:
 *   FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, FIREBASE_DATABASE_URL
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// ── Inicializa Firebase Admin ───────────────────────────────────────────────
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
  console.error('❌ Variáveis de ambiente do Firebase não configuradas.');
  console.error('   Necessário: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
  console.error('   Opcional:   FIREBASE_DATABASE_URL (para Realtime Database)');
  process.exit(1);
}

const app = admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey,
  }),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

const firestore = admin.firestore();

// ── Diretório de saída ──────────────────────────────────────────────────────
const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'firestore_export');

function ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

// ── Exporta uma coleção inteira do Firestore ────────────────────────────────
async function exportCollection(collectionName: string): Promise<any[]> {
  console.log(`📦 Exportando coleção "${collectionName}"...`);
  const snapshot = await firestore.collection(collectionName).get();

  if (snapshot.empty) {
    console.log(`   ⚠️  Coleção "${collectionName}" está vazia`);
    return [];
  }

  const docs = snapshot.docs.map((doc) => ({
    _firebaseId: doc.id,
    ...doc.data(),
  }));

  console.log(`   ✅ ${docs.length} documentos encontrados`);
  return docs;
}

// ── Exporta nó do Realtime Database ─────────────────────────────────────────
async function exportRealtimeNode(nodePath: string): Promise<any> {
  if (!process.env.FIREBASE_DATABASE_URL) {
    console.log(`   ⚠️  FIREBASE_DATABASE_URL não configurada, pulando Realtime Database`);
    return null;
  }

  console.log(`📦 Exportando Realtime Database nó "${nodePath}"...`);
  const db = admin.database();
  const snapshot = await db.ref(nodePath).once('value');

  if (!snapshot.exists()) {
    console.log(`   ⚠️  Nó "${nodePath}" não existe ou está vazio`);
    return null;
  }

  const data = snapshot.val();
  console.log(`   ✅ Dados encontrados`);
  return data;
}

// ── Salva JSON ──────────────────────────────────────────────────────────────
function saveJson(filename: string, data: any) {
  const filepath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`   💾 Salvo em ${filepath}`);
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Iniciando exportação do Firebase...\n');
  ensureOutputDir();

  try {
    // ── Firestore Collections ─────────────────────────────────────────────
    const movies = await exportCollection('movies');
    saveJson('movies.json', movies);

    const shows = await exportCollection('shows');
    saveJson('shows.json', shows);

    const users = await exportCollection('users');
    saveJson('users.json', users);

    // ── Realtime Database ─────────────────────────────────────────────────
    const realtimeMovies = await exportRealtimeNode('Movies');
    if (realtimeMovies) {
      saveJson('realtime_movies.json', realtimeMovies);
    }

    const sorteioResultado = await exportRealtimeNode('SorteioResultado');
    if (sorteioResultado) {
      saveJson('realtime_sorteio_resultado.json', sorteioResultado);
    }

    // ── Resumo ────────────────────────────────────────────────────────────
    console.log('\n========================================');
    console.log('📊 Resumo da Exportação:');
    console.log(`   Filmes:            ${movies.length}`);
    console.log(`   Séries:            ${shows.length}`);
    console.log(`   Usuários:          ${users.length}`);
    console.log(`   Realtime Movies:   ${realtimeMovies ? 'exportado' : 'não disponível'}`);
    console.log(`   Sorteio Resultado: ${sorteioResultado ? 'exportado' : 'não disponível'}`);
    console.log('========================================');
    console.log(`\n✅ Arquivos salvos em: ${OUTPUT_DIR}`);
    console.log('   Para importar no MongoDB, execute: npm run import:mongodb');

  } catch (error) {
    console.error('\n❌ Erro durante exportação:', error);
    process.exit(1);
  } finally {
    await app.delete();
  }
}

main();
