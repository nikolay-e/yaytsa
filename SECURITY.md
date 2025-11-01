# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

**Please do NOT open public GitHub issues for security vulnerabilities.**

If you discover a security vulnerability in this project, please report it responsibly:

### How to Report

1. **Email**: Send a detailed report to the project maintainer (see repository owner)
2. **Include**:
   - Description of the vulnerability
   - Steps to reproduce the issue
   - Potential impact
   - Suggested fix (if any)
   - Your contact information

### What to Expect

- **Initial Response**: Within 48 hours of your report
- **Status Update**: Within 7 days with our assessment
- **Fix Timeline**: Depends on severity
  - Critical: Within 7 days
  - High: Within 14 days
  - Medium: Within 30 days
  - Low: Next release cycle

### Security Best Practices

When deploying this application:

1. **Never commit secrets** to git
   - Use `.env.example` as a template
   - Keep `.env` files in `.gitignore`
   - Rotate exposed API keys immediately

2. **Always use HTTPS** in production
   - HTTP is only acceptable for localhost development
   - Enable HSTS headers (configured in nginx)

3. **Secure environment variables**
   - Use Kubernetes secrets or similar secret management
   - Never hardcode credentials in Helm values
   - Validate all environment inputs

4. **Keep dependencies updated**
   - Run `npm audit` regularly
   - Update dependencies when security patches are available
   - Monitor security advisories

5. **Rate limiting**
   - Configure rate limiting on authentication endpoints
   - Use a reverse proxy or API gateway for additional protection

6. **Network security**
   - Use network policies in Kubernetes
   - Restrict ingress/egress as needed
   - Enable TLS everywhere

## Security Features

This application implements several security best practices:

- ✅ **Docker Security**: Non-root user, read-only filesystem, minimal base image
- ✅ **CSP Headers**: Content Security Policy to prevent XSS
- ✅ **HSTS**: HTTP Strict Transport Security for HTTPS enforcement
- ✅ **Secure Random**: Cryptographically secure device ID generation
- ✅ **Input Validation**: Environment variable validation in Docker entrypoint
- ✅ **Cache Security**: Sensitive endpoints excluded from service worker cache
- ✅ **Session Management**: sessionStorage with cleanup on logout

## Known Security Considerations

### Dependency Vulnerabilities

Current dependencies have some known vulnerabilities:

- **cookie** (<0.7.0): Out of bounds character vulnerability (Low impact - development only)
- **esbuild** (<=0.24.2): SSRF in development server (Low impact - development only)

These require breaking changes to fix and are marked for the next major version.

### Token Storage

Authentication tokens are stored in `sessionStorage` (cleared on browser close). While this provides reasonable security:

- **Risk**: Vulnerable to XSS if an XSS vulnerability exists elsewhere
- **Mitigation**: Strong CSP headers are in place to prevent XSS
- **Alternative**: Consider migrating to HttpOnly cookies in the future

## Security Updates

Security updates will be released as:

- **Patch releases** (0.1.x) for critical and high severity issues
- **Minor releases** (0.x.0) for security improvements requiring minor breaking changes
- **Major releases** (x.0.0) for security improvements requiring major refactoring

## Acknowledgments

We appreciate responsible disclosure and will acknowledge security researchers who help improve this project's security posture.

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CIS Docker Benchmark](https://www.cisecurity.org/benchmark/docker)
- [Kubernetes Security Best Practices](https://kubernetes.io/docs/concepts/security/security-best-practices/)

---

**Last Updated**: 2025-11-01
