import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

interface FilmeSorteio {
  id: string;
  titulo: string;
  usuario: string;
  email: string;
}

interface ResultadoSorteio {
  allPicks: string[];
  winner: string;
}

interface EstadoSorteio {
  filmes: FilmeSorteio[];
  resultado: ResultadoSorteio | null;
}

type EventCallback = (...args: any[]) => void;

/**
 * Serviço para gerenciar conexão WebSocket
 */
class WebSocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, EventCallback[]> = new Map();

  /**
   * Conecta ao servidor WebSocket
   */
  connect(): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket conectado');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ WebSocket desconectado');
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Erro ao conectar WebSocket:', error);
    });

    // Re-registra todos os listeners
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach(callback => {
        this.socket?.on(event, callback);
      });
    });
  }

  /**
   * Desconecta do servidor WebSocket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Verifica se está conectado
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Registra um listener para um evento
   */
  on(event: string, callback: EventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  /**
   * Remove um listener de um evento
   */
  off(event: string, callback: EventCallback): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }

    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  /**
   * Emite um evento para o servidor
   */
  emit(event: string, ...args: any[]): void {
    if (this.socket) {
      this.socket.emit(event, ...args);
    }
  }

  /**
   * Solicita estado inicial do sorteio
   */
  obterEstadoSorteio(): void {
    this.emit('sorteio:obter-estado');
  }

  /**
   * Registra callback para estado inicial
   */
  onEstadoInicial(callback: (estado: EstadoSorteio) => void): void {
    this.on('sorteio:estado-inicial', callback);
  }

  /**
   * Registra callback para filme adicionado
   */
  onFilmeAdicionado(callback: (filme: FilmeSorteio) => void): void {
    this.on('sorteio:filme-adicionado', callback);
  }

  /**
   * Registra callback para filme removido
   */
  onFilmeRemovido(callback: (data: { id: string }) => void): void {
    this.on('sorteio:filme-removido', callback);
  }

  /**
   * Registra callback para resultado
   */
  onResultado(callback: (resultado: ResultadoSorteio) => void): void {
    this.on('sorteio:resultado', callback);
  }

  /**
   * Registra callback para resultado limpo
   */
  onResultadoLimpo(callback: () => void): void {
    this.on('sorteio:resultado-limpo', callback);
  }

  /**
   * Registra callback para filmes limpos
   */
  onFilmesLimpos(callback: () => void): void {
    this.on('sorteio:filmes-limpos', callback);
  }

  /**
   * Remove todos os listeners
   */
  removeAllListeners(): void {
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach(callback => {
        this.socket?.off(event, callback);
      });
    });
    this.listeners.clear();
  }
}

export default new WebSocketService();
