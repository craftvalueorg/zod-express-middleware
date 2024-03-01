import { processRequest, processRequestBody, processRequestParams, processRequestQuery } from './index';
import { z } from 'zod';
import { Request, Response } from 'express';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const nextFunction = vi.fn();

function mockRequest({
  body,
  query,
  params,
}: {
  body?: Record<string, any>;
  query?: Record<string, any>;
  params?: Record<string, any>;
}): Partial<Request> {
  return {
    body,
    query,
    params,
  };
}
const sendMock = vi.fn();
function mockResponse(): Partial<Response> {
  return {
    status: vi.fn(() => ({ send: sendMock }) as any),
  };
}

describe('Request body processor', () => {
  beforeEach(() => {
    sendMock.mockClear();
  });
  const bodySchema = z.object({ RequestBodyKey: z.string() });
  it('Should call next() on succcesful validation', () => {
    processRequestBody(bodySchema)(
      mockRequest({ body: { RequestBodyKey: 'dit is de value' } }) as Request,
      mockResponse() as Response,
      nextFunction,
    );
    expect(nextFunction).toHaveBeenCalled();
  });
  it('Should send a HTTP400 on failed validation', () => {
    const mockedResponse = mockResponse();
    processRequestBody(z.object({ RequestBodyKey: z.string() }))(
      mockRequest({ body: { RequestBodyKey: 12345 } }) as Request,
      mockedResponse as Response,
      nextFunction,
    );
    expect(mockedResponse.status).toHaveBeenCalledWith(400);
  });
  it('Should send a meaningful error on failed validation', () => {
    const mockedResponse = mockResponse();
    processRequestBody(z.object({ RequestBodyKey: z.string() }))(
      mockRequest({ body: { RequestBodyKey: 12345 } }) as Request,
      mockedResponse as Response,
      nextFunction,
    );
    expect(sendMock).toHaveBeenCalledWith([{ type: 'Body', errors: expect.anything() }]);
  });
  it('Should modify the request body', () => {
    const requestBody = {
      RequestBodyKey: "This is the one we're parsing",
      SomeOtherRandomValue: 'This one should not be removed',
    };
    const mockedRequest = mockRequest({
      body: requestBody,
    }) as Request;
    processRequestBody(z.object({ RequestBodyKey: z.string() }))(
      mockedRequest,
      mockResponse() as Response,
      nextFunction,
    );
    expect(mockedRequest.body).toEqual({
      RequestBodyKey: requestBody.RequestBodyKey,
    });
  });
});
describe('Request query processor', () => {
  beforeEach(() => {
    sendMock.mockClear();
  });
  const querySchema = z.object({ RequestQueryKey: z.string() });
  it('Should call next() on succcesful validation', () => {
    processRequestQuery(querySchema)(
      mockRequest({ query: { RequestQueryKey: 'dit is de value' } }) as any,
      mockResponse() as Response,
      nextFunction,
    );
    expect(nextFunction).toHaveBeenCalled();
  });
  it('Should send a HTTP400 on failed validation', () => {
    const mockedResponse = mockResponse();
    processRequestQuery(z.object({ RequestQueryKey: z.string() }))(
      mockRequest({ query: { RequestQueryKey: 12345 } }) as any,
      mockedResponse as Response,
      nextFunction,
    );
    expect(mockedResponse.status).toHaveBeenCalledWith(400);
  });
  it('Should send a meaningful error on failed validation', () => {
    const mockedResponse = mockResponse();
    processRequestQuery(z.object({ RequestQueryKey: z.string() }))(
      mockRequest({ query: { RequestQueryKey: 12345 } }) as any,
      mockedResponse as Response,
      nextFunction,
    );
    expect(sendMock).toHaveBeenCalledWith([{ type: 'Query', errors: expect.anything() }]);
  });
  it('Should modify the request query', () => {
    const requestQuery = {
      RequestQueryKey: "This is the one we're parsing",
      SomeOtherRandomValue: 'This one should not be removed',
    };
    const mockedRequest = mockRequest({
      query: requestQuery,
    }) as any;
    processRequestQuery(z.object({ RequestQueryKey: z.string() }))(
      mockedRequest,
      mockResponse() as Response,
      nextFunction,
    );
    expect(mockedRequest.query).toEqual({
      RequestQueryKey: requestQuery.RequestQueryKey,
    });
  });
});
describe('Request params processor', () => {
  beforeEach(() => {
    sendMock.mockClear();
  });
  const paramsSchema = z.object({ RequestParamsKey: z.string() });
  it('Should call next() on succcesful validation', () => {
    processRequestParams(paramsSchema)(
      mockRequest({ params: { RequestParamsKey: 'dit is de value' } }) as any,
      mockResponse() as Response,
      nextFunction,
    );
    expect(nextFunction).toHaveBeenCalled();
  });
  it('Should send a HTTP400 on failed validation', () => {
    const mockedResponse = mockResponse();
    processRequestParams(z.object({ RequestParamsKey: z.string() }))(
      mockRequest({ params: { RequestParamsKey: 12345 } }) as any,
      mockedResponse as Response,
      nextFunction,
    );
    expect(mockedResponse.status).toHaveBeenCalledWith(400);
  });
  it('Should send a meaningful error on failed validation', () => {
    const mockedResponse = mockResponse();
    processRequestParams(z.object({ RequestParamsKey: z.string() }))(
      mockRequest({ params: { RequestParamsKey: 12345 } }) as any,
      mockedResponse as Response,
      nextFunction,
    );
    expect(sendMock).toHaveBeenCalledWith([{ type: 'Params', errors: expect.anything() }]);
  });
  it('Should modify the request params', () => {
    const requestParams = {
      RequestParamsKey: "This is the one we're parsing",
      SomeOtherRandomValue: 'This one should not be removed',
    };
    const mockedRequest = mockRequest({
      params: requestParams,
    }) as any;
    processRequestParams(z.object({ RequestParamsKey: z.string() }))(
      mockedRequest,
      mockResponse() as Response,
      nextFunction,
    );
    expect(mockedRequest.params).toEqual({
      RequestParamsKey: requestParams.RequestParamsKey,
    });
  });
});
describe('Request processor', () => {
  beforeEach(() => {
    sendMock.mockClear();
  });
  const paramsSchema = z.object({ RequestParamsKey: z.string() });
  const bodySchema = z.object({ RequestBodyKey: z.string() });
  const querySchema = z.object({ RequestQueryKey: z.string() });
  it('Should call next() on succcesful validation', () => {
    processRequest({
      body: bodySchema,
      params: paramsSchema,
      query: querySchema,
    })(
      mockRequest({
        params: { RequestParamsKey: 'dit is de value' },
        body: { RequestBodyKey: 'dit is de value' },
        query: { RequestQueryKey: 'dit is de value' },
      }) as any,
      mockResponse() as Response,
      nextFunction,
    );
    expect(nextFunction).toHaveBeenCalled();
  });
  it('Should send a HTTP400 on failed validation of params', () => {
    const mockedResponse = mockResponse();
    processRequest({
      body: bodySchema,
      params: paramsSchema,
      query: querySchema,
    })(
      mockRequest({
        params: { RequestParamsKey: 1234 },
        body: { RequestBodyKey: 'dit is de value' },
        query: { RequestQueryKey: 'dit is de value' },
      }) as any,
      mockedResponse as Response,
      nextFunction,
    );
    expect(mockedResponse.status).toHaveBeenCalledWith(400);
  });
  it('Should send a HTTP400 on failed validation of body', () => {
    const mockedResponse = mockResponse();
    processRequest({
      body: bodySchema,
      params: paramsSchema,
      query: querySchema,
    })(
      mockRequest({
        params: { RequestParamsKey: 'dit is de value' },
        body: { RequestBodyKey: 1234 },
        query: { RequestQueryKey: 'dit is de value' },
      }) as any,
      mockedResponse as Response,
      nextFunction,
    );
    expect(mockedResponse.status).toHaveBeenCalledWith(400);
  });
  it('Should send a HTTP400 on failed validation of query', () => {
    const mockedResponse = mockResponse();
    processRequest({
      body: bodySchema,
      params: paramsSchema,
      query: querySchema,
    })(
      mockRequest({
        params: { RequestParamsKey: 'dit is de value' },
        body: { RequestBodyKey: 'dit is de value' },
        query: { RequestQueryKey: 1234 },
      }) as any,
      mockedResponse as Response,
      nextFunction,
    );
    expect(mockedResponse.status).toHaveBeenCalledWith(400);
  });
  it('Should send a meaningful error on failed validation of params', () => {
    const mockedResponse = mockResponse();
    processRequest({
      body: bodySchema,
      params: paramsSchema,
      query: querySchema,
    })(
      mockRequest({
        params: { RequestParamsKey: 1234 },
        body: { RequestBodyKey: 'dit is de value' },
        query: { RequestQueryKey: 'dit is de value' },
      }) as any,
      mockedResponse as Response,
      nextFunction,
    );
    expect(sendMock).toHaveBeenCalledWith([{ type: 'Params', errors: expect.anything() }]);
  });
  it('Should send a meaningful error on failed validation of body', () => {
    const mockedResponse = mockResponse();
    processRequest({
      body: bodySchema,
      params: paramsSchema,
      query: querySchema,
    })(
      mockRequest({
        params: { RequestParamsKey: 'dit is de value' },
        body: { RequestBodyKey: 1234 },
        query: { RequestQueryKey: 'dit is de value' },
      }) as any,
      mockedResponse as Response,
      nextFunction,
    );
    expect(sendMock).toHaveBeenCalledWith([{ type: 'Body', errors: expect.anything() }]);
  });
  it('Should send a meaningful error on failed validation of query', () => {
    const mockedResponse = mockResponse();
    processRequest({
      body: bodySchema,
      params: paramsSchema,
      query: querySchema,
    })(
      mockRequest({
        params: { RequestParamsKey: 'dit is de value' },
        body: { RequestBodyKey: 'dit is de value' },
        query: { RequestQueryKey: 1234 },
      }) as any,
      mockedResponse as Response,
      nextFunction,
    );
    expect(sendMock).toHaveBeenCalledWith([{ type: 'Query', errors: expect.anything() }]);
  });
  it('Should modify the request params', () => {
    const requestParams = {
      RequestParamsKey: "This is the one we're parsing",
      SomeOtherRandomValue: 'This one should not be removed',
    };
    const mockedRequest = mockRequest({
      params: requestParams,
    }) as any;
    processRequest({ params: z.object({ RequestParamsKey: z.string() }) })(
      mockedRequest,
      mockResponse() as Response,
      nextFunction,
    );
    expect(mockedRequest.params).toEqual({
      RequestParamsKey: requestParams.RequestParamsKey,
    });
  });
  it('Should modify the request query', () => {
    const requestQuery = {
      RequestQueryKey: "This is the one we're parsing",
      SomeOtherRandomValue: 'This one should not be removed',
    };
    const mockedRequest = mockRequest({
      query: requestQuery,
    }) as any;
    processRequest({ query: z.object({ RequestQueryKey: z.string() }) })(
      mockedRequest,
      mockResponse() as Response,
      nextFunction,
    );
    expect(mockedRequest.query).toEqual({
      RequestQueryKey: requestQuery.RequestQueryKey,
    });
  });

  it('Should modify the request body', () => {
    const requestBody = {
      RequestBodyKey: "This is the one we're parsing",
      SomeOtherRandomValue: 'This one should not be removed',
    };
    const mockedRequest = mockRequest({
      body: requestBody,
    }) as Request;
    processRequest({ body: z.object({ RequestBodyKey: z.string() }) })(
      mockedRequest,
      mockResponse() as Response,
      nextFunction,
    );
    expect(mockedRequest.body).toEqual({
      RequestBodyKey: requestBody.RequestBodyKey,
    });
  });

  it('Should modify the request', () => {
    const requestBody = {
      RequestBodyKey: "This is the one we're parsing",
      SomeOtherRandomValue: 'This one should not be removed',
    };
    const requestQuery = {
      RequestQueryKey: "This is the one we're parsing",
      SomeOtherRandomValue: 'This one should not be removed',
    };
    const requestParams = {
      RequestParamsKey: "This is the one we're parsing",
      SomeOtherRandomValue: 'This one should not be removed',
    };
    const mockedRequest = mockRequest({
      params: requestParams,
      body: requestBody,
      query: requestQuery,
    }) as any;
    processRequest({
      body: z.object({ RequestBodyKey: z.string() }),
      query: z.object({ RequestQueryKey: z.string() }),
    })(mockedRequest, mockResponse() as Response, nextFunction);
    expect(mockedRequest.body).toEqual({
      RequestBodyKey: requestBody.RequestBodyKey,
    });
    expect(mockedRequest.query).toEqual({
      RequestQueryKey: requestQuery.RequestQueryKey,
    });
    expect(mockedRequest.params).toEqual({
      RequestParamsKey: requestParams.RequestParamsKey,
      SomeOtherRandomValue: requestParams.SomeOtherRandomValue,
    });
  });
});
