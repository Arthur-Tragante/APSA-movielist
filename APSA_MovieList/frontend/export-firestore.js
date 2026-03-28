const admin = require('firebase-admin');
const fs = require('fs').promises;
const path = require('path');

// Carrega a credencial do Firebase
admin.initializeApp({
  credential: admin.credential.cert(require('./serviceAccountKey.json')),
});

const db = admin.firestore();

async function exportCollection(colRef, outDir) {
  const snapshot = await colRef.get();
  const docs = [];

  snapshot.forEach((doc) => {
    const data = doc.data();

    // Mongo usa "_id" como chave recomendada
    // Aqui eu aproveito o ID do documento do Firestore
    docs.push({
      _id: doc.id,
      ...data,
    });
  });

  const filePath = path.join(outDir, `${colRef.id}.json`);
  await fs.writeFile(filePath, JSON.stringify(docs, null, 2), 'utf8');

  console.log(`Coleção ${colRef.id}: ${docs.length} documentos exportados -> ${filePath}`);
}

async function main() {
  const outDir = path.join(__dirname, 'firestore_export');
  await fs.mkdir(outDir, { recursive: true });

  const collections = await db.listCollections();
  console.log(
    'Coleções encontradas:',
    collections.map((c) => c.id)
  );

  for (const col of collections) {
    await exportCollection(col, outDir);
  }

  console.log('✅ Exportação concluída.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Erro ao exportar Firestore:', err);
  process.exit(1);
});
