# feat-0010: Storage orphan cleanup

## Summary

Hourly background job deletes **Supabase Storage** objects under `claims/` that are **older than 1 hour** and **not referenced** in any `ClaimMessage.attachments` upload path.

## Problem

Failed or abandoned uploads leave orphan files that consume storage and cost.

## Use case catalog

| ID | Behavior |
|----|----------|
| **UC-OC01** | Job runs every 60 minutes on API process |
| **UC-OC02** | Lists bucket prefix `claims/` |
| **UC-OC03** | Skips files referenced in DB |
| **UC-OC04** | Logs deleted count when > 0 |

## Related

- [feat-0010 TECH](./TECH.md)
