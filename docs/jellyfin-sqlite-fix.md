# Jellyfin SQLite Concurrency Fix

## Problem

E2E tests were failing with HTTP 500 errors during authentication due to SQLite database locks.

## Root Cause

Jellyfin was configured with `<LockingBehavior>NoLock</LockingBehavior>` in `/config/config/database.xml`, causing immediate failures on concurrent access.

## Solution

Change the locking behavior to `Normal`:

```bash
kubectl exec -n jellyfin <jellyfin-pod> -- sh -c "sed -i 's/NoLock/Normal/g' /config/config/database.xml"
kubectl rollout restart deployment/jellyfin -n jellyfin
```

## Configuration File

Location: `/config/config/database.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<DatabaseConfigurationOptions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <DatabaseType>Jellyfin-SQLite</DatabaseType>
  <LockingBehavior>Normal</LockingBehavior>
</DatabaseConfigurationOptions>
```

## Safety Mitigations Implemented

1. **Retry Logic**: 3 attempts with exponential backoff (1s, 2s, 4s) for occasional failures
2. **AUTH_DELAY**: 2 seconds between test files to reduce concurrent load
3. **Sequential Test Execution**: `--no-file-parallelism --poolOptions.threads.singleThread=true` in CI

## PostgreSQL Status

- Jellyfin **does not support PostgreSQL** currently
- SQLite is the only supported database backend
- Future PostgreSQL support planned after EF Core migration (v10.11.0+)

## Test Results

- Before fix: 4/67 tests failing with HTTP 500
- After fix: 67/67 tests passing
