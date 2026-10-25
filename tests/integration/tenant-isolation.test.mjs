import test from 'node:test';
import assert from 'node:assert/strict';
import {createClient} from '@supabase/supabase-js';
const url=process.env.SUPABASE_URL, key=process.env.SUPABASE_PUBLISHABLE_KEY;
const required=['TEST_CLINIC_A_ID','TEST_CLINIC_B_ID','TEST_USER_A_EMAIL','TEST_USER_A_PASSWORD','TEST_USER_B_EMAIL','TEST_USER_B_PASSWORD'];
const configured=Boolean(url&&key&&required.every(x=>process.env[x]));
test('RLS: clinic A cannot retrieve clinic B documents', {skip:!configured},async()=>{
 const a=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 const b=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 const loginA=await a.auth.signInWithPassword({email:process.env.TEST_USER_A_EMAIL,password:process.env.TEST_USER_A_PASSWORD});
 const loginB=await b.auth.signInWithPassword({email:process.env.TEST_USER_B_EMAIL,password:process.env.TEST_USER_B_PASSWORD});
 assert.ifError(loginA.error);assert.ifError(loginB.error);
 const [own,foreign,reverse]=await Promise.all([
  a.from('knowledge_chunks').select('id,clinic_id').eq('clinic_id',process.env.TEST_CLINIC_A_ID),
  a.from('knowledge_chunks').select('id,clinic_id').eq('clinic_id',process.env.TEST_CLINIC_B_ID),
  b.from('knowledge_chunks').select('id,clinic_id').eq('clinic_id',process.env.TEST_CLINIC_A_ID)
 ]);
 assert.ifError(own.error);assert.ifError(foreign.error);assert.ifError(reverse.error);
 assert.ok(own.data.length>0,'Seed at least one chunk in clinic A before running this test');
 assert.deepEqual(foreign.data,[]);assert.deepEqual(reverse.data,[]);
 const rpc=await a.rpc('search_clinic_knowledge',{p_clinic_id:process.env.TEST_CLINIC_B_ID,p_query:'horário',p_embedding:Array(1536).fill(0),p_limit:8});
 assert.ifError(rpc.error);assert.deepEqual(rpc.data,[]);
});
