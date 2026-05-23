import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

/**
 * Wraps a Joi schema into an Express middleware that validates req.body or req.query.
 * On validation errors responds with 400 and details; otherwise passes control downstream.
 *
 * Usage: router.post('/path', validate(bodySchema), handler)
 */
export function validate(schema: Joi.ObjectSchema | Joi.Schema, property: 'body' | 'query' = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[property], { abortEarly: false, allowUnknown: true });
    if (error) {
      const err = new Error('Validation error');
      (err as any).status = 400;
      (err as any).details = error.details.map((d) => d.message);
      return next(err);
    }
    // Replace request body/query with the validated, coerced value.
    req[property] = value;
    next();
  };
}