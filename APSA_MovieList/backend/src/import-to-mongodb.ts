/**
 * Importa dados exportados do Firebase para o MongoDB.
 *
 * Uso:
 *   npm run import:mongodb
 *
 * Espera arquivos JSON em src/firestore_export/ gerados pelo script export-firebase.ts
 */

import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/apsa-movielist';
const EXPORT_DIR = path.join(__dirname, 'firestore_export');
const SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = 'mudar123';

// Schemas flexíveis para importação
const movieSchema = new mongoose.Schema({}, { strict: false, collection: 'movies' });
const showSchema = new mongoose.Schema({}, { strict: false, collection: 'shows' });
const userSchema = new mongoose.Schema({}, { strict: false, collection: 'users' });
const sorteioFilmeSchema = new mongoose.Schema({}, { strict: false, collection: 'sorteio_filmes' });
const sorteioResultadoSchema = new mongoose.Schema({}, { strict: false, collection: 'sorteio_resultados' });

const Movie = mongoose.model('ImportMovie', movieSchema);
const Show = mongoose.model('ImportShow', showSchema);
const User = mongoose.model('ImportUser', userSchema);
const SorteioFilme = mongoose.model('ImportSorteioFilme', sorteioFilmeSchema);
const SorteioResultado = mongoose.model('ImportSorteioResultado', sorteioResultadoSchema);

function readJson(filename: string): any | null {
  const filepath = path.join(EXPORT_DIR, filename);
  if (!fs.existsSync(filepath)) {
    console.log(`   ⚠️  Arquivo não encontrado: ${filename}`);
    return null;
  }
  return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
}

async function importData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB\n');

    // ── Importar Filmes ─────────────────────────────────────────────────
    const moviesData = readJson('movies.json');
    if (moviesData && moviesData.length > 0) {
      await Movie.deleteMany({});
      const movies = moviesData.map((movie: any) => {
        const { _firebaseId, ...rest } = movie;
        return rest;
      });
      await Movie.insertMany(movies);
      console.log(`✅ ${movies.length} filmes importados`);
    }

    // ── Importar Séries ─────────────────────────────────────────────────
    const showsData = readJson('shows.json');
    if (showsData && showsData.length > 0) {
      await Show.deleteMany({});
      const shows = showsData.map((show: any) => {
        const { _firebaseId, ...rest } = show;
        return rest;
      });
      await Show.insertMany(shows);
      console.log(`✅ ${shows.length} séries importadas`);
    }

    // ── Importar Usuários (com senha bcrypt) ────────────────────────────
    const usersData = readJson('users.json');
    if (usersData && usersData.length > 0) {
      await User.deleteMany({});
      const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);
      const users = usersData.map((user: any) => {
        const { _firebaseId, ...rest } = user;
        return {
          ...rest,
          password: hashedPassword,
        };
      });
      await User.insertMany(users);
      console.log(`✅ ${users.length} usuários importados (senha padrão: "${DEFAULT_PASSWORD}")`);
      console.log('   ⚠️  IMPORTANTE: Peça aos usuários para trocar a senha no primeiro login!');
    }

    // ── Importar dados do Realtime Database (Sorteio) ───────────────────
    const realtimeMovies = readJson('realtime_movies.json');
    if (realtimeMovies) {
      await SorteioFilme.deleteMany({});
      const entries = Object.entries(realtimeMovies);
      if (entries.length > 0) {
        const sorteioFilmes = entries.map(([_key, value]: [string, any]) => ({
          titulo: value.title || '',
          usuario: value.user || '',
          email: value.email || '',
          criadoEm: new Date(),
        }));
        await SorteioFilme.insertMany(sorteioFilmes);
        console.log(`✅ ${sorteioFilmes.length} filmes do sorteio importados`);
      }
    }

    const realtimeResultado = readJson('realtime_sorteio_resultado.json');
    if (realtimeResultado) {
      await SorteioResultado.deleteMany({});
      await SorteioResultado.create({
        allPicks: realtimeResultado.allPicks || [],
        winner: realtimeResultado.winner || '',
        timestamp: realtimeResultado.timestamp ? new Date(realtimeResultado.timestamp) : new Date(),
      });
      console.log('✅ Resultado do sorteio importado');
    }

    console.log('\n🎉 Importação concluída com sucesso!');

  } catch (error) {
    console.error('❌ Erro na importação:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Desconectado do MongoDB');
  }
}

importData();
