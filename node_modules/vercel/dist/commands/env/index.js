import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirname_ } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirname_(__filename);
import {
  getCustomEnvironments,
  getInvalidSubcommand,
  readStandardInput,
  require_dist as require_dist3
} from "../../chunks/chunk-C5YP6KFI.js";
import {
  formatTable
} from "../../chunks/chunk-G6RXZLQ2.js";
import {
  suggestNextCommands
} from "../../chunks/chunk-LOS7HHU3.js";
import {
  formatEnvironment,
  validateLsArgs
} from "../../chunks/chunk-QQWE4QMB.js";
import {
  validateJsonOutput
} from "../../chunks/chunk-XPKWKPWA.js";
import {
  getSubcommand
} from "../../chunks/chunk-YPQSDAEW.js";
import {
  getCommandAliases
} from "../../chunks/chunk-2OPPBD5D.js";
import "../../chunks/chunk-CRZM5WM2.js";
import "../../chunks/chunk-BHDZCUTT.js";
import "../../chunks/chunk-BJQTGP42.js";
import "../../chunks/chunk-UWKTUK3W.js";
import "../../chunks/chunk-TAOVG4PS.js";
import "../../chunks/chunk-DVQ4SIWF.js";
import "../../chunks/chunk-VGWGLBUC.js";
import {
  require_execa
} from "../../chunks/chunk-EG4NYQUS.js";
import {
  autoInstallVercelPlugin
} from "../../chunks/chunk-K7R6WOLC.js";
import "../../chunks/chunk-E3NE4SKN.js";
import {
  help
} from "../../chunks/chunk-LDXYSGPZ.js";
import "../../chunks/chunk-GE6G37P4.js";
import {
  STANDARD_ENVIRONMENTS,
  addSubcommand,
  envCommand,
  envTargetChoices,
  formatProject,
  getEnvRecords,
  getEnvTargetPlaceholder,
  getLinkedProject,
  getTeamById,
  listSubcommand,
  param,
  parseTarget,
  pull,
  pullEnvRecords,
  pullSubcommand,
  removeSubcommand,
  require_frameworks,
  runSubcommand,
  updateSubcommand
} from "../../chunks/chunk-VPI2ZRPP.js";
import {
  TelemetryClient,
  require_dist as require_dist2
} from "../../chunks/chunk-U3WLEFHU.js";
import {
  buildCommandWithYes,
  buildEnvAddCommandWithPreservedArgs,
  buildEnvRmCommandWithPreservedArgs,
  buildEnvUpdateCommandWithPreservedArgs,
  getPreservedArgsForEnvAdd,
  getPreservedArgsForEnvRm,
  getPreservedArgsForEnvUpdate,
  outputActionRequired,
  outputAgentError
} from "../../chunks/chunk-XKHLPA6V.js";
import {
  require_ms,
  stamp_default
} from "../../chunks/chunk-CO5D46AG.js";
import {
  getFlagsSpecification,
  parseArguments,
  printError
} from "../../chunks/chunk-RFMC2QXQ.js";
import {
  getCommandName,
  getCommandNamePlain,
  isAPIError,
  require_lib
} from "../../chunks/chunk-ECRBC4HL.js";
import {
  emoji,
  output_manager_default,
  prependEmoji,
  require_dist
} from "../../chunks/chunk-ZQKJVHXY.js";
import {
  require_source
} from "../../chunks/chunk-S7KYDPEM.js";
import {
  __toESM
} from "../../chunks/chunk-TZ2YI2VH.js";

// src/commands/env/add.ts
var import_chalk = __toESM(require_source(), 1);

// src/util/env/add-env-record.ts
var import_constants = __toESM(require_dist2(), 1);
async function addEnvRecord(client, projectId, upsert, type, key, value, targets, gitBranch) {
  const actionWord = upsert ? "Overriding" : "Adding";
  output_manager_default.debug(
    `${actionWord} ${type} Environment Variable ${key} to ${targets.length} targets`
  );
  const target = [];
  const customEnvironmentIds = [];
  for (const t of targets) {
    const arr = import_constants.PROJECT_ENV_TARGET.includes(t) ? target : customEnvironmentIds;
    arr.push(t);
  }
  const body = {
    type,
    key,
    value,
    target,
    customEnvironmentIds: customEnvironmentIds.length > 0 ? customEnvironmentIds : void 0,
    gitBranch: gitBranch || void 0
  };
  const args = upsert ? `?upsert=${upsert}` : "";
  const url = `/v10/projects/${projectId}/env${args}`;
  await client.fetch(url, {
    method: "POST",
    body
  });
}

// src/util/env/known-error.ts
var import_error_utils = __toESM(require_dist(), 1);
var knownErrorsCodes = /* @__PURE__ */ new Set([
  "BAD_REQUEST",
  "ENV_ALREADY_EXISTS",
  "ENV_CONFLICT",
  "EXISTING_KEY_AND_TARGET",
  "FORBIDDEN",
  "ID_NOT_FOUND",
  "INVALID_KEY",
  "INVALID_VALUE",
  "KEY_INVALID_CHARACTERS",
  "KEY_INVALID_LENGTH",
  "KEY_RESERVED",
  "RESERVED_ENV_VARIABLE",
  "MAX_ENVS_EXCEEDED",
  "MISSING_ID",
  "MISSING_KEY",
  "MISSING_TARGET",
  "MISSING_VALUE",
  "NOT_AUTHORIZED",
  "NOT_DECRYPTABLE",
  "SYSTEM_ENV_WITH_VALUE",
  "TEAM_NOT_FOUND",
  "TOO_MANY_IDS",
  "TOO_MANY_KEYS",
  "UNKNOWN_ERROR",
  "VALUE_INVALID_LENGTH",
  "VALUE_INVALID_TYPE"
]);
function isKnownError(error) {
  const code = (0, import_error_utils.isErrnoException)(error) ? error.code : null;
  if (!code)
    return false;
  return knownErrorsCodes.has(code.toUpperCase());
}

// src/util/env/validate-env.ts
var import_frameworks = __toESM(require_frameworks(), 1);
function getEnvValueWarnings(value) {
  const warnings = [];
  const normalized = value.replace(/\n$/, "");
  if (/^[ \t]+/.test(normalized)) {
    warnings.push({
      message: "starts with whitespace",
      requiresConfirmation: false
    });
  }
  if (/[ \t]+$/.test(normalized)) {
    warnings.push({
      message: "ends with whitespace",
      requiresConfirmation: false
    });
  }
  if (normalized.includes("\r") || normalized.includes("\n")) {
    warnings.push({
      message: "contains newlines",
      requiresConfirmation: false
    });
  }
  if (value.includes("\0")) {
    warnings.push({
      message: "contains null characters",
      requiresConfirmation: false
    });
  }
  if (value === "") {
    warnings.push({
      message: "is empty",
      requiresConfirmation: true
    });
  }
  if (value.length > 2 && (value.startsWith('"') && value.endsWith('"') || value.startsWith("'") && value.endsWith("'"))) {
    warnings.push({
      message: "includes surrounding quotes (these will be stored literally)",
      requiresConfirmation: false
    });
  }
  return warnings;
}
function formatWarnings(warnings) {
  if (warnings.length === 0)
    return null;
  const messages = warnings.map((w) => w.message);
  const startsIdx = messages.indexOf("starts with whitespace");
  const endsIdx = messages.indexOf("ends with whitespace");
  if (startsIdx !== -1 && endsIdx !== -1) {
    messages.splice(Math.max(startsIdx, endsIdx), 1);
    messages[Math.min(startsIdx, endsIdx)] = "starts and ends with whitespace";
  }
  if (messages.length === 1) {
    return `Value ${messages[0]}`;
  }
  if (messages.length === 2) {
    return `Value ${messages[0]} and ${messages[1]}`;
  }
  const last = messages.pop();
  return `Value ${messages.join(", ")}, and ${last}`;
}
var PUBLIC_PREFIXES = [
  ...new Set(
    import_frameworks.frameworkList.map((f) => f.envPrefix).filter((p) => !!p)
  )
];
var SENSITIVE_PATTERN = /(?:^|_)(password|secret|private|token|key|auth|jwt|signature)(?:_|$)/i;
function hasOnlyWhitespaceWarnings(warnings) {
  return warnings.length > 0 && warnings.every(
    (w) => w.message === "starts with whitespace" || w.message === "ends with whitespace"
  );
}
function trimValue(value) {
  return value.replace(/\n$/, "").trim();
}
function normalizeStdinEnvValue(value) {
  let valueWithoutTrailingNewline = value;
  if (value.endsWith("\r\n")) {
    valueWithoutTrailingNewline = value.slice(0, -2);
  } else if (value.endsWith("\n")) {
    valueWithoutTrailingNewline = value.slice(0, -1);
  } else {
    return {
      value,
      strippedTrailingNewline: false
    };
  }
  if (valueWithoutTrailingNewline.includes("\n") || valueWithoutTrailingNewline.includes("\r")) {
    return {
      value,
      strippedTrailingNewline: false
    };
  }
  return {
    value: valueWithoutTrailingNewline,
    strippedTrailingNewline: true
  };
}
function getPublicPrefix(key) {
  const upperKey = key.toUpperCase();
  return PUBLIC_PREFIXES.find((p) => upperKey.startsWith(p)) || null;
}
function removePublicPrefix(key) {
  const prefix = getPublicPrefix(key);
  if (!prefix)
    return key;
  return key.slice(prefix.length);
}
async function validateEnvValue(opts) {
  let finalValue = opts.initialValue;
  let alreadyConfirmed = false;
  if (!opts.skipConfirm) {
    let valueAccepted = false;
    while (!valueAccepted) {
      const valueWarnings = getEnvValueWarnings(finalValue);
      const warningMessage = formatWarnings(valueWarnings);
      if (!warningMessage) {
        valueAccepted = true;
        break;
      }
      opts.showWarning(warningMessage);
      const canTrim = hasOnlyWhitespaceWarnings(valueWarnings);
      const choices = canTrim ? [
        { name: "Leave as is", value: "c" },
        { name: "Re-enter", value: "r" },
        { name: "Trim whitespace", value: "t" }
      ] : [
        { name: "Leave as is", value: "c" },
        { name: "Re-enter", value: "r" }
      ];
      const action = await opts.selectAction(choices);
      if (action === "c") {
        valueAccepted = true;
        if (valueWarnings.some((w) => w.requiresConfirmation)) {
          alreadyConfirmed = true;
        }
      } else if (action === "t") {
        finalValue = trimValue(finalValue);
        opts.showLog("Trimmed whitespace");
      } else {
        finalValue = await opts.promptForValue();
      }
    }
  } else {
    const valueWarnings = getEnvValueWarnings(finalValue);
    const warningMessage = formatWarnings(valueWarnings);
    if (warningMessage) {
      opts.showWarning(warningMessage);
    }
  }
  return { finalValue, alreadyConfirmed };
}
function getEnvKeyWarnings(key) {
  const warnings = [];
  const matchingPrefix = getPublicPrefix(key);
  if (matchingPrefix) {
    const sensitiveMatch = SENSITIVE_PATTERN.exec(key);
    const nameWithoutPrefix = key.slice(matchingPrefix.length);
    if (sensitiveMatch) {
      warnings.push({
        message: `The ${matchingPrefix} prefix will make ${nameWithoutPrefix} visible to anyone visiting your site`,
        requiresConfirmation: true
      });
    } else {
      warnings.push({
        message: `${matchingPrefix} variables can be seen by anyone visiting your site`,
        requiresConfirmation: false
      });
    }
  }
  return warnings;
}

