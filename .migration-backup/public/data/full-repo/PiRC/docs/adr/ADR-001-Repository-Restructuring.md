# ADR 001: Professional Repository Restructuring

**Date:** 2026-05-18
**Status:** Accepted

## Context
The repository layout was previously flattened, leading to compilation issues and difficult onboarding. We hit "no space left on device" issues in CI/Termux.

## Decision
We adapt a highly segregated monolith-monorepo structure. All contracts are isolated in `/contracts/`. All standards live in `/standards/`. We introduce GitHub action workflows to offload compilation loads from local devices (Termux) to the cloud.
