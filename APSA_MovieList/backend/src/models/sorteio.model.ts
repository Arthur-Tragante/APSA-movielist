import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface para Filme do Sorteio
 */
export interface ISorteioFilme extends Document {
  titulo: string;
  usuario: string;
  email: string;
  criadoEm: Date;
}

/**
 * Interface para Resultado do Sorteio
 */
export interface ISorteioResultado extends Document {
  allPicks: string[];
  winner: string;
  timestamp: Date;
}

/**
 * Schema para Filme do Sorteio
 */
const sorteioFilmeSchema = new Schema<ISorteioFilme>({
  titulo: {
    type: String,
    required: true,
    trim: true
  },
  usuario: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  criadoEm: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'sorteio_filmes'
});

/**
 * Schema para Resultado do Sorteio
 */
const sorteioResultadoSchema = new Schema<ISorteioResultado>({
  allPicks: {
    type: [String],
    required: true,
    default: []
  },
  winner: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'sorteio_resultados'
});

// Índices
sorteioFilmeSchema.index({ email: 1 });
sorteioFilmeSchema.index({ criadoEm: -1 });
sorteioResultadoSchema.index({ timestamp: -1 });

export const SorteioFilmeModel = mongoose.model<ISorteioFilme>('SorteioFilme', sorteioFilmeSchema);
export const SorteioResultadoModel = mongoose.model<ISorteioResultado>('SorteioResultado', sorteioResultadoSchema);
