import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { env } from './env.config';

let io: SocketIOServer;

/**
 * Inicializa o servidor WebSocket
 */
export function initializeWebSocket(httpServer: HTTPServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ Cliente WebSocket conectado: ${socket.id}`);

    // Envia estado inicial ao conectar
    socket.on('sorteio:obter-estado', async () => {
      try {
        // Lazy import para evitar dependência circular
        const sorteioRepository = (await import('../repositories/sorteio.repository')).default;
        
        const filmes = await sorteioRepository.buscarTodosFilmes();
        const resultado = await sorteioRepository.buscarUltimoResultado();
        
        socket.emit('sorteio:estado-inicial', {
          filmes: filmes.map(f => ({
            id: f._id.toString(),
            titulo: f.titulo,
            usuario: f.usuario,
            email: f.email
          })),
          resultado: resultado ? {
            allPicks: resultado.allPicks,
            winner: resultado.winner
          } : null
        });
      } catch (erro) {
        console.error('Erro ao obter estado do sorteio:', erro);
      }
    });

    socket.on('disconnect', () => {
      console.log(`❌ Cliente WebSocket desconectado: ${socket.id}`);
    });
  });

  return io;
}

/**
 * Obtém instância do Socket.IO
 */
export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.IO não foi inicializado!');
  }
  return io;
}

/**
 * Emite evento quando filme é adicionado
 */
export function emitFilmeAdicionado(filme: any): void {
  if (io) {
    io.emit('sorteio:filme-adicionado', {
      id: filme._id.toString(),
      titulo: filme.titulo,
      usuario: filme.usuario,
      email: filme.email
    });
  }
}

/**
 * Emite evento quando filme é removido
 */
export function emitFilmeRemovido(filmeId: string): void {
  if (io) {
    io.emit('sorteio:filme-removido', { id: filmeId });
  }
}

/**
 * Emite evento quando sorteio é realizado
 */
export function emitResultadoSorteio(resultado: { allPicks: string[]; winner: string }): void {
  if (io) {
    io.emit('sorteio:resultado', resultado);
  }
}

/**
 * Emite evento quando resultado é limpo
 */
export function emitResultadoLimpo(): void {
  if (io) {
    io.emit('sorteio:resultado-limpo');
  }
}

/**
 * Emite evento quando todos os filmes são limpos
 */
export function emitFilmesLimpos(): void {
  if (io) {
    io.emit('sorteio:filmes-limpos');
  }
}
