import test from 'node:test';
import assert from 'node:assert/strict';
import {reciprocalRankFusion,prepareEvidence} from '../src/rag.mjs';
import {evaluateRetrieval} from '../src/evals.mjs';
test('hybrid ranking prioritizes overlapping matches',()=>{
 const ranked=reciprocalRankFusion(['a','b'],['b','c']);
 assert.equal(ranked[0].id,'b');
});
test('retrieval rejects rows belonging to another clinic',()=>{
 assert.throws(()=>prepareEvidence([{clinic_id:'clinic-b',source_id:'s',content:'secret'}],'clinic-a'),/cross_tenant_result/);
});
test('retrieval retains source references',()=>{
 assert.deepEqual(prepareEvidence([{clinic_id:'a',source_id:'s1',content:'texto'}],'a'),[{source_id:'s1',content:'texto'}]);
});
test('offline eval computes recall, precision and MRR',()=>{
 const r=evaluateRetrieval([{goldIds:['a','b'],rankedIds:['a','c','b']}],3);
 assert.equal(r.recallAtK,1);assert.equal(r.precisionAtK,2/3);assert.equal(r.mrrAtK,1);
});
test('offline eval rejects empty dataset',()=>assert.throws(()=>evaluateRetrieval([]),/invalid/));