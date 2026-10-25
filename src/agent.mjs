import {embed,generateGrounded} from './openai.mjs';
import {prepareEvidence} from './rag.mjs';
import {validateGroundedAnswer} from './grounding.mjs';
export async function answerClinicQuestion({clinicId,question,supabase,apiKey,fetchImpl,model}) {
 if(!clinicId||typeof question!=='string'||question.trim().length<3||question.length>2000)throw new Error('invalid_request');
 if(!supabase?.rpc)throw new Error('missing_database_client');
 const vector=await embed(question,{apiKey,fetchImpl});
 const result=await supabase.rpc('search_clinic_knowledge',{p_clinic_id:clinicId,p_query:question,p_embedding:vector,p_limit:8});
 if(result.error)throw new Error('retrieval_failed');
 const evidence=prepareEvidence(result.data||[],clinicId);
 if(evidence.length===0)return {answer:'Não encontrei informações suficientes para responder.',citations:[],refused:true};
 const generated=await generateGrounded(question,evidence,{apiKey,fetchImpl,model});
 if(generated.refused)return {answer:'Não encontrei informações suficientes para responder.',citations:[],refused:true};
 if(!validateGroundedAnswer(generated,evidence).ok)return {answer:'Não consegui verificar a resposta nas fontes disponíveis.',citations:[],refused:true};
 return generated;
}