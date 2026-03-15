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
 * Interface para Episódio
 */
interface SeasonEpisode {
  season: number;
  episode: number;
  watched: boolean;
  userRatings?: UserRating[];
}

/**
 * Interface para Série no MongoDB
 */
export interface ISerie extends Document {
  title: string;
  originalTitle?: string;
  tmdbId?: number;
  genre: string;
  year: string;
  seasons: string;
  imdbRating: string;
  metascore: string;
  synopsis: string;
  poster: string;
  ratings: any[];
  user: string;
  watched: boolean;
  seasonEpisodes: SeasonEpisode[];
  userRatings: UserRating[];
  averageUserRating?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Schema da Série
 */
const SerieSchema = new Schema<ISerie>({
  title: { type: String, required: true },
  originalTitle: { type: String },
  tmdbId: { type: Number },
  genre: { type: String, required: true },
  year: { type: String, required: true },
  seasons: { type: String, required: true },
  imdbRating: { type: String, required: true },
  metascore: { type: String, required: true },
  synopsis: { type: String, required: true },
  poster: { type: String, required: true },
  ratings: [Schema.Types.Mixed],
  user: { type: String, required: true, index: true },
  watched: { type: Boolean, default: false },
  seasonEpisodes: [{
    season: { type: Number, required: true },
    episode: { type: Number, required: true },
    watched: { type: Boolean, default: false },
    userRatings: [{
      user: { type: String },
      email: { type: String },
      rating: { type: Number },
      comment: { type: String }
    }]
  }],
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
  collection: 'shows',
  versionKey: false
});

// Índices
SerieSchema.index({ user: 1, createdAt: -1 });

export const SerieModel = mongoose.model<ISerie>('Show', SerieSchema);
