# AI Clinic — RAG pipeline (prototype)
1. Authorized admin ingests synthetic clinic knowledge as overlapping text chunks.
2. OpenAI text-embedding-3-small produces 1536-dimensional embeddings.
3. Postgres stores chunks with clinic_id and source_id; RLS limits authenticated reads.
4. Authenticated request embeds question and calls search_clinic_knowledge (semantic + Portuguese FTS, RRF).
5. The generator receives only retrieved excerpts and returns JSON answer, citations, refused.
6. A fail-closed validator checks citation IDs and requires evidence.

## Security limitations / work remaining
- Caller must supply a user-scoped Supabase client with valid JWT. No service_role for retrieval.
- Ingestion is a library function, not a public endpoint: enforce admin authorization before calling; add admin write policy or privileged audited backend before use.
- Citation ID verification does NOT prove entailment or prevent hallucinations; add claim-level faithfulness evals, adversarial tests and independent verification.
- No production deployment, benchmark, secrets or real patient records.
- Multi-tenant isolation must be verified with real Postgres RLS integration tests.
- Current implementation lacks deduplication and atomic document replacement; avoid repeated ingestion of same source.
