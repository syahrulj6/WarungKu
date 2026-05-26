Release checklist

- [ ] Bump version in package.json
- [ ] Ensure `AUTH_SECRET` is set in production
- [ ] Run `npm run build` and smoke test
- [ ] Run DB migrations (`npm run db:migrate`)
- [ ] Run `npm run db:backup` before migration
- [ ] Verify email sending (resend test email)
- [ ] Run end-to-end tests
- [ ] Update changelog
- [ ] Tag release
