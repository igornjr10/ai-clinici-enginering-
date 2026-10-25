/** Deterministic hybrid ranking for candidate documents returned by a tenant-scoped database query. */
export function reciprocalRankFusion(vectorIds, lexicalIds, {k=60, limit=8}={}) {
  if (!Number.isInteger(k) || k < 1 || !Number.isInteger(limit) || limit < 1) throw new Error('invalid ranking parameters');
  const scores = new Map();
  for (const ids of [vectorIds, lexicalIds]) {
    const seen = new Set();
    ids.forEach((id, index) => {
      if (typeof id !== 'string' || seen.has(id)) return;
      seen.add(id);
      scores.set(id, (scores.get(id) ?? 0) + 1/(k+index+1));
    });
  }
  return [...scores].sort((a,b)=>b[1]-a[1] || a[0].localeCompare(b[0])).slice(0,limit).map(([id,score])=>({id,score}));
}
export function prepareEvidence(rows, clinicId) {
  if (!clinicId || !Array.isArray(rows)) throw new Error('invalid retrieval response');
  return rows.map(row=>{
    if (row.clinic_id !== clinicId) throw new Error('cross_tenant_result');
    if (!row.source_id || !row.content) throw new Error('invalid_source');
    return {source_id:row.source_id, content:row.content};
  });
}