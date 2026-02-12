/**
 * Script para adicionar capas (posters) aos filmes existentes no MongoDB
 * Executa: npm run script:capas
 */

// Carrega variáveis de ambiente ANTES de importar qualquer coisa
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

import axios from 'axios';
import mongoose from 'mongoose';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/APSA-movielist';

// Schema MongoDB (flexível)
const movieSchema = new mongoose.Schema({}, { strict: false, collection: 'movies' });
const Movie = mongoose.model('Movie', movieSchema);

interface FilmeMongoDB {
  _id: string;
  title: string;
  year?: string;
  poster?: string;
}

/**
 * Busca filme no TMDB
 */
async function buscarFilmeNoTMDB(titulo: string, ano?: string): Promise<string | null> {
  try {
    // Remove " / Nome Original" se existir
    const tituloLimpo = titulo.split(' / ')[0].trim();
    
    console.log(`   🔍 Buscando: "${tituloLimpo}" (${ano || 'sem ano'})`);
    
    const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
      params: {
        query: tituloLimpo,
        year: ano,
        language: 'pt-BR',
        include_adult: false,
      },
      headers: {
        Authorization: `Bearer ${TMDB_API_KEY}`,
      },
    });

    const resultados = response.data.results;
    
    if (resultados && resultados.length > 0) {
      const filme = resultados[0];
      if (filme.poster_path) {
        const posterUrl = `${TMDB_IMAGE_BASE}${filme.poster_path}`;
        console.log(`   ✅ Capa encontrada: ${posterUrl}`);
        return posterUrl;
      } else {
        console.log(`   ⚠️  Filme encontrado mas sem capa`);
        return null;
      }
    } else {
      console.log(`   ❌ Filme não encontrado no TMDB`);
      return null;
    }
  } catch (error: any) {
    console.error(`   ❌ Erro ao buscar no TMDB:`, error.message);
    return null;
  }
}

/**
 * Atualiza poster no MongoDB
 */
async function atualizarPoster(filmeId: string, posterUrl: string): Promise<boolean> {
  try {
    await Movie.updateOne(
      { _id: new mongoose.Types.ObjectId(filmeId) },
      { $set: { poster: posterUrl } }
    );
    console.log(`   💾 Poster salvo no MongoDB`);
    return true;
  } catch (error: any) {
    console.error(`   ❌ Erro ao salvar no MongoDB:`, error.message);
    return false;
  }
}

/**
 * Adiciona um delay entre requisições
 */
function aguardar(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Processa todos os filmes
 */
async function adicionarCapas() {
  console.log('🎬 Iniciando busca de capas para filmes existentes...\n');

  if (!TMDB_API_KEY) {
    console.error('❌ TMDB_API_KEY não configurada!');
    process.exit(1);
  }

  try {
    // Conecta ao MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB\n');

    // Busca todos os filmes
    const filmes = await Movie.find().lean();
    
    console.log(`📊 Total de filmes encontrados: ${filmes.length}\n`);

    let processados = 0;
    let comCapa = 0;
    let adicionados = 0;
    let erros = 0;

    for (const doc of filmes) {
      const filme = doc as FilmeMongoDB;
      
      console.log(`\n🎬 [${processados + 1}/${filmes.length}] ${filme.title}`);
      
      // Verifica se já tem poster
      if (filme.poster) {
        console.log(`   ✅ Já tem capa: ${filme.poster}`);
        comCapa++;
      } else {
        // Busca no TMDB
        const posterUrl = await buscarFilmeNoTMDB(filme.title, filme.year);
        
        if (posterUrl) {
          // Atualiza no MongoDB
          const sucesso = await atualizarPoster(filme._id.toString(), posterUrl);
          if (sucesso) {
            adicionados++;
          } else {
            erros++;
          }
        } else {
          erros++;
        }
        
        // Aguarda 250ms entre requisições para não sobrecarregar o TMDB
        await aguardar(250);
      }
      
      processados++;
    }

    // Resumo final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO FINAL:');
    console.log('='.repeat(60));
    console.log(`✅ Total processados: ${processados}`);
    console.log(`📷 Já tinham capa: ${comCapa}`);
    console.log(`➕ Capas adicionadas: ${adicionados}`);
    console.log(`❌ Erros/não encontrados: ${erros}`);
    console.log('='.repeat(60) + '\n');
    
    console.log('🎉 Script concluído!');
    
    // Desconecta do MongoDB
    await mongoose.disconnect();
    console.log('✅ Desconectado do MongoDB');
    process.exit(0);
    
  } catch (error: any) {
    console.error('\n❌ Erro fatal:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Executa o script
adicionarCapas();

