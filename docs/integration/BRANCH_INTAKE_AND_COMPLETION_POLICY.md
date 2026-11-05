# Branch Intake and Completion Policy

## 1. Immutable source intake

Every candidate branch is identified by repository, branch name, exact head SHA, base SHA, merge-base SHA, ahead/behind counts and changed paths. Branch names are labels, not provenance. A branch with a matching name in another repository is a separate source.

## 2. Classification

Classify each changed path as: normative spec, schema, executable source, test, workflow/automation, generated output, vendored dependency, nested repository snapshot, backup, secret/environment material, or unknown. Unknown and sensitive paths are quarantined from automatic intake.

## 3. Review order

1. Read PR/issue discussion as requirements and rationale, not proof of implementation.
2. Compare exact branch head to its declared base.
3. Inspect source and tests for every accepted feature.
4. Identify duplicated schemas and conflicting ownership.
5. Run dependency, secret and workflow permission checks.
6. Port only coherent, non-duplicated capabilities.
7. Record source SHA and destination commit for every port.
8. Preserve source branch and original artifacts.
9. Split unrelated capabilities into focused PRs where practical.

## 4. Prohibited actions

No blind merge of all branches, branch deletion, force push, auto-commit workflow, unreviewed secret rotation, arbitrary code deployment, or production key access. Do not delete nested snapshots or duplicate-looking files until content hashes, references, ownership and retention requirements are documented.

## 5. Completion record

Each accepted feature records source repository/branch/SHA, target path, requirement ID, implementation SHA, tests, CI run, reviewer, security disposition, deployment environment, contract ID/code hash, read-back, known gaps, owner and rollback.
