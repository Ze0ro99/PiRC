require('../createRequestId-DOf8Ktjs.cjs');
require('../getRawRequest-DdfaiPVH.cjs');
require('../bufferUtils-Uc0eRItL.cjs');
require('../hasConfigurableGlobal-CS7adEvV.cjs');
require('../handleRequest-Cz4_wmQ9.cjs');
const require_fetch = require('../fetch-M8iXkZ3L.cjs');
const require_XMLHttpRequest = require('../XMLHttpRequest-B11I9TBx.cjs');

//#region src/presets/browser.ts
/**
* The default preset provisions the interception of requests
* regardless of their type (fetch/XMLHttpRequest).
*/
var browser_default = [new require_fetch.FetchInterceptor(), new require_XMLHttpRequest.XMLHttpRequestInterceptor()];

//#endregion
module.exports = browser_default;
//# sourceMappingURL=browser.cjs.map