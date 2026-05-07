import "../createRequestId-DYCsFHOi.mjs";
import "../getRawRequest-B1BqgWG6.mjs";
import "../bufferUtils-BiiO6HZv.mjs";
import "../hasConfigurableGlobal-C8zq1MCg.mjs";
import "../handleRequest-1Yqu_ho_.mjs";
import { t as FetchInterceptor } from "../fetch-BJwfdses.mjs";
import { t as XMLHttpRequestInterceptor } from "../XMLHttpRequest-DHEkSoRN.mjs";

//#region src/presets/browser.ts
/**
* The default preset provisions the interception of requests
* regardless of their type (fetch/XMLHttpRequest).
*/
var browser_default = [new FetchInterceptor(), new XMLHttpRequestInterceptor()];

//#endregion
export { browser_default as default };
//# sourceMappingURL=browser.mjs.map