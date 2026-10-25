import test from 'node:test';import assert from 'node:assert/strict';
import {answerClinicQuestion} from '../src/agent.mjs';
import {chunkText} from '../src/ingest.mjs';
const embedding=Array(1536).fill(0.1);
function mockFetch(url){
 if(url.endsWith('/embeddings'))return Promise.resolve({ok:true,json:async()=>({data:[{embedding}]})});
 return Promise.resolve({ok:true,json:async()=>({choices:[{message:{content:JSON.stringify({answer:'Atende de segunda a sexta.',citations:['doc-1'],refused:false})}}]})});
}
const args={clinicId:'clinic-a',question:'Qual horário de atendimento?',apiKey:'test-key',fetchImpl:mockFetch};
test('returns sourced response',async()=>{
 const supabase={rpc:async()=>({data:[{clinic_id:'clinic-a',source_id:'doc-1',content:'Atende de segunda a sexta.'}],error:null})};
 const result=await answerClinicQuestion({...args,supabase});assert.equal(result.refused,false);assert.deepEqual(result.citations,['doc-1']);
});
test('refuses when no evidence found',async()=>{
 const supabase={rpc:async()=>({data:[],error:null})};
 assert.equal((await answerClinicQuestion({...args,supabase})).refused,true);
});
test('rejects cross tenant retrieval',async()=>{
 const supabase={rpc:async()=>({data:[{clinic_id:'clinic-b',source_id:'doc-1',content:'segredo'}],error:null})};
 await assert.rejects(answerClinicQuestion({...args,supabase}),/cross_tenant_result/);
});
test('splits content with bounded overlap',()=>{const chunks=chunkText('a'.repeat(250),{maxChars:120,overlap:20});assert.equal(chunks.length,3);assert.equal(chunks[1].length,120);});
