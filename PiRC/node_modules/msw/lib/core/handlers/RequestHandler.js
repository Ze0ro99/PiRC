"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var RequestHandler_exports = {};
__export(RequestHandler_exports, {
  RequestHandler: () => RequestHandler,
  forwardResponseCookies: () => forwardResponseCookies
});
module.exports = __toCommonJS(RequestHandler_exports);
var import_headers_polyfill = require("headers-polyfill");
var import_getCallFrame = require("../utils/internal/getCallFrame");
var import_isIterable = require("../utils/internal/isIterable");
var import_HttpResponse = require("../HttpResponse");
var import_devUtils = require("../utils/internal/devUtils");
var import_decorators = require("../utils/HttpResponse/decorators");
class RequestHandler {
  static cache = /* @__PURE__ */ new WeakMap();
  kind = "request";
  resolver;
  resolverIterator;
  resolverIteratorResult;
  resolverIteratorCleanups;
  options;
  scheduledCleanups;
  info;
  /**
   * Indicates whether this request handler has been used
   * (its resolver has successfully executed).
   */
  isUsed;
  constructor(args) {
    this.resolver = args.resolver;
    this.options = args.options;
    this.scheduledCleanups = /* @__PURE__ */ new Map();
    const callFrame = (0, import_getCallFrame.getCallFrame)(new Error());
    this.info = {
      ...args.info,
      callFrame
    };
    this.isUsed = false;
  }
  /**
   * Reset the runtime state accumulated during response resolution,
   * such as generator iterator progress. Called when this handler is
   * removed from the active handlers list so re-adding it later starts
   * from a clean state.
   */
  reset() {
    this.scheduledCleanups.clear();
    const iterator = this.resolverIterator;
    this.resolverIterator = void 0;
    this.resolverIteratorResult = void 0;
    this.resolverIteratorCleanups = void 0;
    if (typeof iterator?.return === "function") {
      void Promise.resolve(iterator.return());
    }
  }
  /**
   * Restore this handler so it can match requests again after being
   * exhausted (e.g. via `{ once: true }`). Also clears any accumulated
   * resolution state.
   */
  restore() {
    if (this.options?.once) {
      this.reset();
      this.isUsed = false;
    }
  }
  /**
   * Parse the intercepted request to extract additional information from it.
   * Parsed result is then exposed to other methods of this request handler.
   */
  async parse(_args) {
    return {};
  }
  /**
   * Test if this handler matches the given request.
   *
   * This method is not used internally but is exposed
   * as a convenience method for consumers writing custom
   * handlers.
   */
  async test(args) {
    const parsedResult = await this.parse({
      request: args.request,
      resolutionContext: args.resolutionContext
    });
    return this.predicate({
      request: args.request,
      parsedResult,
      resolutionContext: args.resolutionContext
    });
  }
  extendResolverArgs(_args) {
    return {};
  }
  // Clone the request instance before it's passed to the handler phases
  // and the response resolver so we can always read it for logging.
  // We only clone it once per request to avoid unnecessary overhead.
  cloneRequestOrGetFromCache(request) {
    const existingClone = RequestHandler.cache.get(request);
    if (typeof existingClone !== "undefined") {
      return existingClone;
    }
    const clonedRequest = request.clone();
    RequestHandler.cache.set(request, clonedRequest);
    return clonedRequest;
  }
  /**
   * Execute this request handler and produce a mocked response
   * using the given resolver function.
   */
  async run(args) {
    if (this.isUsed && this.options?.once) {
      return null;
    }
    const requestClone = this.cloneRequestOrGetFromCache(args.request);
    const parsedResult = await this.parse({
      request: args.request,
      resolutionContext: args.resolutionContext
    });
    const shouldInterceptRequest = await this.predicate({
      request: args.request,
      parsedResult,
      resolutionContext: args.resolutionContext
    });
    if (!shouldInterceptRequest) {
      return null;
    }
    if (this.isUsed && this.options?.once) {
      return null;
    }
    this.isUsed = true;
    const executeResolver = this.wrapResolver(this.resolver);
    const resolverExtras = this.extendResolverArgs({
      request: args.request,
      parsedResult
    });
    const listenerController = new AbortController();
    args.request.signal.addEventListener(
      "abort",
      () => this.runScheduledCleanups(args.requestId),
      {
        once: true,
        signal: listenerController.signal
      }
    );
    const mockedResponsePromise = executeResolver({
      ...resolverExtras,
      finalize: (callback) => {
        this.scheduleCleanup(args.requestId, callback);
      },
      requestId: args.requestId,
      request: args.request
    }).catch((errorOrResponse) => {
      if (errorOrResponse instanceof Response) {
        return errorOrResponse;
      }
      throw errorOrResponse;
    }).finally(() => {
      listenerController.abort();
    });
    const mockedResponse = await mockedResponsePromise;
    if (mockedResponse) {
      forwardResponseCookies(mockedResponse);
    }
    const executionResult = this.createExecutionResult({
      // Pass the cloned request to the result so that logging
      // and other consumers could read its body once more.
      request: requestClone,
      requestId: args.requestId,
      response: mockedResponse,
      parsedResult
    });
    return executionResult;
  }
  wrapResolver(resolver) {
    return async (info) => {
      if (!this.resolverIterator) {
        let result;
        try {
          result = await resolver(info);
        } catch (error) {
          await this.runScheduledCleanups(info.requestId);
          throw error;
        }
        if (!(0, import_isIterable.isIterable)(result)) {
          await this.runScheduledCleanups(info.requestId);
          return result;
        }
        const existingCleanups = this.scheduledCleanups.get(info.requestId);
        if (existingCleanups != null && existingCleanups.length > 0) {
          this.resolverIteratorCleanups = existingCleanups;
          this.scheduledCleanups.delete(info.requestId);
        }
        this.resolverIterator = Symbol.iterator in result ? result[Symbol.iterator]() : result[Symbol.asyncIterator]();
      }
      this.isUsed = false;
      const { done, value } = await this.resolverIterator.next();
      const nextResponse = await value;
      if (nextResponse) {
        this.resolverIteratorResult = nextResponse.clone();
      }
      if (done) {
        this.isUsed = true;
        await this.runScheduledCleanups(info.requestId);
        return this.resolverIteratorResult?.clone();
      }
      return nextResponse;
    };
  }
  createExecutionResult(args) {
    return {
      handler: this,
      request: args.request,
      requestId: args.requestId,
      response: args.response,
      parsedResult: args.parsedResult
    };
  }
  scheduleCleanup(requestId, callback) {
    if (this.resolverIterator) {
      ;
      (this.resolverIteratorCleanups ||= []).unshift(callback);
      return;
    }
    const cleanups = this.scheduledCleanups.get(requestId) || [];
    cleanups.unshift(callback);
    this.scheduledCleanups.set(requestId, cleanups);
  }
  async exhaustCleanups(cleanups) {
    const errors = [];
    for (const cleanup of cleanups) {
      try {
        await cleanup();
      } catch (error) {
        if (error instanceof Error) {
          errors.push(error);
        }
      }
    }
    if (errors.length > 0) {
      import_devUtils.devUtils.error(
        'Failed to execute cleanup for request handler "%s"',
        this.info.header,
        new AggregateError(
          errors,
          `Failed to execute cleanup for request handler "${this.info.header}"`
        )
      );
    }
  }
  async runScheduledCleanups(requestId) {
    if (this.resolverIterator && this.resolverIteratorCleanups != null && this.resolverIteratorCleanups.length > 0) {
      try {
        await this.exhaustCleanups(this.resolverIteratorCleanups);
      } finally {
        this.resolverIteratorCleanups = void 0;
      }
      return;
    }
    const cleanups = this.scheduledCleanups.get(requestId);
    if (!cleanups || cleanups.length == 0) {
      return;
    }
    await this.exhaustCleanups(cleanups);
    this.scheduledCleanups.delete(requestId);
  }
}
function forwardResponseCookies(response) {
  if (typeof document === "undefined") {
    return;
  }
  const responseCookies = (0, import_decorators.getRawSetCookie)(response);
  if (!responseCookies) {
    return;
  }
  const allResponseCookies = import_headers_polyfill.Headers.prototype.getSetCookie.call(
    new Headers([["set-cookie", responseCookies]])
  );
  for (const cookieString of allResponseCookies) {
    document.cookie = cookieString;
  }
}
//# sourceMappingURL=RequestHandler.js.map