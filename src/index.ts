import { Request, RequestHandler, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { z, ZodEffects, ZodError, ZodSchema, ZodType, ZodTypeDef } from 'zod';

type NonReadOnly<T> = { -readonly [P in keyof T]: NonReadOnly<T[P]> };

export function stripReadOnly<T>(readOnlyItem: T): NonReadOnly<T> {
  return readOnlyItem as NonReadOnly<T>;
}

export declare type RequestValidation<TParams, TQuery, TBody> = {
  params?: ZodSchema<TParams>;
  query?: ZodSchema<TQuery>;
  body?: ZodSchema<TBody>;
};
export declare type RequestProcessing<TParams, TQuery, TBody> = {
  params?: ZodEffects<any, TParams>;
  query?: ZodEffects<any, TQuery>;
  body?: ZodEffects<any, TBody>;
};

export declare type TypedRequest<
  TParams extends ZodType<any, ZodTypeDef, any>,
  TQuery extends ZodType<any, ZodTypeDef, any>,
  TBody extends ZodType<any, ZodTypeDef, any>,
> = Request<z.infer<TParams>, any, z.infer<TBody>, z.infer<TQuery>>;

export declare type TypedRequestBody<TBody extends ZodType<any, ZodTypeDef, any>> = Request<
  ParamsDictionary,
  any,
  z.infer<TBody>,
  any
>;

export declare type TypedRequestParams<TParams extends ZodType<any, ZodTypeDef, any>> = Request<
  z.infer<TParams>,
  any,
  any,
  any
>;
export declare type TypedRequestQuery<TQuery extends ZodType<any, ZodTypeDef, any>> = Request<
  ParamsDictionary,
  any,
  any,
  z.infer<TQuery>
>;

type ErrorListItem = {
  type: 'Query' | 'Params' | 'Body';
  errors: ZodError<any>;
};

export const sendErrors: (errors: Array<ErrorListItem>, res: Response) => void = (errors, res) => {
  return res.status(400).send(errors.map((error) => ({ type: error.type, errors: error.errors })));
};
export const sendError: (error: ErrorListItem, res: Response) => void = (error, res) => {
  return res.status(400).send({ type: error.type, errors: error.errors });
};

export function processRequestBody<Schema extends z.ZodSchema<unknown>>(
  schema: Schema,
): RequestHandler<ParamsDictionary, any, z.output<Schema>, any> {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.body);
    if (parsed.success) {
      req.body = parsed.data;
      return next();
    } else {
      return sendErrors([{ type: 'Body', errors: parsed.error }], res);
    }
  };
}

export function processRequestParams<Schema extends z.ZodSchema<unknown>>(
  schema: Schema,
): RequestHandler<z.output<Schema>, any, any, any> {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.params);
    if (parsed.success) {
      req.params = parsed.data;
      return next();
    } else {
      return sendErrors([{ type: 'Params', errors: parsed.error }], res);
    }
  };
}

export function processRequestQuery<Schema extends z.ZodSchema<unknown>>(
  schema: Schema,
): RequestHandler<ParamsDictionary, any, any, z.output<Schema>> {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.query);
    if (parsed.success) {
      req.query = parsed.data;
      return next();
    } else {
      return sendErrors([{ type: 'Query', errors: parsed.error }], res);
    }
  };
}

export function processRequest<
  Body extends z.ZodSchema<unknown>,
  Params extends z.ZodSchema<unknown>,
  Query extends z.ZodSchema<unknown>,
>(schemas: {
  body?: Body;
  params?: Params;
  query?: Query;
}): RequestHandler<z.output<Params>, any, z.output<Body>, z.output<Query>> {
  return (req, res, next) => {
    const errors: Array<ErrorListItem> = [];
    if (schemas.params) {
      const parsed = schemas.params.safeParse(req.params);
      if (parsed.success) {
        req.params = parsed.data;
      } else {
        errors.push({ type: 'Params', errors: parsed.error });
      }
    }
    if (schemas.query) {
      const parsed = schemas.query.safeParse(req.query);
      if (parsed.success) {
        req.query = parsed.data;
      } else {
        errors.push({ type: 'Query', errors: parsed.error });
      }
    }
    if (schemas.body) {
      const parsed = schemas.body.safeParse(req.body);
      if (parsed.success) {
        req.body = parsed.data;
      } else {
        errors.push({ type: 'Body', errors: parsed.error });
      }
    }
    if (errors.length > 0) {
      return sendErrors(errors, res);
    }
    return next();
  };
}
