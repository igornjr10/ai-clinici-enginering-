/** Fail closed when retrieved evidence is missing. Model-generated citations must be validated against supplied sources. */
export function validateGroundedAnswer({answer, citations}, sources) {
  if (!Array.isArray(sources) || sources.length === 0) return {ok:false, reason:'no_evidence'};
  if (typeof answer !== 'string' || !answer.trim()) return {ok:false, reason:'empty_answer'};
  if (!Array.isArray(citations) || citations.length === 0) return {ok:false, reason:'missing_citations'};
  const ids = new Set(sources.map(s=>s.source_id));
  if (!citations.every(c=>typeof c === 'string' && ids.has(c))) return {ok:false, reason:'invalid_citation'};
  return {ok:true};
}