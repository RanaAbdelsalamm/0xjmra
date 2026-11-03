---
Title: "A Small Linux Hardening Baseline That Stays Maintainable"
Date: 2026-09-14
Category: Systems
Excerpt: "Hardening is more useful when every control has an owner, a reason, and a way to prove it still works."
---

## Keep the baseline reviewable

A good baseline should be readable by the person who will operate the host next month. I separate controls into identity, network exposure, patching, logging, and recovery rather than turning one shell script into an opaque checklist.

The first pass usually covers:

- disabling unused services and closing unnecessary listening ports;
- enforcing least privilege for administrative access;
- enabling unattended security updates with a review path;
- shipping authentication and privilege events to a central log;
- testing restore procedures instead of only documenting them.

> A control that cannot be observed will eventually become a belief.

The baseline is a starting point, not a substitute for threat modeling.