// src/util/telemetry/commands/env/add.ts
var EnvAddTelemetryClient = class extends TelemetryClient {
  trackCliArgumentName(name) {
    if (name) {
      this.trackCliArgument({
        arg: "name",
        value: this.redactedValue
      });
    }
  }
  trackCliArgumentEnvironment(environment) {
    if (environment) {
      this.trackCliArgument({
        arg: "environment",
        value: STANDARD_ENVIRONMENTS.includes(
          environment
        ) ? environment : this.redactedValue
      });
    }
  }
  trackCliArgumentGitBranch(gitBranch) {
    if (gitBranch) {
      this.trackCliArgument({
        arg: "git-branch",
        value: this.redactedValue
      });
    }
  }
  trackCliOptionValue(value) {
    if (value) {
      this.trackCliOption({
        option: "value",
        value: this.redactedValue
      });
    }
  }
  trackCliFlagSensitive(sensitive) {
    if (sensitive) {
      this.trackCliFlag("sensitive");
    }
  }
  trackCliFlagNoSensitive(noSensitive) {
    if (noSensitive) {
      this.trackCliFlag("no-sensitive");
    }
  }
  trackCliFlagForce(force) {
    if (force) {
      this.trackCliFlag("force");
    }
  }
  trackCliFlagGuidance(guidance) {
    if (guidance) {
      this.trackCliFlag("guidance");
    }
  }
  trackCliFlagYes(yes) {
    if (yes) {
      this.trackCliFlag("yes");
    }
  }
};

