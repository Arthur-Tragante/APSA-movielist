/**
 * ESTRUTURA DE EPISÓDIOS - EXEMPLO DE USO
 * 
 * Estrutura de dados para séries com episódios organizados por temporada
 */

// ============================================
// EXEMPLO DE COMO ADICIONAR EPISÓDIOS
// ============================================

const exemplo_serie_com_episodios = {
  // Estrutura completa de uma série
  temporadasEpisodios: [
    {
      numero: 1,  // Temporada 1
      episodios: [
        {
          numero: 1,
          titulo: "Pilot",
          sinopse: "O primeiro episódio da série",
          dateLançamento: "2023-01-01",
          avaliações: [
            {
              usuario: "João Silva",
              email: "joao@email.com",
              nota: 8,
              comentario: "Excelente início de série!",
              criadoEm: "2023-01-02T10:00:00Z",
              atualizadoEm: "2023-01-02T10:00:00Z"
            }
          ]
        },
        {
          numero: 2,
          titulo: "The Chip System",
          sinopse: "Segundo episódio",
          dateLançamento: "2023-01-08",
          avaliações: []
        }
      ]
    },
    {
      numero: 2,  // Temporada 2
      episodios: [
        {
          numero: 1,
          titulo: "Novo Começo",
          sinopse: "Primeira episódio da segunda temporada",
          dateLançamento: "2023-06-01",
          avaliações: []
        }
      ]
    }
  ]
};

// ============================================
// ENDPOINTS DISPONÍVEIS
// ============================================

/*
1. ADICIONAR EPISÓDIO
   POST /api/series/:id/episodios
   Body: {
     numeroTemporada: 1,
     episodio: {
       numero: 1,
       titulo: "Pilot",
       sinopse: "...",
       dateLançamento: "2023-01-01",
       avaliações: []
     }
   }

2. REMOVER EPISÓDIO
   DELETE /api/series/:id/episodios/:temporada/:episodio
   Exemplo: /api/series/123abc/episodios/1/1

3. AVALIAR EPISÓDIO
   POST /api/series/:id/episodios/:temporada/:episodio/avaliar
   Exemplo: /api/series/123abc/episodios/1/1/avaliar
   Body: {
     nota: 8,
     comentario: "Adorei este episódio!"
   }

4. REMOVER AVALIAÇÃO DE EPISÓDIO
   DELETE /api/series/:id/episodios/:temporada/:episodio/avaliar
   Exemplo: /api/series/123abc/episodios/1/1/avaliar
*/

// ============================================
// EXEMPLO DE USO NO FRONTEND
// ============================================

import { showService } from '../services';
import { Episodio } from '../types';

// Adicionar um episódio
async function adicionarNovoEpisodio() {
  const idSerie = "meu-id-serie";
  const novoEpisodio: Episodio = {
    numero: 3,
    titulo: "The Return",
    sinopse: "Um episódio importante da série",
    dateLançamento: "2023-01-15",
  };

  await showService.adicionarEpisodio(idSerie, 1, novoEpisodio);
}

// Avaliar um episódio
async function avaliarEpisodio() {
  const idSerie = "meu-id-serie";
  
  await showService.avaliarEpisodio(
    idSerie,
    1,           // Temporada 1
    1,           // Episódio 1
    9,           // Nota de 0-10
    "Que episódio incrível!"  // Comentário opcional
  );
}

// Remover um episódio
async function removerEpisodio() {
  const idSerie = "meu-id-serie";
  
  await showService.removerEpisodio(
    idSerie,
    1,  // Temporada
    1   // Episódio
  );
}

// Remover uma avaliação de episódio
async function removerAvaliacaoEpisodio() {
  const idSerie = "meu-id-serie";
  
  await showService.removerAvaliacaoEpisodio(
    idSerie,
    1,  // Temporada
    1   // Episódio
  );
}
