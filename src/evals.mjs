/** Offline retrieval evals. goldIds: relevant chunk IDs per question; rankedIds: returned chunk IDs. */
export function evaluateRetrieval(cases, k=5) {
  if (!Array.isArray(cases) || cases.length === 0 || !Number.isInteger(k) || k<1) throw new Error('invalid eval dataset');
  const metrics = cases.map(({goldIds,rankedIds})=>{
    if (!Array.isArray(goldIds) || goldIds.length===0 || !Array.isArray(rankedIds)) throw new Error('invalid eval case');
    const gold = new Set(goldIds);
    const hits = rankedIds.slice(0,k).filter((id,i,arr)=>gold.has(id) && arr.indexOf(id)===i).length;
    const rank = rankedIds.slice(0,k).findIndex(id=>gold.has(id));
    return {recall:hits/gold.size,precision:hits/k,reciprocalRank:rank<0?0:1/(rank+1)};
  });
  const mean=key=>metrics.reduce((sum,row)=>sum+row[key],0)/metrics.length;
  return {count:cases.length,k,recallAtK:mean('recall'),precisionAtK:mean('precision'),mrrAtK:mean('reciprocalRank')};
}