import mongoose, { Schema, Document } from 'mongoose';

/**
 * Interface para Avaliação de Usuário
 */
interface UserRating {
  user: string;
  email: string;
  rating: number;
  comment?: string;
}

/**
 * Interface para Filme no MongoDB
 */
export interface IFilme extends Document {
  title: string;
  genre: string;
  year: string;
  duration: string;
  imdbRating: string;
  metascore: string;
  synopsis: string;
  poster: string;
  ratings: any[];
  user: string;
  watched: boolean;
  userRatings: UserRating[];
  averageUserRating?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Schema do Filme
 */
const FilmeSchema = new Schema<IFilme>({
  title: { type: String, required: true },
  genre: { type: String, required: true },
  year: { type: String, required: true },
  duration: { type: String, required: true },
  imdbRating: { type: String, required: true },
  metascore: { type: String, required: true },
  synopsis: { type: String, required: true },
  poster: { type: String, required: true },
  ratings: [Schema.Types.Mixed],
  user: { type: String, required: true, index: true },
  watched: { type: Boolean, default: false },
  userRatings: [{
    user: { type: String, required: true },
    email: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, default: '' }
  }],
  averageUserRating: { type: Number, default: 0 },
  createdAt: { type: String },
  updatedAt: { type: String }
}, {
  collection: 'movies',
  versionKey: false
});

// Índices
FilmeSchema.index({ user: 1, createdAt: -1 });

export const FilmeModel = mongoose.model<IFilme>('Movie', FilmeSchema);
