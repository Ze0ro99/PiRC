"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var deserialize_build_output_exports = {};
__export(deserialize_build_output_exports, {
  deserializeBuildOutput: () => deserializeBuildOutput,
  validateDeploymentId: () => validateDeploymentId
});
module.exports = __toCommonJS(deserialize_build_output_exports);
var fs = __toESM(require("fs-extra"));
var import_path = require("path");
var import_errors = require("../errors");
var import_file_fs_ref = __toESM(require("../file-fs-ref"));
var import_glob = __toESM(require("../fs/glob"));
var import_prerender = require("../prerender");
var import_create_functions_iterator = require("./create-functions-iterator");
var import_deserialize_edge_function = require("./deserialize-edge-function");
var import_maybe_read_json = require("./maybe-read-json");
var import_validate_framework_version = require("./validate-framework-version");
const MAX_DEPLOYMENT_ID_LENGTH = 32;
const VALID_DEPLOYMENT_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;
function validateDeploymentId(deploymentId) {
  if (deploymentId && deploymentId.length > MAX_DEPLOYMENT_ID_LENGTH) {
    throw new import_errors.NowBuildError({
      message: `The configured deploymentId "${deploymentId}" exceeds the maximum length of ${MAX_DEPLOYMENT_ID_LENGTH} characters. Please use a shorter deploymentId.`,
      code: "VC_BUILD_INVALID_DEPLOYMENT_ID_LENGTH"
    });
  }
  if (deploymentId && !VALID_DEPLOYMENT_ID_PATTERN.test(deploymentId)) {
    throw new import_errors.NowBuildError({
      message: `The configured deploymentId "${deploymentId}" contains invalid characters. Only alphanumeric characters (a-z, A-Z, 0-9), hyphens (-), and underscores (_) are allowed.`,
      code: "VC_BUILD_INVALID_DEPLOYMENT_ID_CHARACTERS"
    });
  }
}
function applyOutputOverrides(output, overrides, warn) {
  for (const [name, override] of Object.entries(overrides || {})) {
    const entry = output[name];
    if (entry) {
      if (override.contentType) {
        entry.contentType = override.contentType;
      }
      if (override.mode) {
        entry.mode = override.mode;
      }
      if (override.path) {
        output[override.path] = entry;
        delete output[name];
      }
    } else {
      warn?.(
        `Warning: Override path "${name}" was not detected as an output path`
      );
    }
  }
}
async function deserializePrerenderFallback(prerenderConfigPath, fallbackConfig) {
  if (typeof fallbackConfig === "string") {
    return import_file_fs_ref.default.fromFsPath({
      fsPath: (0, import_path.join)((0, import_path.dirname)(prerenderConfigPath), fallbackConfig)
    });
  }
  if (fallbackConfig) {
    return import_file_fs_ref.default.fromFsPath({
      mode: fallbackConfig.mode,
      contentType: fallbackConfig.contentType,
      fsPath: (0, import_path.join)((0, import_path.dirname)(prerenderConfigPath), fallbackConfig.fsPath)
    });
  }
  return null;
}
function applyFunctionSymlinks(output, prerenders, functionSymlinks) {
  for (const [path, target] of functionSymlinks.entries()) {
    const targetOutput = prerenders.get(target) || output[target];
    let targetFunction;
    if (targetOutput?.type === "Prerender") {
      targetFunction = targetOutput.lambda;
    } else if (targetOutput?.type === "Lambda" || targetOutput?.type === "EdgeFunction") {
      targetFunction = targetOutput;
    }
    if (!targetFunction) {
      throw new Error(
        `Could not find target "${target}" Lambda or EdgeFunction for path "${path}"`
      );
    }
    const srcOutput = prerenders.get(path);
    if (srcOutput) {
      if (srcOutput.type === "Prerender") {
        if (targetFunction.type === "Lambda") {
          srcOutput.lambda = targetFunction;
        } else {
          throw new Error(
            `Unexpected function type "${targetFunction.type}" at path "${path}"`
          );
        }
      } else {
        throw new Error(
          `Unexpected output type "${srcOutput.type}" at path "${path}"`
        );
      }
    } else {
      output[path] = targetFunction;
    }
  }
}
function appendSortedPrerenders(output, prerenders) {
  const sortedPrerenders = Array.from(prerenders.entries()).sort((a, b) => {
    return (a[1].group ?? 0) - (b[1].group ?? 0);
  }).reduce((o, [path, prerender]) => {
    o[path] = prerender;
    return o;
  }, {});
  Object.assign(output, sortedPrerenders);
}
function getBundleableLambdas(output) {
  const bundleableLambdas = {};
  for (const [outputName, curOutput] of Object.entries(output)) {
    if (curOutput.type === "Lambda" && curOutput.experimentalAllowBundling) {
      bundleableLambdas[outputName] = curOutput;
    } else if (curOutput.type === "Prerender" && curOutput.lambda && curOutput.lambda.experimentalAllowBundling) {
      bundleableLambdas[outputName] = curOutput.lambda;
    }
  }
  return bundleableLambdas;
}
function applyGroupedLambdas(output, groupedLambdas) {
  for (const outputName of Object.keys(groupedLambdas)) {
    const groupedLambda = groupedLambdas[outputName];
    const origOutput = output[outputName];
    if (origOutput.type === "Lambda") {
      output[outputName] = groupedLambda;
    } else if (origOutput.type === "Prerender" && origOutput.lambda) {
      origOutput.lambda = groupedLambda;
    }
  }
}
async function deserializeBuildOutput(options) {
  const {
    outputDir,
    repoRootPath,
    maxBundleSizeMb,
    debugGroupLambdas,
    useOnlyStreamingLambda,
    forceNodejsStreaming,
    deserializeLambda,
    groupLambdas,
    inspectSerializedLambda,
    warn,
    includeDeploymentId,
    getMeta
  } = options;
  let hasServerActions = false;
  const configPath = (0, import_path.join)(outputDir, "config.json");
  const config = await (0, import_maybe_read_json.maybeReadJSON)(configPath);
  if (!config) {
    throw new Error(`Config file was not found at "${configPath}"`);
  }
  if (config.version !== 3) {
    throw new Error(
      `Expected \`version: 3\` in "${configPath}" file (received \`${config.version}\`)`
    );
  }
  validateDeploymentId(config.deploymentId);
  const flags = await (0, import_maybe_read_json.maybeReadJSON)(
    (0, import_path.join)(outputDir, "flags.json")
  );
  const staticDir = (0, import_path.join)(outputDir, "static");
  const output = await (0, import_glob.default)("**", {
    cwd: staticDir,
    follow: true
  });
  applyOutputOverrides(output, config.overrides, warn);
  const fileFsRefsCache = /* @__PURE__ */ new Map();
  const prerenders = /* @__PURE__ */ new Map();
  const functionsDir = (0, import_path.join)(outputDir, "functions");
  const functionSymlinks = /* @__PURE__ */ new Map();
  for await (const path of (0, import_create_functions_iterator.createFunctionsIterator)(functionsDir)) {
    let lambda = void 0;
    const fnDir = (0, import_path.join)(functionsDir, `${path}.func`);
    try {
      const link = await fs.readlink(fnDir);
      const target = (0, import_path.join)((0, import_path.dirname)(path), link).slice(0, -5);
      functionSymlinks.set(path, target);
    } catch (err) {
      if (err.code !== "EINVAL")
        throw err;
      const funcConfigPath = (0, import_path.join)(fnDir, ".vc-config.json");
      const funcConfig = await (0, import_maybe_read_json.maybeReadJSON)(
        funcConfigPath
      );
      if (!funcConfig) {
        throw new Error(`Could not load function config: "${funcConfigPath}"`);
      }
      const files = await (0, import_glob.default)("**", { cwd: fnDir, includeDirectories: true });
      delete files[".vc-config.json"];
      if (funcConfig.type === "EdgeFunction" || funcConfig.runtime === "edge") {
        output[path] = await (0, import_deserialize_edge_function.deserializeEdgeFunction)(
          files,
          funcConfig,
          repoRootPath,
          fileFsRefsCache
        );
        continue;
      }
      lambda = await deserializeLambda(
        files,
        funcConfig,
        repoRootPath,
        fileFsRefsCache,
        { useOnlyStreamingLambda, forceNodejsStreaming }
      );
      if (inspectSerializedLambda) {
        hasServerActions = await inspectSerializedLambda(
          path,
          funcConfig,
          repoRootPath,
          hasServerActions
        );
      }
    }
    const prerenderConfigPath = (0, import_path.join)(
      functionsDir,
      `${path}.prerender-config.json`
    );
    const prerenderConfig = await (0, import_maybe_read_json.maybeReadJSON)(
      prerenderConfigPath
    );
    if (prerenderConfig) {
      const fallback = await deserializePrerenderFallback(
        prerenderConfigPath,
        prerenderConfig.fallback
      );
      const prerender = new import_prerender.Prerender({
        ...prerenderConfig,
        lambda,
        fallback
      });
      prerenders.set(path, prerender);
    } else if (lambda) {
      output[path] = lambda;
    }
  }
  applyFunctionSymlinks(output, prerenders, functionSymlinks);
  appendSortedPrerenders(output, prerenders);
  const groupedLambdas = await groupLambdas(
    getBundleableLambdas(output),
    {
      force: void 0,
      maxBundleSizeMb,
      debug: debugGroupLambdas
    }
  );
  applyGroupedLambdas(output, groupedLambdas);
  const framework = (0, import_validate_framework_version.validateFrameworkVersion)(config?.framework?.version);
  const meta = getMeta?.(hasServerActions);
  return {
    wildcard: config.wildcard,
    images: config.images,
    crons: config.crons,
    flags: flags ? flags : config.flags,
    routes: config.routes,
    output,
    framework,
    ...includeDeploymentId ? { deploymentId: config.deploymentId } : {},
    ...meta !== void 0 ? { meta } : {}
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  deserializeBuildOutput,
  validateDeploymentId
});