// src/commands/env/add.ts
import { determineAgent } from "@vercel/detect-agent";
function resolveTypeForTarget(target, opts) {
  if (target === "development") {
    return "encrypted";
  }
  if (opts.forceEncrypted)
    return "encrypted";
  if (opts.forceSensitive)
    return "sensitive";
  if (opts.policyOn)
    return "sensitive";
  return "sensitive";
}
function valueForNextCommand(value) {
  if (!/[\s'"\\]/.test(value))
    return value;
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}
function fillEnvAddTemplate(template, opts) {
  const targetPlaceholder = getEnvTargetPlaceholder();
  let out = template.replace(/<name>/g, opts.envName ?? "<name>").split(targetPlaceholder).join(opts.envTargetArg ?? targetPlaceholder).replace(/<gitbranch>/g, opts.envGitBranch ?? "<gitbranch>");
  if (opts.valueFromFlag !== void 0) {
    out = out.replace(/<value>/g, valueForNextCommand(opts.valueFromFlag));
  } else {
    out = out.replace(/<value>/g, "<value>");
  }
  return out;
}
async function add(client, argv) {
  let parsedArgs;
  const flagsSpecification = getFlagsSpecification(addSubcommand.options);
  try {
    parsedArgs = parseArguments(argv, flagsSpecification);
  } catch (err) {
    if (client.nonInteractive) {
      outputAgentError(
        client,
        {
          status: "error",
          reason: "invalid_arguments",
          message: err instanceof Error ? err.message : String(err)
        },
        1
      );
    }
    printError(err);
    return 1;
  }
  const { args, flags: opts } = parsedArgs;
  const stdInput = await readStandardInput(client.stdin);
  const valueFromFlag = typeof opts["--value"] === "string" ? opts["--value"] : void 0;
  let [envName, envTargetArg, envGitBranch] = args;
  const telemetryClient = new EnvAddTelemetryClient({
    opts: {
      store: client.telemetryEventStore
    }
  });
  telemetryClient.trackCliArgumentName(envName);
  telemetryClient.trackCliArgumentEnvironment(envTargetArg);
  telemetryClient.trackCliArgumentGitBranch(envGitBranch);
  telemetryClient.trackCliOptionValue(opts["--value"]);
  telemetryClient.trackCliFlagSensitive(opts["--sensitive"]);
  telemetryClient.trackCliFlagNoSensitive(opts["--no-sensitive"]);
  telemetryClient.trackCliFlagForce(opts["--force"]);
  telemetryClient.trackCliFlagGuidance(opts["--guidance"]);
  telemetryClient.trackCliFlagYes(opts["--yes"]);
  if (args.length > 3) {
    output_manager_default.error(
      `Invalid number of arguments. Usage: ${getCommandName(
        `env add <name> ${getEnvTargetPlaceholder()} <gitbranch>`
      )}`
    );
    return 1;
  }
  if (stdInput && (!envName || !envTargetArg)) {
    output_manager_default.error(
      `Invalid number of arguments. Usage: ${getCommandName(
        `env add <name> <target> <gitbranch> < <file>`
      )}`
    );
    return 1;
  }
  let envTargets = [];
  if (envTargetArg) {
    envTargets.push(envTargetArg);
  }
  if (client.nonInteractive) {
    const link2 = await getLinkedProject(client);
    if (link2.status === "error") {
      return link2.exitCode;
    }
    if (link2.status === "not_linked") {
      const preserved = getPreservedArgsForEnvAdd(client.argv);
      const linkPreserved = preserved.filter((a, i) => {
        if (a === "--value")
          return false;
        if (a.startsWith("--value="))
          return false;
        if (i > 0 && preserved[i - 1] === "--value")
          return false;
        return true;
      });
      const linkArgv = [
        ...client.argv.slice(0, 2),
        "link",
        "--scope",
        "<scope>",
        ...linkPreserved
      ];
      let envAddRetryArgv = client.argv;
      if (envTargetArg === "preview" && envGitBranch === void 0) {
        const argvArgs = client.argv.slice(2);
        const addIdx = argvArgs.indexOf("add");
        if (addIdx !== -1) {
          let pos = addIdx + 1;
          let positionals = 0;
          while (pos < argvArgs.length && positionals < 3 && !argvArgs[pos].startsWith("-")) {
            positionals++;
            pos++;
          }
          const insertAt = 2 + pos;
          envAddRetryArgv = [
            ...client.argv.slice(0, insertAt),
            "<gitbranch>",
            ...client.argv.slice(insertAt)
          ];
        }
      }
      outputAgentError(
        client,
        {
          status: "error",
          reason: "not_linked",
          message: `Your codebase isn't linked to a project on Vercel. Run ${getCommandNamePlain(
            "link"
          )} to begin. Use --yes for non-interactive; use --scope or --project to specify team or project. Then run your env add command.`,
          next: [
            { command: buildCommandWithYes(linkArgv) },
            { command: buildCommandWithYes(envAddRetryArgv) }
          ]
        },
        1
      );
    }
    if (link2.status !== "linked")
      return 1;
    const { project: project2 } = link2;
    const org = link2.org;
    client.config.currentTeam = org.type === "team" ? org.id : void 0;
    const [{ envs: envs2 }, customEnvironments2] = await Promise.all([
      getEnvRecords(client, project2.id, "vercel-cli:env:add"),
      getCustomEnvironments(client, project2.id)
    ]);
    const matchingEnvs2 = envs2.filter((r) => r.key === envName);
    const existingTargets2 = /* @__PURE__ */ new Set();
    const existingCustomEnvs2 = /* @__PURE__ */ new Set();
    for (const env of matchingEnvs2) {
      if (typeof env.target === "string") {
        existingTargets2.add(env.target);
      } else if (Array.isArray(env.target)) {
        for (const target of env.target) {
          existingTargets2.add(target);
        }
      }
      if (env.customEnvironmentIds) {
        for (const customEnvId of env.customEnvironmentIds) {
          existingCustomEnvs2.add(customEnvId);
        }
      }
    }
    const choices2 = [
      ...envTargetChoices.filter((c) => !existingTargets2.has(c.value)),
      ...customEnvironments2.filter((c) => !existingCustomEnvs2.has(c.id)).map((c) => ({
        name: c.slug,
        value: c.id
      }))
    ];
    const missing = [];
    if (!envName)
      missing.push("missing_name");
    if (valueFromFlag === void 0 && !stdInput)
      missing.push("missing_value");
    if (!envTargetArg && choices2.length > 0)
      missing.push("missing_environment");
    if (envTargetArg === "preview" && envGitBranch === void 0 && !(client.nonInteractive && args.length === 2)) {
      missing.push("git_branch_required");
    }
    if (missing.length > 0) {
      const parts = missing.map((m) => {
        if (m === "missing_name")
          return "variable name";
        if (m === "missing_value")
          return "--value or stdin";
        if (m === "missing_environment")
          return "environment (production, preview, or development)";
        if (m === "git_branch_required")
          return "third argument <gitbranch> for Preview, or omit for all Preview branches";
        return m;
      });
      const fullTemplate = `env add <name> ${getEnvTargetPlaceholder()} <gitbranch> --value <value> --yes`;
      const filledTemplate = fillEnvAddTemplate(fullTemplate, {
        envName,
        envTargetArg,
        valueFromFlag,
        envGitBranch
      });
      const next = [];
      const onlyGitBranchMissing = missing.length === 1 && missing[0] === "git_branch_required";
      if (!onlyGitBranchMissing) {
        next.push({
          command: buildEnvAddCommandWithPreservedArgs(
            client.argv,
            filledTemplate
          )
        });
      }
      if (missing.includes("git_branch_required") && envName && (valueFromFlag !== void 0 || stdInput)) {
        const branchSpecific = fillEnvAddTemplate(
          "env add <name> preview <gitbranch> --value <value> --yes",
          { envName, envTargetArg: "preview", valueFromFlag }
        );
        const branchAll = fillEnvAddTemplate(
          "env add <name> preview --value <value> --yes",
          { envName, envTargetArg: "preview", valueFromFlag }
        );
        next.push(
          {
            command: buildEnvAddCommandWithPreservedArgs(
              client.argv,
              branchSpecific
            ),
            when: "Add to a specific Git branch"
          },
          {
            command: buildEnvAddCommandWithPreservedArgs(
              client.argv,
              branchAll
            ),
            when: "Add to all Preview branches"
          }
        );
      }
      outputActionRequired(
        client,
        {
          status: "action_required",
          reason: "missing_requirements",
          missing,
          message: `Provide all required inputs for non-interactive mode: ${parts.join("; ")}. Example: ${filledTemplate}`,
          next
        },
        1
      );
    }
  }
  if (!envName) {
    envName = await client.input.text({
      message: `What's the name of the variable?`,
      validate: (val) => val ? true : "Name cannot be empty"
    });
  }
  const skipConfirm = opts["--yes"] || !!stdInput || valueFromFlag !== void 0;
  if (!skipConfirm) {
    let keyAccepted = false;
    while (!keyAccepted) {
      const keyWarnings = getEnvKeyWarnings(envName);
      const sensitiveWarning = keyWarnings.find((w) => w.requiresConfirmation);
      if (!sensitiveWarning) {
        for (const w of keyWarnings) {
          output_manager_default.warn(w.message);
        }
        keyAccepted = true;
        break;
      }
      if (client.nonInteractive) {
        const nameWithoutPrefix2 = removePublicPrefix(envName);
        outputActionRequired(client, {
          status: "action_required",
          reason: "env_key_sensitive",
          message: `Key ${envName} may expose sensitive data (public prefix). Use --yes to keep as is, or rename to ${nameWithoutPrefix2}.`,
          choices: [
            { id: "keep", name: "Leave as is (use --yes)" },
            { id: "rename", name: `Rename to ${nameWithoutPrefix2}` }
          ],
          next: [
            {
              command: buildEnvAddCommandWithPreservedArgs(
                client.argv,
                `env add ${envName} ${getEnvTargetPlaceholder()} --value <value> --yes`
              ),
              when: "Leave as is"
            },
            {
              command: buildEnvAddCommandWithPreservedArgs(
                client.argv,
                `env add ${nameWithoutPrefix2} ${getEnvTargetPlaceholder()} --value <value> --yes`
              ),
              when: "Rename"
            }
          ]
        });
      }
      for (const w of keyWarnings) {
        output_manager_default.warn(w.message);
      }
      const nameWithoutPrefix = removePublicPrefix(envName);
      const choices2 = [
        { name: "Leave as is", value: "c" },
        { name: `Rename to ${nameWithoutPrefix}`, value: "p" },
        { name: "Re-enter", value: "r" }
      ];
      const action = await client.input.select({
        message: "How to proceed?",
        choices: choices2
      });
      if (action === "c") {
        keyAccepted = true;
      } else if (action === "p") {
        envName = nameWithoutPrefix;
        output_manager_default.log(`Renamed to ${envName}`);
      } else {
        envName = await client.input.text({
          message: `What's the name of the variable?`,
          validate: (val) => val ? true : "Name cannot be empty"
        });
      }
    }
  } else {
    const keyWarnings = getEnvKeyWarnings(envName);
    for (const w of keyWarnings) {
      output_manager_default.warn(w.message);
    }
  }
  const link = await getLinkedProject(client);
  if (link.status === "error") {
    return link.exitCode;
  } else if (link.status === "not_linked") {
    if (client.nonInteractive) {
      const preserved = getPreservedArgsForEnvAdd(client.argv);
      const linkPreserved = preserved.filter((a, i) => {
        if (a === "--value")
          return false;
        if (a.startsWith("--value="))
          return false;
        if (i > 0 && preserved[i - 1] === "--value")
          return false;
        return true;
      });
      const linkArgv = [
        ...client.argv.slice(0, 2),
        "link",
        ...link.status === "not_linked" ? ["--scope", "<scope>"] : [],
        ...linkPreserved
      ];
      let envAddRetryArgv = client.argv;
      if (envTargetArg === "preview" && envGitBranch === void 0) {
        const argvArgs = client.argv.slice(2);
        const addIdx = argvArgs.indexOf("add");
        if (addIdx !== -1) {
          let pos = addIdx + 1;
          let positionals = 0;
          while (pos < argvArgs.length && positionals < 3 && !argvArgs[pos].startsWith("-")) {
            positionals++;
            pos++;
          }
          const insertAt = 2 + pos;
          envAddRetryArgv = [
            ...client.argv.slice(0, insertAt),
            "<gitbranch>",
            ...client.argv.slice(insertAt)
          ];
        }
      }
      outputAgentError(
        client,
        {
          status: "error",
          reason: "not_linked",
          message: `Your codebase isn't linked to a project on Vercel. Run ${getCommandNamePlain(
            "link"
          )} to begin. Use --yes for non-interactive; use --scope or --project to specify team or project. Then run your env add command.`,
          next: [
            { command: buildCommandWithYes(linkArgv) },
            { command: buildCommandWithYes(envAddRetryArgv) }
          ]
        },
        1
      );
    } else {
      output_manager_default.error(
        `Your codebase isn\u2019t linked to a project on Vercel. Run ${getCommandName(
          "link"
        )} to begin.`
      );
    }
    return 1;
  }
  client.config.currentTeam = link.org.type === "team" ? link.org.id : void 0;
  const { project } = link;
  const [{ envs }, customEnvironments] = await Promise.all([
    getEnvRecords(client, project.id, "vercel-cli:env:add"),
    getCustomEnvironments(client, project.id)
  ]);
  const matchingEnvs = envs.filter((r) => r.key === envName);
  const existingTargets = /* @__PURE__ */ new Set();
  const existingCustomEnvs = /* @__PURE__ */ new Set();
  for (const env of matchingEnvs) {
    if (typeof env.target === "string") {
      existingTargets.add(env.target);
    } else if (Array.isArray(env.target)) {
      for (const target of env.target) {
        existingTargets.add(target);
      }
    }
    if (env.customEnvironmentIds) {
      for (const customEnvId of env.customEnvironmentIds) {
        existingCustomEnvs.add(customEnvId);
      }
    }
  }
  const choices = [
    ...envTargetChoices.filter((c) => !existingTargets.has(c.value)).map((c) => ({ name: c.name, value: c.value })),
    ...customEnvironments.filter((c) => !existingCustomEnvs.has(c.id)).map((c) => ({ name: c.slug, value: c.id }))
  ];
  if (!envGitBranch && choices.length === 0 && !opts["--force"]) {
    output_manager_default.error(
      `The variable ${param(
        envName
      )} has already been added to all Environments. To remove, run ${getCommandName(
        `env rm ${envName}`
      )}.`
    );
    return 1;
  }
  const forceSensitive = Boolean(opts["--sensitive"]);
  const forceEncrypted = Boolean(opts["--no-sensitive"]);
  if (forceSensitive && forceEncrypted) {
    output_manager_default.error(
      `--sensitive and --no-sensitive cannot be used together. Pick one.`
    );
    return 1;
  }
  let policyOn = false;
  if (link.org.type === "team") {
    try {
      const team = await getTeamById(client, link.org.id);
      policyOn = team?.sensitiveEnvironmentVariablePolicy === "on";
    } catch {
    }
  }
  if (policyOn) {
    for (const choice of choices) {
      if (choice.value === "development") {
        choice.disabled = "(disallowed)";
      } else if (choice.value === "production" || choice.value === "preview") {
        choice.checked = true;
      }
    }
  }
  let envValue;
  if (stdInput) {
    const normalizedStdinValue = normalizeStdinEnvValue(stdInput);
    envValue = normalizedStdinValue.value;
    if (normalizedStdinValue.strippedTrailingNewline) {
      output_manager_default.log("Removed trailing newline from stdin input");
    }
  } else if (valueFromFlag !== void 0) {
    envValue = valueFromFlag;
  } else {
    if (client.nonInteractive) {
      outputActionRequired(client, {
        status: "action_required",
        reason: "missing_value",
        message: "In non-interactive mode provide the value via --value or stdin. Example: vercel env add <name> <environment> --value 'value' --yes",
        next: [
          {
            command: buildEnvAddCommandWithPreservedArgs(
              client.argv,
              `env add <name> ${getEnvTargetPlaceholder()} --value <value> --yes`
            )
          }
        ]
      });
    }
    envValue = await client.input.password({
      message: `What's the value of ${envName}?`,
      mask: true
    });
  }
  const { finalValue } = await validateEnvValue({
    envName,
    initialValue: envValue,
    skipConfirm,
    promptForValue: () => client.input.password({
      message: `What's the value of ${envName}?`,
      mask: true
    }),
    selectAction: (choices2) => client.input.select({ message: "How to proceed?", choices: choices2 }),
    showWarning: (msg) => output_manager_default.warn(msg),
    showLog: (msg) => output_manager_default.log(msg)
  });
  while (envTargets.length === 0) {
    if (client.nonInteractive && choices.length > 0) {
      outputActionRequired(client, {
        status: "action_required",
        reason: "missing_environment",
        message: `Specify at least one environment. Add as argument or use: ${buildEnvAddCommandWithPreservedArgs(
          client.argv,
          `env add ${envName} <environment> --value <value> --yes`
        )}`,
        choices: choices.map((c) => ({
          id: c.value,
          name: typeof c.name === "string" ? c.name : c.value
        })),
        next: choices.slice(0, 5).map((c) => ({
          command: buildEnvAddCommandWithPreservedArgs(
            client.argv,
            `env add ${envName} ${c.value} --value <value> --yes`
          )
        }))
      });
    }
    envTargets = await client.input.checkbox({
      message: `Add ${envName} to which Environments (select multiple)?`,
      choices
    });
    if (envTargets.length === 0) {
      output_manager_default.error("Please select at least one Environment");
    }
  }
  if (envGitBranch === void 0 && envTargets.length === 1 && envTargets[0] === "preview") {
    if (client.nonInteractive) {
      outputActionRequired(
        client,
        {
          status: "action_required",
          reason: "git_branch_required",
          message: `Add ${envName} to which Git branch for Preview? Pass branch as third argument, or omit for all Preview branches.`,
          next: [
            {
              command: buildEnvAddCommandWithPreservedArgs(
                client.argv,
                `env add ${envName} preview <gitbranch> --value <value> --yes`
              ),
              when: "Add to a specific Git branch"
            },
            {
              command: buildEnvAddCommandWithPreservedArgs(
                client.argv,
                `env add ${envName} preview --value <value> --yes`
              ),
              when: "Add to all Preview branches"
            }
          ]
        },
        1
      );
    } else {
      envGitBranch = await client.input.text({
        message: `Add ${envName} to which Git branch? (leave empty for all Preview branches)?`
      });
    }
  }
  const hasDevelopment = envTargets.includes("development");
  const hasSensitiveCapable = envTargets.some((t) => t !== "development");
  if (policyOn && hasDevelopment) {
    const msg = `Your team has enabled the Sensitive Environment Variables Policy and the Development Environment does not support sensitive values. https://vercel.com/docs/environment-variables/sensitive-environment-variables#environment-variables-policy`;
    if (client.nonInteractive) {
      outputAgentError(
        client,
        {
          status: "error",
          reason: "development_disallowed_by_team_policy",
          message: msg
        },
        1
      );
    }
    output_manager_default.error(msg);
    return 1;
  }
  if (forceSensitive && hasDevelopment) {
    const msg = `--sensitive is not allowed with the Development Environment. Sensitive Environment Variables are only supported on Production and Preview.`;
    if (client.nonInteractive) {
      outputAgentError(
        client,
        {
          status: "error",
          reason: "sensitive_not_allowed_on_development",
          message: msg
        },
        1
      );
    }
    output_manager_default.error(msg);
    return 1;
  }
  if (hasDevelopment && hasSensitiveCapable) {
    const msg = `Development cannot be combined with other Environments because Development does not support sensitive Environment Variables. Run ${getCommandName(
      "env add"
    )} separately for Development.`;
    if (client.nonInteractive) {
      outputAgentError(
        client,
        {
          status: "error",
          reason: "mixed_development_and_sensitive_capable_targets",
          message: msg
        },
        1
      );
    }
    output_manager_default.error(msg);
    return 1;
  }
  let finalType = resolveTypeForTarget(
    hasDevelopment ? "development" : "production",
    { forceSensitive, forceEncrypted, policyOn }
  );
  const userWasExplicit = forceSensitive || forceEncrypted;
  const canPromptForType = !client.nonInteractive && !userWasExplicit && !policyOn && hasSensitiveCapable && !skipConfirm;
  if (canPromptForType) {
    output_manager_default.log(
      `Sensitive values cannot be retrieved later from the dashboard or CLI.`
    );
    const keepSensitive = await client.input.confirm(
      `Make it sensitive?`,
      true
    );
    if (!keepSensitive) {
      finalType = "encrypted";
    }
  }
  if (policyOn && hasSensitiveCapable) {
    if (forceEncrypted) {
      output_manager_default.warn(
        `--no-sensitive is ignored: your team enforces sensitive Environment Variables for Production and Preview.`
      );
      finalType = "sensitive";
    } else if (!userWasExplicit) {
      output_manager_default.log(
        `Your team requires sensitive Environment Variables for Production and Preview.`
      );
    }
  }
  const upsert = opts["--force"] ? "true" : "";
  const addStamp = stamp_default();
  try {
    output_manager_default.spinner("Saving");
    await addEnvRecord(
      client,
      project.id,
      upsert,
      finalType,
      envName,
      finalValue,
      envTargets,
      envGitBranch
    );
  } catch (err) {
    if (client.nonInteractive && isAPIError(err)) {
      const reason = err.slug || (err.serverMessage?.toLowerCase().includes("branch") ? "branch_not_found" : "api_error");
      outputAgentError(
        client,
        {
          status: "error",
          reason,
          message: err.serverMessage
        },
        1
      );
    }
    if (isAPIError(err) && isKnownError(err)) {
      output_manager_default.error(err.serverMessage);
      return 1;
    }
    throw err;
  }
  output_manager_default.print(
    `${prependEmoji(
      `${opts["--force"] ? "Overrode" : "Added"} Environment Variable ${import_chalk.default.bold(envName)} to Project ${import_chalk.default.bold(
        project.name
      )} ${import_chalk.default.gray(addStamp())}`,
      emoji("success")
    )}
`
  );
  const { isAgent } = await determineAgent();
  const guidanceMode = parsedArgs.flags["--guidance"] ?? isAgent;
  if (guidanceMode) {
    suggestNextCommands([getCommandName(`env ls`), getCommandName(`env pull`)]);
  }
  return 0;
}

// src/commands/env/ls.ts
var import_chalk2 = __toESM(require_source(), 1);
var import_ms = __toESM(require_ms(), 1);

// src/util/output/ellipsis.ts
function ellipsis(str, length) {
  return str.length > length ? `${str.slice(0, length - 1)}\u2026` : str;
}

// src/util/env/format-environments.ts
var import_title = __toESM(require_lib(), 1);
function formatEnvironments(link, env, customEnvironments) {
  const defaultTargets = (Array.isArray(env.target) ? env.target : [env.target || ""]).map((t) => {
    return formatEnvironment(link.org.slug, link.project.name, {
      id: t,
      slug: (0, import_title.default)(t)
    });
  });
  const customTargets = env.customEnvironmentIds ? env.customEnvironmentIds.map((id) => customEnvironments.find((e) => e.id === id)).filter(Boolean).map((e) => formatEnvironment(link.org.slug, link.project.name, e)) : [];
  const targetsString = [...defaultTargets, ...customTargets].join(", ");
  return env.gitBranch ? `${targetsString} (${env.gitBranch})` : targetsString;
}

// src/util/telemetry/commands/env/ls.ts
var EnvLsTelemetryClient = class extends TelemetryClient {
  trackCliArgumentEnvironment(environment) {
    if (environment) {
      this.trackCliArgument({
        arg: "environment",
        value: STANDARD_ENVIRONMENTS.includes(
          environment
        ) ? environment : this.redactedValue
      });
    }
  }
  trackCliArgumentGitBranch(gitBranch) {
    if (gitBranch) {
      this.trackCliArgument({
        arg: "git-branch",
        value: this.redactedValue
      });
    }
  }
  trackCliFlagGuidance(guidance) {
    if (guidance) {
      this.trackCliFlag("guidance");
    }
  }
};

// src/commands/env/ls.ts
import { determineAgent as determineAgent2 } from "@vercel/detect-agent";
async function ls(client, argv) {
  const telemetryClient = new EnvLsTelemetryClient({
    opts: {
      store: client.telemetryEventStore
    }
  });
  let parsedArgs;
  const flagsSpecification = getFlagsSpecification(listSubcommand.options);
  try {
    parsedArgs = parseArguments(argv, flagsSpecification);
  } catch (err) {
    printError(err);
    return 1;
  }
  const { args, flags } = parsedArgs;
  const validationResult = validateLsArgs({
    commandName: "env ls",
    args,
    maxArgs: 2,
    exitCode: 1,
    usageString: getCommandName(
      `env ls ${getEnvTargetPlaceholder()} <gitbranch>`
    )
  });
  if (validationResult !== 0) {
    return validationResult;
  }
  const [envTarget, envGitBranch] = args;
  const formatResult = validateJsonOutput(flags);
  if (!formatResult.valid) {
    output_manager_default.error(formatResult.error);
    return 1;
  }
  const asJson = formatResult.jsonOutput;
  telemetryClient.trackCliArgumentEnvironment(envTarget);
  telemetryClient.trackCliArgumentGitBranch(envGitBranch);
  telemetryClient.trackCliFlagGuidance(flags["--guidance"]);
  telemetryClient.trackCliOptionFormat(flags["--format"]);
  const link = await getLinkedProject(client);
  if (link.status === "error") {
    return link.exitCode;
  } else if (link.status === "not_linked") {
    output_manager_default.error(
      `Your codebase isn\u2019t linked to a project on Vercel. ${client.nonInteractive ? `Run ${getCommandName("link --yes --team <team-id> --project <project-id>")} to link non-interactively.` : `Run ${getCommandName("link")} to begin.`}`
    );
    return 1;
  }
  client.config.currentTeam = link.org.type === "team" ? link.org.id : void 0;
  const { project, org } = link;
  const lsStamp = stamp_default();
  const [envsResult, customEnvs] = await Promise.all([
    getEnvRecords(client, project.id, "vercel-cli:env:ls", {
      target: envTarget,
      gitBranch: envGitBranch
    }),
    getCustomEnvironments(client, project.id)
  ]);
  const { envs } = envsResult;
  const projectSlugLink = formatProject(org.slug, project.name);
  if (asJson) {
    output_manager_default.stopSpinner();
    const jsonOutput = {
      envs: envs.map((env) => ({
        key: env.key,
        value: env.type === "plain" ? env.value : void 0,
        type: env.type,
        target: env.target,
        gitBranch: env.gitBranch,
        configurationId: env.configurationId,
        createdAt: env.createdAt,
        updatedAt: env.updatedAt
      }))
    };
    client.stdout.write(`${JSON.stringify(jsonOutput, null, 2)}
`);
  } else if (envs.length === 0) {
    output_manager_default.log(
      `No Environment Variables found for ${projectSlugLink} ${import_chalk2.default.gray(lsStamp())}`
    );
  } else {
    output_manager_default.log(
      `Environment Variables found for ${projectSlugLink} ${import_chalk2.default.gray(lsStamp())}`
    );
    client.stdout.write(`${getTable(link, envs, customEnvs)}
`);
  }
  if (!asJson) {
    const { isAgent } = await determineAgent2();
    const guidanceMode = parsedArgs.flags["--guidance"] ?? isAgent;
    if (guidanceMode) {
      suggestNextCommands([
        getCommandName(`env add`),
        getCommandName("env rm"),
        getCommandName(`env pull`)
      ]);
    }
  }
  return 0;
}
function getTable(link, records, customEnvironments) {
  const label = records.some((env) => env.gitBranch) ? "environments (git branch)" : "environments";
  return formatTable(
    ["name", "value", label, "created"],
    ["l", "l", "l", "l", "l"],
    [
      {
        name: "",
        rows: records.map((row) => getRow(link, row, customEnvironments))
      }
    ]
  );
}
function getRow(link, env, customEnvironments) {
  let value;
  if (env.type === "plain") {
    const singleLineValue = env.value.replace(/\s/g, " ");
    value = import_chalk2.default.gray(ellipsis(singleLineValue, 19));
  } else if (env.type === "system") {
    value = import_chalk2.default.gray.italic(env.value);
  } else {
    value = import_chalk2.default.gray.italic("Encrypted");
  }
  const now = Date.now();
  return [
    import_chalk2.default.bold(env.key),
    value,
    formatEnvironments(link, env, customEnvironments),
    env.createdAt ? `${(0, import_ms.default)(now - env.createdAt)} ago` : ""
  ];
}

// src/commands/env/rm.ts
var import_chalk3 = __toESM(require_source(), 1);

// src/util/env/remove-env-record.ts
async function removeEnvRecord(client, projectId, env) {
  output_manager_default.debug(`Removing Environment Variable ${env.key}`);
  const url = `/v10/projects/${projectId}/env/${env.id}`;
  await client.fetch(url, {
    method: "DELETE"
  });
}

// src/util/telemetry/commands/env/rm.ts
var EnvRmTelemetryClient = class extends TelemetryClient {
  trackCliArgumentName(name) {
    if (name) {
      this.trackCliArgument({
        arg: "name",
        value: this.redactedValue
      });
    }
  }
  trackCliArgumentEnvironment(environment) {
    if (environment) {
      this.trackCliArgument({
        arg: "environment",
        value: STANDARD_ENVIRONMENTS.includes(
          environment
        ) ? environment : this.redactedValue
      });
    }
  }
  trackCliArgumentGitBranch(gitBranch) {
    if (gitBranch) {
      this.trackCliArgument({
        arg: "git-branch",
        value: this.redactedValue
      });
    }
  }
  trackCliFlagYes(yes) {
    if (yes) {
      this.trackCliFlag("yes");
    }
  }
};

// src/commands/env/rm.ts
async function rm(client, argv) {
  const telemetryClient = new EnvRmTelemetryClient({
    opts: {
      store: client.telemetryEventStore
    }
  });
  let parsedArgs;
  const flagsSpecification = getFlagsSpecification(removeSubcommand.options);
  try {
    parsedArgs = parseArguments(argv, flagsSpecification);
  } catch (err) {
    if (client.nonInteractive) {
      outputAgentError(
        client,
        {
          status: "error",
          reason: "invalid_arguments",
          message: err instanceof Error ? err.message : String(err)
        },
        1
      );
    }
    printError(err);
    return 1;
  }
  const { args, flags: opts } = parsedArgs;
  if (args.length > 3) {
    if (client.nonInteractive) {
      outputAgentError(
        client,
        {
          status: "error",
          reason: "invalid_arguments",
          message: `Invalid number of arguments. Usage: ${getCommandNamePlain(
            `env rm <name> ${getEnvTargetPlaceholder()} <gitbranch>`
          )}`
        },
        1
      );
    }
    output_manager_default.error(
      `Invalid number of arguments. Usage: ${getCommandName(
        `env rm <name> ${getEnvTargetPlaceholder()} <gitbranch>`
      )}`
    );
    return 1;
  }
  let [envName, envTarget, envGitBranch] = args;
  telemetryClient.trackCliArgumentName(envName);
  telemetryClient.trackCliArgumentEnvironment(envTarget);
  telemetryClient.trackCliArgumentGitBranch(envGitBranch);
  telemetryClient.trackCliFlagYes(opts["--yes"]);
  const link = await getLinkedProject(client);
  if (link.status === "error") {
    return link.exitCode;
  } else if (link.status === "not_linked") {
    if (client.nonInteractive) {
      const preserved = getPreservedArgsForEnvRm(client.argv).filter(
        (a) => a !== "--yes" && a !== "-y"
      );
      const linkArgv = [
        ...client.argv.slice(0, 2),
        "link",
        "--scope",
        "<scope>",
        ...preserved
      ];
      outputAgentError(
        client,
        {
          status: "error",
          reason: "not_linked",
          message: `Your codebase isn't linked to a project on Vercel. Run ${getCommandNamePlain(
            "link"
          )} to begin. Use --yes for non-interactive; use --scope or --project to specify team or project.`,
          next: [
            { command: buildCommandWithYes(linkArgv) },
            { command: buildCommandWithYes(client.argv) }
          ]
        },
        1
      );
    } else {
      output_manager_default.error(
        `Your codebase isn\u2019t linked to a project on Vercel. Run ${getCommandName(
          "link"
        )} to begin.`
      );
    }
    return 1;
  }
  client.config.currentTeam = link.org.type === "team" ? link.org.id : void 0;
  const { project } = link;
  if (!envName) {
    if (client.nonInteractive) {
      outputActionRequired(
        client,
        {
          status: "action_required",
          reason: "missing_name",
          message: "Provide the variable name as an argument. Example: vercel env rm <name> --yes",
          next: [
            {
              command: buildEnvRmCommandWithPreservedArgs(
                client.argv,
                `env rm <name> ${getEnvTargetPlaceholder()} --yes`
              )
            }
          ]
        },
        1
      );
    }
    envName = await client.input.text({
      message: "What's the name of the variable?",
      validate: (val) => val ? true : "Name cannot be empty"
    });
  }
  const [result, customEnvironments] = await Promise.all([
    getEnvRecords(client, project.id, "vercel-cli:env:rm", {
      target: envTarget,
      gitBranch: envGitBranch
    }),
    getCustomEnvironments(client, project.id)
  ]);
  let envs = result.envs.filter((env2) => env2.key === envName);
  if (envs.length === 0) {
    if (client.nonInteractive) {
      outputAgentError(
        client,
        {
          status: "error",
          reason: "env_not_found",
          message: `Environment Variable ${envName} was not found.`
        },
        1
      );
    }
    output_manager_default.error(`Environment Variable was not found.
`);
    return 1;
  }
  while (envs.length > 1) {
    if (client.nonInteractive) {
      outputActionRequired(
        client,
        {
          status: "action_required",
          reason: "multiple_envs",
          message: `Multiple Environment Variables match ${envName}. Specify target and/or branch to remove one.`,
          next: [
            {
              command: buildEnvRmCommandWithPreservedArgs(
                client.argv,
                `env rm ${envName} ${getEnvTargetPlaceholder()} --yes`
              )
            }
          ]
        },
        1
      );
    }
    const id = await client.input.select({
      message: `Remove ${envName} from which Environments?`,
      choices: envs.map((env2) => ({
        value: env2.id,
        name: formatEnvironments(link, env2, customEnvironments)
      }))
    });
    if (!id) {
      output_manager_default.error("Please select at least one Environment Variable to remove");
    }
    envs = envs.filter((env2) => env2.id === id);
  }
  const env = envs[0];
  const skipConfirmation = opts["--yes"];
  if (!skipConfirmation) {
    if (client.nonInteractive) {
      outputActionRequired(
        client,
        {
          status: "action_required",
          reason: "confirmation_required",
          message: `Removing Environment Variable ${env.key}. Use --yes to confirm.`,
          next: [{ command: buildCommandWithYes(client.argv) }]
        },
        1
      );
    }
    if (!await client.input.confirm(
      `Removing Environment Variable ${param(env.key)} from ${formatEnvironments(
        link,
        env,
        customEnvironments
      )} in Project ${import_chalk3.default.bold(project.name)}. Are you sure?`,
      false
    )) {
      output_manager_default.log("Canceled");
      return 0;
    }
  }
  const rmStamp = stamp_default();
  try {
    output_manager_default.spinner("Removing");
    await removeEnvRecord(client, project.id, env);
  } catch (err) {
    if (client.nonInteractive && isAPIError(err)) {
      const reason = err.slug || (err.serverMessage?.toLowerCase().includes("branch") ? "branch_not_found" : "api_error");
      outputAgentError(
        client,
        {
          status: "error",
          reason,
          message: err.serverMessage
        },
        1
      );
    }
    if (isAPIError(err) && isKnownError(err)) {
      output_manager_default.error(err.serverMessage);
      return 1;
    }
    throw err;
  }
  output_manager_default.print(
    `${prependEmoji(
      `Removed Environment Variable ${import_chalk3.default.gray(rmStamp())}`,
      emoji("success")
    )}
`
  );
  return 0;
}

// src/commands/env/run.ts
var import_env = __toESM(require_dist3(), 1);
var import_execa = __toESM(require_execa(), 1);
function parseRunArgs(argv) {
  const argvIndex = argv.indexOf("--");
  const hasDoubleDash = argvIndex !== -1;
  const vercelArgs = hasDoubleDash ? argv.slice(2, argvIndex) : argv.slice(2);
  const userCommand = hasDoubleDash ? argv.slice(argvIndex + 1) : [];
  return { vercelArgs, userCommand };
}
function needsHelpForRun(client) {
  const { vercelArgs } = parseRunArgs(client.argv);
  const flagsSpecification = getFlagsSpecification(runSubcommand.options);
  try {
    const parsedArgs = parseArguments(vercelArgs, flagsSpecification);
    return Boolean(parsedArgs.flags["--help"]);
  } catch {
    return false;
  }
}
async function run(client) {
  const { vercelArgs, userCommand } = parseRunArgs(client.argv);
  let parsedArgs;
  const flagsSpecification = getFlagsSpecification(runSubcommand.options);
  try {
    parsedArgs = parseArguments(vercelArgs, flagsSpecification);
  } catch (error) {
    printError(error);
    return 1;
  }
  if (userCommand.length === 0) {
    output_manager_default.error(
      `No command provided. Use \`--\` to separate vercel flags from your command.`
    );
    return 1;
  }
  const link = await getLinkedProject(client);
  if (link.status === "error") {
    return link.exitCode;
  } else if (link.status === "not_linked") {
    output_manager_default.error(
      `Your codebase isn't linked to a project on Vercel. Run ${getCommandName(
        "link"
      )} to begin.`
    );
    return 1;
  }
  client.config.currentTeam = link.org.type === "team" ? link.org.id : void 0;
  const environment = parseTarget({
    flagName: "environment",
    flags: parsedArgs.flags
  }) || "development";
  const gitBranch = parsedArgs.flags["--git-branch"];
  output_manager_default.spinner(`Downloading \`${environment}\` Environment Variables`);
  const records = await pullEnvRecords(
    client,
    link.project.id,
    "vercel-cli:env:run",
    {
      target: environment,
      gitBranch
    }
  );
  output_manager_default.stopSpinner();
  output_manager_default.debug(
    `Running command with ${Object.keys(records.env).length} environment variables`
  );
  let localEnv = {};
  try {
    localEnv = (0, import_env.loadEnvConfig)(client.cwd, true).combinedEnv;
  } catch (err) {
    output_manager_default.debug(`Failed to load local env files: ${err}`);
  }
  try {
    const result = await (0, import_execa.default)(userCommand[0], userCommand.slice(1), {
      cwd: client.cwd,
      stdio: "inherit",
      reject: false,
      env: {
        ...records.env,
        ...localEnv,
        ...process.env
      }
    });
    if (result instanceof Error && typeof result.exitCode !== "number") {
      output_manager_default.prettyError(result);
      return 1;
    }
    return result.exitCode;
  } catch (err) {
    output_manager_default.prettyError(err);
    return 1;
  }
}

// src/commands/env/update.ts
var import_chalk4 = __toESM(require_source(), 1);

// src/util/env/update-env-record.ts
var import_constants2 = __toESM(require_dist2(), 1);
async function updateEnvRecord(client, projectId, envId, type, key, value, targets, gitBranch) {
  output_manager_default.debug(
    `Updating ${type} Environment Variable ${key} in ${targets.length} targets`
  );
  const target = [];
  const customEnvironmentIds = [];
  for (const t of targets) {
    const arr = import_constants2.PROJECT_ENV_TARGET.includes(t) ? target : customEnvironmentIds;
    arr.push(t);
  }
  const body = {
    type,
    key,
    value,
    target,
    customEnvironmentIds: customEnvironmentIds.length > 0 ? customEnvironmentIds : void 0,
    gitBranch: gitBranch || void 0
  };
  const url = `/v10/projects/${projectId}/env/${envId}`;
  await client.fetch(url, {
    method: "PATCH",
    body
  });
}

// src/util/telemetry/commands/env/update.ts
var EnvUpdateTelemetryClient = class extends TelemetryClient {
  trackCliArgumentName(name) {
    if (name) {
      this.trackCliArgument({
        arg: "name",
        value: this.redactedValue
      });
    }
  }
  trackCliArgumentEnvironment(environment) {
    if (environment) {
      this.trackCliArgument({
        arg: "environment",
        value: STANDARD_ENVIRONMENTS.includes(
          environment
        ) ? environment : this.redactedValue
      });
    }
  }
  trackCliArgumentGitBranch(gitBranch) {
    if (gitBranch) {
      this.trackCliArgument({
        arg: "git-branch",
        value: this.redactedValue
      });
    }
  }
  trackCliFlagSensitive(sensitive) {
    if (sensitive) {
      this.trackCliFlag("sensitive");
    }
  }
  trackCliFlagYes(yes) {
    if (yes) {
      this.trackCliFlag("yes");
    }
  }
  trackCliOptionValue(value) {
    if (value) {
      this.trackCliOption({
        option: "value",
        value: this.redactedValue
      });
    }
  }
};

// src/commands/env/update.ts
function selectedEnvTargetsDevelopment(env) {
  if (typeof env.target === "string")
    return env.target === "development";
  if (Array.isArray(env.target))
    return env.target.includes("development");
  return false;
}
async function update(client, argv) {
  let parsedArgs;
  const flagsSpecification = getFlagsSpecification(updateSubcommand.options);
  try {
    parsedArgs = parseArguments(argv, flagsSpecification);
  } catch (err) {
    if (client.nonInteractive) {
      outputAgentError(
        client,
        {
          status: "error",
          reason: "invalid_arguments",
          message: err instanceof Error ? err.message : String(err)
        },
        1
      );
    }
    printError(err);
    return 1;
  }
  const { args, flags: opts } = parsedArgs;
  const valueFromFlag = typeof opts["--value"] === "string" ? opts["--value"] : void 0;
  const stdInput = await readStandardInput(client.stdin);
  let [envName, envTargetArg, envGitBranch] = args;
  const telemetryClient = new EnvUpdateTelemetryClient({
    opts: {
      store: client.telemetryEventStore
    }
  });
  telemetryClient.trackCliArgumentName(envName);
  telemetryClient.trackCliArgumentEnvironment(envTargetArg);
  telemetryClient.trackCliArgumentGitBranch(envGitBranch);
  telemetryClient.trackCliFlagSensitive(opts["--sensitive"]);
  telemetryClient.trackCliFlagYes(opts["--yes"]);
  telemetryClient.trackCliOptionValue(valueFromFlag);
  if (args.length > 3) {
    if (client.nonInteractive) {
      outputAgentError(
        client,
        {
          status: "error",
          reason: "invalid_arguments",
          message: `Invalid number of arguments. Usage: ${getCommandNamePlain(
            `env update <name> ${getEnvTargetPlaceholder()} <gitbranch>`
          )}`
        },
        1
      );
    }
    output_manager_default.error(
      `Invalid number of arguments. Usage: ${getCommandName(
        `env update <name> ${getEnvTargetPlaceholder()} <gitbranch>`
      )}`
    );
    return 1;
  }
  if (stdInput && (!envName || !envTargetArg)) {
    output_manager_default.error(
      `Invalid number of arguments. Usage: ${getCommandName(
        `env update <name> <target> <gitbranch> < <file>`
      )}`
    );
    return 1;
  }
  if (client.nonInteractive) {
    const missing = [];
    if (!envName)
      missing.push("missing_name");
    if (!stdInput && valueFromFlag === void 0)
      missing.push("missing_value");
    if (missing.length > 0) {
      const parts = missing.map(
        (m) => m === "missing_name" ? "name" : "--value or stdin"
      );
      const targetPart = envTargetArg || getEnvTargetPlaceholder();
      const branchPart = envTargetArg === "preview" || envTargetArg === "development" ? " <gitbranch>" : "";
      const template = `env update ${envName || "<name>"} ${targetPart}${branchPart} --value <value> --yes`;
      outputActionRequired(
        client,
        {
          status: "action_required",
          reason: "missing_requirements",
          missing,
          message: `Provide all required inputs for non-interactive mode: ${parts.join("; ")}. Example: ${getCommandNamePlain(template)}`,
          next: [
            {
              command: buildEnvUpdateCommandWithPreservedArgs(
                client.argv,
                template
              )
            }
          ]
        },
        1
      );
    }
  }
  const envTargets = [];
  if (envTargetArg) {
    envTargets.push(envTargetArg);
  }
  if (!envName) {
    if (client.nonInteractive) {
      outputActionRequired(
        client,
        {
          status: "action_required",
          reason: "missing_name",
          message: "Provide the variable name as an argument. Example: vercel env update <name>",
          next: [
            {
              command: buildEnvUpdateCommandWithPreservedArgs(
                client.argv,
                `env update <name> ${getEnvTargetPlaceholder()} --value <value> --yes`
              )
            }
          ]
        },
        1
      );
    } else {
      envName = await client.input.text({
        message: `What's the name of the variable to update?`,
        validate: (val) => val ? true : "Name cannot be empty"
      });
    }
  }
  const link = await getLinkedProject(client);
  if (link.status === "error") {
    return link.exitCode;
  } else if (link.status === "not_linked") {
    if (client.nonInteractive) {
      const preserved = getPreservedArgsForEnvUpdate(client.argv).filter(
        (a) => a !== "--yes" && a !== "-y"
      );
      const linkArgv = [
        ...client.argv.slice(0, 2),
        "link",
        "--scope",
        "<scope>",
        ...preserved
      ];
      outputAgentError(
        client,
        {
          status: "error",
          reason: "not_linked",
          message: `Your codebase isn't linked to a project on Vercel. Run ${getCommandNamePlain(
            "link"
          )} to begin. Use --yes for non-interactive; use --scope or --project to specify team or project.`,
          next: [
            { command: buildCommandWithYes(linkArgv) },
            { command: buildCommandWithYes(client.argv) }
          ]
        },
        1
      );
    }
    output_manager_default.error(
      `Your codebase isn't linked to a project on Vercel. Run ${getCommandName(
        "link"
      )} to begin.`
    );
    return 1;
  }
  client.config.currentTeam = link.org.type === "team" ? link.org.id : void 0;
  const { project } = link;
  const [{ envs }, customEnvironments] = await Promise.all([
    getEnvRecords(client, project.id, "vercel-cli:env:update"),
    getCustomEnvironments(client, project.id)
  ]);
  const matchingEnvs = envs.filter((r) => r.key === envName);
  if (matchingEnvs.length === 0) {
    if (client.nonInteractive) {
      outputAgentError(
        client,
        {
          status: "error",
          reason: "env_not_found",
          message: `The variable ${envName} was not found. Run ${getCommandNamePlain(
            "env ls"
          )} to see all available Environment Variables.`
        },
        1
      );
    }
    output_manager_default.error(
      `The variable ${param(envName)} was not found. Run ${getCommandName(
        `env ls`
      )} to see all available Environment Variables.`
    );
    return 1;
  }
  let selectedEnv;
  if (envTargetArg || envGitBranch) {
    const filteredEnvs = matchingEnvs.filter((env) => {
      const matchesTarget = !envTargetArg || (Array.isArray(env.target) ? env.target.includes(envTargetArg) : env.target === envTargetArg) || env.customEnvironmentIds && env.customEnvironmentIds.includes(envTargetArg);
      const matchesGitBranch = !envGitBranch || env.gitBranch === envGitBranch;
      return matchesTarget && matchesGitBranch;
    });
    if (filteredEnvs.length === 0) {
      if (client.nonInteractive) {
        outputAgentError(
          client,
          {
            status: "error",
            reason: "env_not_found",
            message: `No Environment Variable ${envName} found matching the specified target/branch.`
          },
          1
        );
      }
      output_manager_default.error(
        `No Environment Variable ${param(envName)} found matching the specified criteria.`
      );
      return 1;
    }
    if (filteredEnvs.length === 1) {
      selectedEnv = filteredEnvs[0];
    } else {
      if (client.nonInteractive) {
        outputActionRequired(
          client,
          {
            status: "action_required",
            reason: "multiple_envs",
            message: `Multiple Environment Variables match ${envName}. Specify target and/or branch to update one.`,
            next: [
              {
                command: buildEnvUpdateCommandWithPreservedArgs(
                  client.argv,
                  `env update ${envName} ${getEnvTargetPlaceholder()} <gitbranch>`
                )
              }
            ]
          },
          1
        );
      }
      const choices = filteredEnvs.map((env, index) => {
        const targets2 = formatEnvironments(link, env, customEnvironments);
        return {
          name: targets2,
          value: index
        };
      });
      const selectedIndex = await client.input.select({
        message: `Multiple Environment Variables found for ${param(envName)}. Which one do you want to update?`,
        choices
      });
      selectedEnv = filteredEnvs[selectedIndex];
    }
  } else if (matchingEnvs.length === 1) {
    selectedEnv = matchingEnvs[0];
  } else {
    if (client.nonInteractive) {
      outputActionRequired(
        client,
        {
          status: "action_required",
          reason: "multiple_envs",
          message: `Multiple Environment Variables match ${envName}. Specify target and/or branch to update one.`,
          next: [
            {
              command: buildEnvUpdateCommandWithPreservedArgs(
                client.argv,
                `env update ${envName} ${getEnvTargetPlaceholder()} <gitbranch>`
              )
            }
          ]
        },
        1
      );
    }
    const choices = matchingEnvs.map((env, index) => {
      const targets2 = formatEnvironments(link, env, customEnvironments);
      return {
        name: targets2,
        value: index
      };
    });
    const selectedIndex = await client.input.select({
      message: `Multiple Environment Variables found for ${param(envName)}. Which one do you want to update?`,
      choices
    });
    selectedEnv = matchingEnvs[selectedIndex];
  }
  let policyOn = false;
  if (link.org.type === "team") {
    try {
      const team = await getTeamById(client, link.org.id);
      policyOn = team?.sensitiveEnvironmentVariablePolicy === "on";
    } catch {
    }
  }
  const selectedIsDevelopment = selectedEnvTargetsDevelopment(selectedEnv);
  if (policyOn && selectedIsDevelopment) {
    const msg = `Your team has enabled the Sensitive Environment Variables Policy and the Development Environment does not support sensitive values. https://vercel.com/docs/environment-variables/sensitive-environment-variables#environment-variables-policy`;
    if (client.nonInteractive) {
      outputAgentError(
        client,
        {
          status: "error",
          reason: "development_disallowed_by_team_policy",
          message: msg
        },
        1
      );
    }
    output_manager_default.error(msg);
    return 1;
  }
  if (opts["--sensitive"] && selectedIsDevelopment) {
    const msg = `--sensitive is not allowed with the Development Environment. Sensitive Environment Variables are only supported on Production and Preview.`;
    if (client.nonInteractive) {
      outputAgentError(
        client,
        {
          status: "error",
          reason: "sensitive_not_allowed_on_development",
          message: msg
        },
        1
      );
    }
    output_manager_default.error(msg);
    return 1;
  }
  let envValue;
  if (stdInput) {
    const normalizedStdinValue = normalizeStdinEnvValue(stdInput);
    envValue = normalizedStdinValue.value;
    if (normalizedStdinValue.strippedTrailingNewline) {
      output_manager_default.log("Removed trailing newline from stdin input");
    }
  } else if (valueFromFlag !== void 0) {
    envValue = valueFromFlag;
  } else {
    if (client.nonInteractive) {
      const branchPart = envTargetArg === "preview" || envTargetArg === "development" ? " <gitbranch>" : "";
      const targetPart = envTargetArg || getEnvTargetPlaceholder();
      outputActionRequired(
        client,
        {
          status: "action_required",
          reason: "missing_value",
          message: "In non-interactive mode provide the new value via --value or stdin. Example: vercel env update <name> <environment> --value 'value' --yes",
          next: [
            {
              command: buildEnvUpdateCommandWithPreservedArgs(
                client.argv,
                `env update ${envName} ${targetPart}${branchPart} --value <value> --yes`
              )
            }
          ]
        },
        1
      );
    }
    envValue = await client.input.text({
      message: `What's the new value of ${envName}?`
    });
  }
  const skipConfirm = opts["--yes"] || !!stdInput || valueFromFlag !== void 0;
  const { finalValue, alreadyConfirmed } = await validateEnvValue({
    envName,
    initialValue: envValue,
    skipConfirm,
    promptForValue: () => client.input.text({ message: `What's the new value of ${envName}?` }),
    selectAction: (choices) => client.input.select({ message: "How to proceed?", choices }),
    showWarning: (msg) => output_manager_default.warn(msg),
    showLog: (msg) => output_manager_default.log(msg)
  });
  if (!opts["--yes"] && !alreadyConfirmed) {
    if (client.nonInteractive) {
      outputActionRequired(
        client,
        {
          status: "action_required",
          reason: "confirmation_required",
          message: `Updating Environment Variable ${envName}. Use --yes to confirm.`,
          next: [{ command: buildCommandWithYes(client.argv) }]
        },
        1
      );
    }
    const currentTargets = formatEnvironments(
      link,
      selectedEnv,
      customEnvironments
    );
    const confirmed = await client.input.confirm(
      `Updating Environment Variable ${param(envName)} in ${currentTargets} in Project ${import_chalk4.default.bold(project.name)}. Are you sure?`,
      false
    );
    if (!confirmed) {
      output_manager_default.log("Canceled");
      return 0;
    }
  }
  const type = opts["--sensitive"] ? "sensitive" : selectedEnv.type;
  const targets = Array.isArray(selectedEnv.target) ? selectedEnv.target : [selectedEnv.target].filter(
    (r) => Boolean(r)
  );
  const allTargets = [...targets, ...selectedEnv.customEnvironmentIds || []];
  const updateStamp = stamp_default();
  try {
    output_manager_default.spinner("Updating");
    await updateEnvRecord(
      client,
      project.id,
      selectedEnv.id,
      type,
      envName,
      finalValue,
      allTargets,
      selectedEnv.gitBranch || ""
    );
  } catch (err) {
    if (client.nonInteractive && isAPIError(err)) {
      const reason = err.slug || (err.serverMessage?.toLowerCase().includes("branch") ? "branch_not_found" : "api_error");
      outputAgentError(
        client,
        {
          status: "error",
          reason,
          message: err.serverMessage
        },
        1
      );
    }
    if (isAPIError(err) && isKnownError(err)) {
      output_manager_default.error(err.serverMessage);
      return 1;
    }
    throw err;
  }
  output_manager_default.print(
    `${prependEmoji(
      `Updated Environment Variable ${import_chalk4.default.bold(envName)} in Project ${import_chalk4.default.bold(
        project.name
      )} ${import_chalk4.default.gray(updateStamp())}`,
      emoji("success")
    )}
`
  );
  return 0;
}

// src/util/telemetry/commands/env/index.ts
var EnvTelemetryClient = class extends TelemetryClient {
  trackCliSubcommandList(actual) {
    this.trackCliSubcommand({
      subcommand: "ls",
      value: actual
    });
  }
  trackCliSubcommandAdd(actual) {
    this.trackCliSubcommand({
      subcommand: "add",
      value: actual
    });
  }
  trackCliSubcommandRemove(actual) {
    this.trackCliSubcommand({
      subcommand: "rm",
      value: actual
    });
  }
  trackCliSubcommandPull(actual) {
    this.trackCliSubcommand({
      subcommand: "pull",
      value: actual
    });
  }
  trackCliSubcommandRun(actual) {
    this.trackCliSubcommand({
      subcommand: "run",
      value: actual
    });
  }
  trackCliSubcommandUpdate(actual) {
    this.trackCliSubcommand({
      subcommand: "update",
      value: actual
    });
  }
};

// src/commands/env/index.ts
var COMMAND_CONFIG = {
  ls: getCommandAliases(listSubcommand),
  add: getCommandAliases(addSubcommand),
  rm: getCommandAliases(removeSubcommand),
  pull: getCommandAliases(pullSubcommand),
  run: getCommandAliases(runSubcommand),
  update: getCommandAliases(updateSubcommand)
};
async function main(client) {
  const telemetry = new EnvTelemetryClient({
    opts: {
      store: client.telemetryEventStore
    }
  });
  let parsedArgs;
  const flagsSpecification = getFlagsSpecification(envCommand.options);
  try {
    parsedArgs = parseArguments(client.argv.slice(2), flagsSpecification, {
      permissive: true
    });
  } catch (err) {
    printError(err);
    return 1;
  }
  const subArgs = parsedArgs.args.slice(1);
  const { subcommand, args, subcommandOriginal } = getSubcommand(
    subArgs,
    COMMAND_CONFIG
  );
  const needHelp = parsedArgs.flags["--help"];
  if (!subcommand && needHelp) {
    telemetry.trackCliFlagHelp("env", subcommand);
    output_manager_default.print(help(envCommand, { columns: client.stderr.columns }));
    return 2;
  }
  function printHelp(command) {
    output_manager_default.print(
      help(command, { parent: envCommand, columns: client.stderr.columns })
    );
  }
  let exitCode;
  switch (subcommand) {
    case "ls":
      if (needHelp) {
        telemetry.trackCliFlagHelp("env", subcommandOriginal);
        printHelp(listSubcommand);
        return 2;
      }
      telemetry.trackCliSubcommandList(subcommandOriginal);
      exitCode = await ls(client, args);
      break;
    case "add":
      if (needHelp) {
        telemetry.trackCliFlagHelp("env", subcommandOriginal);
        printHelp(addSubcommand);
        return 2;
      }
      telemetry.trackCliSubcommandAdd(subcommandOriginal);
      exitCode = await add(client, args);
      break;
    case "rm":
      if (needHelp) {
        telemetry.trackCliFlagHelp("env", subcommandOriginal);
        printHelp(removeSubcommand);
        return 2;
      }
      telemetry.trackCliSubcommandRemove(subcommandOriginal);
      exitCode = await rm(client, args);
      break;
    case "pull":
      if (needHelp) {
        telemetry.trackCliFlagHelp("env", subcommandOriginal);
        printHelp(pullSubcommand);
        return 2;
      }
      telemetry.trackCliSubcommandPull(subcommandOriginal);
      exitCode = await pull(client, args);
      break;
    case "run":
      if (needsHelpForRun(client)) {
        telemetry.trackCliFlagHelp("env", subcommandOriginal);
        printHelp(runSubcommand);
        return 2;
      }
      telemetry.trackCliSubcommandRun(subcommandOriginal);
      exitCode = await run(client);
      break;
    case "update":
      if (needHelp) {
        telemetry.trackCliFlagHelp("env", subcommandOriginal);
        printHelp(updateSubcommand);
        return 2;
      }
      telemetry.trackCliSubcommandUpdate(subcommandOriginal);
      exitCode = await update(client, args);
      break;
    default:
      output_manager_default.error(getInvalidSubcommand(COMMAND_CONFIG));
      output_manager_default.print(help(envCommand, { columns: client.stderr.columns }));
      return 2;
  }
  if (exitCode === 0) {
    await autoInstallVercelPlugin(client);
  }
  return exitCode;
}
export {
  main as default
};
