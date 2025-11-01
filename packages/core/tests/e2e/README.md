# E2E Integration Tests

Real-server integration tests for the Jellyfin Mini Client.

## Test Coverage

### ✅ Queue Tests (22 tests)

Tests playback queue operations against the actual Queue implementation:

- Queue operations (add, remove, clear, set)
- Navigation (next, previous, jump)
- Shuffle functionality
- Repeat modes (off, all, one)
- Edge cases and error handling

### ⚠️ Authentication Tests (6 tests, 2 passing)

Tests authentication flows against real Jellyfin server:

- ✓ Server info retrieval (no auth required)
- ✓ Invalid credentials rejection
- ✗ Valid credentials login (requires working account)
- ✗ Token management
- ✗ Logout flow
- ✗ HTTPS validation

### Library Tests (18 tests)

Tests library queries against real Jellyfin server (requires authentication):

- Album queries (all, recent, by ID)
- Artist queries
- Track queries (by album, by artist)
- Search functionality
- Image URL generation
- Stream URL generation

### Playback Tests (9 tests)

Tests playback reporting against real Jellyfin server (requires authentication):

- Playback start reporting
- Progress updates
- Pause/resume tracking
- Stop reporting
- Session management
- Error handling

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e --workspace=@jellyfin-mini/core

# Run tests in watch mode
npm run test:watch --workspace=@jellyfin-mini/core

# Run only queue tests (no server required)
npm run test:e2e --workspace=@jellyfin-mini/core tests/e2e/queue
```

## Configuration

Tests load credentials from environment variables in `.env` file at project root:

```bash
JELLYFIN_SERVER_URL=https://your-server.com
JELLYFIN_TEST_USERNAME=your-username
JELLYFIN_TEST_PASSWORD=your-password
```

## Troubleshooting

### Authentication Failures (HTTP 500)

If you see `Internal Server Error` during authentication:

**Known Issue**: The Jellyfin server at <https://media.nikolay-eremeev.com> returns HTTP 500 for authentication requests. Investigation shows:

- ✅ Correct API path: `/Users/AuthenticateByName` (no `/api` prefix)
- ✅ Server reachable and responding
- ❌ Authentication endpoint returning HTTP 500 "Error processing request"

**Possible causes**:

1. **Invalid credentials** - Username "middle" or password may be incorrect
2. **User account disabled** - In Jellyfin admin panel, check:
   - Users → middle → "Allow remote access" must be enabled
   - Users → middle → Check user is not disabled
3. **Server-side error** - Check Jellyfin server logs for authentication errors
4. **Rate limiting** - Anti-brute-force protection may be active

**To diagnose**:

1. Verify credentials work in Jellyfin web UI: <https://media.nikolay-eremeev.com>
2. Check Jellyfin admin panel user settings
3. Review Jellyfin server logs during authentication attempt

### Connection Refused

If tests can't reach the server:

- Verify `JELLYFIN_SERVER_URL` is correct and accessible
- Check network connectivity
- Verify firewall settings

### Certificate Errors (HTTPS)

If you see SSL/TLS errors:

- Use HTTP for local development (set isDevelopment flag)
- Ensure HTTPS certificate is valid for production testing

## Test Design Principles

1. **Real server testing** - Tests run against actual Jellyfin instances
2. **No mocking** - Integration tests validate real API behavior
3. **Serial execution** - Tests run sequentially to avoid rate limiting
4. **Configurable** - Credentials loaded from environment
5. **Informative** - Clear error messages for debugging

## Current Status (as of 2025-11-01)

- ✅ **25/38 tests passing** (66%)
- ✅ **Test infrastructure complete**
- ⚠️ **3 tests intermittently failing due to database concurrency**

**Known Issue - Database Concurrency in Jellyfin**:
The Jellyfin server experiences intermittent `DbUpdateConcurrencyException` errors when processing multiple authentication requests in rapid succession. This is a Jellyfin database issue, not a client bug.

**Error example**:

```
Microsoft.EntityFrameworkCore.DbUpdateConcurrencyException: The database operation was expected to affect 1 row(s), but actually affected 0 row(s)
```

**Workaround**:

- Add delays between authentication attempts (1-2 seconds)
- Restart Jellyfin pod if issue persists: `kubectl rollout restart deployment/jellyfin -n jellyfin`
- Jellyfin's SQLite database has concurrency limitations

**Note**: Playback tests (9 tests) skipped - `PlaybackReporter` not yet implemented.
