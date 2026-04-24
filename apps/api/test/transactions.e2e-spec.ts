/**
 * Full HTTP scenarios (POST order → initial history, PATCH cancel → suggestRefund,
 * tracking token history, PATCH transaction with forbidden body fields) require
 * Postgres, Redis, mailer stubs, and a seeded admin JWT.
 *
 * Run locally when the stack is up:
 *   E2E=1 pnpm --filter @longnhan/api test:e2e -- transactions.e2e-spec
 */
const run = process.env.E2E === '1';

(run ? describe : describe.skip)('Orders & transactions (e2e, opt-in)', () => {
  it.todo('POST /v1/orders then GET status-history shows initial PENDING row');
  it.todo('PATCH cancel without payments → no suggestRefund');
  it.todo('POST payment transaction then PATCH cancel → suggestRefund');
  it.todo('GET status-history via tracking token returns sanitized payload');
  it.todo(
    'PATCH /v1/transactions/:id with extra amount → rejected by API contract',
  );
});
