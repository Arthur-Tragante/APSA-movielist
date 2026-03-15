import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

/**
 * Middleware genérico para validar corpo da requisição
 */
export const validarCorpo = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const erros = error.details.map((detail) => detail.message);
      return res.status(400).json({
        sucesso: false,
        erro: 'Validação falhou',
        detalhes: erros,
      });
    }

    req.body = value;
    return next();
  };
};

/**
 * Schemas de validação para filmes
 */
export const filmeSchemas = {
  criar: Joi.object({
    titulo: Joi.string().required().trim().max(200).messages({
      'string.empty': 'Título é obrigatório',
      'string.max': 'Título deve ter no máximo 200 caracteres',
    }),
    tituloOriginal: Joi.string().required().trim().max(200),
    ano: Joi.string()
      .required()
      .pattern(/^\d{4}$/)
      .messages({
        'string.pattern.base': 'Ano deve ter 4 dígitos',
      }),
    duracao: Joi.string()
      .required()
      .pattern(/^\d+( min)?$/)
      .messages({
        'string.pattern.base': 'Duração deve ser um número',
      }),
    genero: Joi.string().required().trim().max(200),
    sinopse: Joi.string().allow('').max(5000),
    poster: Joi.string().uri().allow(''),
    notaImdb: Joi.string().allow(''),
    votosImdb: Joi.string().allow(''),
    metascore: Joi.string().allow(''),
    avaliacoes: Joi.array().items(
      Joi.object({
        fonte: Joi.string().required(),
        valor: Joi.string().required(),
      })
    ),
    assistido: Joi.boolean().required(),
    usuario: Joi.string().email().optional(), // Aceita usuario opcional do frontend
  }),

  atualizar: Joi.object({
    titulo: Joi.string().trim().max(200),
    tituloOriginal: Joi.string().trim().max(200),
    ano: Joi.string().pattern(/^\d{4}$/),
    duracao: Joi.string().pattern(/^\d+( min)?$/),
    genero: Joi.string().trim().max(200),
    sinopse: Joi.string().allow('').max(5000),
    poster: Joi.string().uri().allow(''),
    notaImdb: Joi.string().allow(''),
    votosImdb: Joi.string().allow(''),
    metascore: Joi.string().allow(''),
    avaliacoes: Joi.array().items(
      Joi.object({
        fonte: Joi.string().required(),
        valor: Joi.string().required(),
      })
    ),
    avaliacoesUsuarios: Joi.array().items(
      Joi.object({
        usuario: Joi.string(),
        email: Joi.string().email(),
        nota: Joi.number().min(0).max(10),
        assistido: Joi.boolean(),
        comentario: Joi.string().allow(''),
      })
    ),
    assistido: Joi.boolean(),
  }).min(1),

  avaliar: Joi.object({
    nota: Joi.number().min(0).max(10).required().messages({
      'number.min': 'Nota mínima é 0',
      'number.max': 'Nota máxima é 10',
      'any.required': 'Nota é obrigatória',
    }),
    comentario: Joi.string().allow('').max(1000),
  }),
};

/**
 * Schemas de validação para séries
 */
export const serieSchemas = {
  criar: Joi.object({
    titulo: Joi.string().required().trim().max(200).messages({
      'string.empty': 'Título é obrigatório',
      'string.max': 'Título deve ter no máximo 200 caracteres',
    }),
    tituloOriginal: Joi.string().allow('').trim().max(200),
    idTmdb: Joi.number().integer().allow(null).optional(),
    ano: Joi.string().required(),
    temporadas: Joi.string().required().messages({
      'string.empty': 'Número de temporadas é obrigatório',
    }),
    genero: Joi.string().required().trim().max(200),
    sinopse: Joi.string().allow('').max(5000),
    poster: Joi.string().uri().allow(''),
    notaImdb: Joi.string().allow(''),
    votosImdb: Joi.string().allow(''),
    metascore: Joi.string().allow(''),
    avaliacoes: Joi.array().items(
      Joi.object({
        fonte: Joi.string().required(),
        valor: Joi.string().required(),
      })
    ),
    assistido: Joi.boolean().required(),
    temporadasEpisodios: Joi.array().items(
      Joi.object({
        numero: Joi.number().required(),
        episodios: Joi.array().items(
          Joi.object({
            numero: Joi.number().required(),
            titulo: Joi.string().required(),
            sinopse: Joi.string().allow(''),
            dataLancamento: Joi.string().allow(''),
          })
        ),
      })
    ).default([]),
  }),

  atualizar: Joi.object({
    titulo: Joi.string().trim().max(200),
    tituloOriginal: Joi.string().allow('').trim().max(200),
    idTmdb: Joi.number().integer().allow(null).optional(),
    ano: Joi.string(),
    temporadas: Joi.string(),
    genero: Joi.string().trim().max(200),
    sinopse: Joi.string().allow('').max(5000),
    poster: Joi.string().uri().allow(''),
    notaImdb: Joi.string().allow(''),
    votosImdb: Joi.string().allow(''),
    metascore: Joi.string().allow(''),
    avaliacoes: Joi.array().items(
      Joi.object({
        fonte: Joi.string().required(),
        valor: Joi.string().required(),
      })
    ),
    assistido: Joi.boolean(),
    temporadasEpisodios: Joi.array().items(
      Joi.object({
        numero: Joi.number().required(),
        episodios: Joi.array().items(
          Joi.object({
            numero: Joi.number().required(),
            titulo: Joi.string().required(),
            sinopse: Joi.string().allow(''),
            dataLancamento: Joi.string().allow(''),
          })
        ),
      })
    ),
  }).min(1),

  avaliar: Joi.object({
    nota: Joi.number().min(0).max(10).required().messages({
      'number.min': 'Nota mínima é 0',
      'number.max': 'Nota máxima é 10',
      'any.required': 'Nota é obrigatória',
    }),
    comentario: Joi.string().allow('').max(1000),
  }),

  avaliarEpisodio: Joi.object({
    nota: Joi.number().min(0).max(10).required().messages({
      'number.min': 'Nota mínima é 0',
      'number.max': 'Nota máxima é 10',
      'any.required': 'Nota é obrigatória',
    }),
    comentario: Joi.string().allow('').max(1000),
  }),

  adicionarEpisodio: Joi.object({
    numeroTemporada: Joi.number().required().messages({
      'any.required': 'Número da temporada é obrigatório',
    }),
    episodio: Joi.object({
      numero: Joi.number().required(),
      titulo: Joi.string().required(),
      sinopse: Joi.string().allow(''),
      dataLancamento: Joi.string().allow(''),
    }).required(),
  }),
};

