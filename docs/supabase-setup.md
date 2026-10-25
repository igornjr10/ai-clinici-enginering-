# Dedicated Supabase environment — setup
1. Create a **new** Supabase project called ai-clinic-dev. Do not reuse VISION or renda-os.
2. Apply SQL migrations in order: 001_initial.sql then 002_hybrid_retrieval.sql. Confirm pgvector extension is available.
3. Enable email/password Auth for synthetic test users. Create clinic A and clinic B, memberships and synthetic chunks.
4. Ensure both users have memberships **only in their respective clinic**.
5. Set SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY and TEST_CLINIC_A_ID, TEST_CLINIC_B_ID, TEST_USER_A_EMAIL, TEST_USER_A_PASSWORD, TEST_USER_B_EMAIL, TEST_USER_B_PASSWORD in your local environment. Never commit these credentials.
6. Run npm install, then node --test tests/integration/*.test.mjs.
7. Expected: clinic A user can see A chunks but never B; vice versa; cross-clinic RPC returns [].
8. Audit RLS and exposed schema privileges before production.

## Important
- The integration test skips automatically without configured credentials. A skipped test is NOT a pass.
- The existing ingestion helper requires a secure admin-authorized write path, which is not implemented yet.
- Do not upload actual patient information.
