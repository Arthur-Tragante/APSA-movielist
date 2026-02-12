import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Carrega variáveis de ambiente
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/apsa-movielist';

// Define schemas
const movieSchema = new mongoose.Schema({}, { strict: false, collection: 'movies' });
const showSchema = new mongoose.Schema({}, { strict: false, collection: 'shows' });
const userSchema = new mongoose.Schema({}, { strict: false, collection: 'users' });

const Movie = mongoose.model('Movie', movieSchema);
const Show = mongoose.model('Show', showSchema);
const User = mongoose.model('User', userSchema);

async function importData() {
  try {
    // Conecta ao MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    // Lê os arquivos JSON
    const moviesPath = path.join(__dirname, 'firestore_export', 'movies.json');
    const showsPath = path.join(__dirname, 'firestore_export', 'shows.json');
    const usersPath = path.join(__dirname, 'firestore_export', 'users.json');

    // Importa filmes
    if (fs.existsSync(moviesPath)) {
      const moviesData = JSON.parse(fs.readFileSync(moviesPath, 'utf-8'));
      if (moviesData && moviesData.length > 0) {
        // Remove o campo _id do Firebase para que o MongoDB gere novos
        const moviesWithoutId = moviesData.map((movie: any) => {
          const { _id, ...rest } = movie;
          return rest;
        });
        await Movie.insertMany(moviesWithoutId);
        console.log(`✅ ${moviesWithoutId.length} filmes importados`);
      }
    }

    // Importa séries
    if (fs.existsSync(showsPath)) {
      const showsData = JSON.parse(fs.readFileSync(showsPath, 'utf-8'));
      if (showsData && showsData.length > 0) {
        // Remove o campo _id do Firebase para que o MongoDB gere novos
        const showsWithoutId = showsData.map((show: any) => {
          const { _id, ...rest } = show;
          return rest;
        });
        await Show.insertMany(showsWithoutId);
        console.log(`✅ ${showsWithoutId.length} séries importadas`);
      }
    }

    // Importa usuários
    if (fs.existsSync(usersPath)) {
      const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
      if (usersData && usersData.length > 0) {
        // Remove o campo _id do Firebase para que o MongoDB gere novos
        const usersWithoutId = usersData.map((user: any) => {
          const { _id, ...rest } = user;
          return rest;
        });
        await User.insertMany(usersWithoutId);
        console.log(`✅ ${usersWithoutId.length} usuários importados`);
      }
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

// Executa a importação
importData();
