import test from 'node:test';
import assert from 'node:assert/strict';
import {validateGroundedAnswer} from '../src/grounding.mjs';
const sources=[{source_id:'doc-1',content:'Atendimento de segunda a sexta.'}];
test('refuses answer with no evidence',()=>assert.equal(validateGroundedAnswer({answer:'Sim',citations:['doc-1']},[]).ok,false));
test('rejects fabricated citation',()=>assert.equal(validateGroundedAnswer({answer:'Sim',citations:['doc-2']},sources).ok,false));
test('accepts known citation identifiers',()=>assert.equal(validateGroundedAnswer({answer:'Segunda a sexta',citations:['doc-1']},sources).ok,true));