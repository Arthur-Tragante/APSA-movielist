import mongoose, { Schema, Document } from 'mongoose';

/**
 * Interface para Usuário no MongoDB
 */
export interface IUsuario extends Document {
  name?: string;
  nome?: string;
  email: string;
  password?: string;
  resetToken?: string;
  resetTokenExpiry?: Date;
}

/**
 * Schema do Usuário
 */
const UsuarioSchema = new Schema<IUsuario>({
  name: { type: String },
  nome: { type: String },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String },
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },
}, {
  collection: 'users',
  versionKey: false
});

// Índice único no email
UsuarioSchema.index({ email: 1 }, { unique: true });

export const UsuarioModel = mongoose.model<IUsuario>('User', UsuarioSchema);
