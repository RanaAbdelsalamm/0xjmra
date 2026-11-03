---
Title: "RTO and RPO Are Design Inputs, Not Report Footnotes"
Date: 2026-08-02
Category: Security
Excerpt: "Recovery targets become actionable when they are translated into architecture, runbooks, and timed exercises."
---

## Start with the service promise

Recovery time objective (RTO) and recovery point objective (RPO) describe what a service can tolerate after an incident. They should shape replication, backup frequency, failover design, and the order of operations in the runbook.

For each critical dependency, document:

- the maximum acceptable data loss window;
- the target time to restore a usable service;
- the person who can declare the incident;
- the evidence collected during a recovery exercise.

A quarterly restore test is often more valuable than another page of assumptions. The test should include the slow dependencies: identity, secrets, DNS, certificates, and the first operator who has to make a decision under pressure.
