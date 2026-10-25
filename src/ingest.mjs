import {embed} from './openai.mjs';
export function chunkText(text,{maxChars=1000,overlap=150}={}) {
 if(typeof text!=='string'||!text.trim()||maxChars<100||overlap<0||overlap>=maxChars)throw Error('invalid_chunk_config');
 const chunks=[];for(let start=0;start<text.length;start+=maxChars-overlap){chunks.push(text.slice(start,start+maxChars));if(start+maxChars>=text.length)break;}return chunks;
}
export async function ingestDocument({clinicId,sourceId,text,supabase,apiKey,fetchImpl}) {
 const chunks=chunkText(text);for(const content of chunks){const embedding=await embed(content,{apiKey,fetchImpl});const result=await supabase.from('knowledge_chunks').insert({clinic_id:clinicId,source_id:sourceId,content,embedding});if(result.error)throw Error('ingestion_failed');}return {chunksInserted:chunks.length};
}
