import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
globalThis.WebSocket = require('ws');
const { io } = require('../node_modules/socket.io/client-dist/socket.io.js');
test('server: 9 RPC, realtime, 40 người, âm lượng, giả lập, validation và tài nguyên', async t => {
  const child = spawn(process.execPath,['server.js'],{cwd:new URL('..',import.meta.url),env:{...process.env,PORT:'3187'}});
  let output = ''; child.stdout.on('data', b => output += b);
  t.after(() => child.kill());
  const base='http://127.0.0.1:3187';
  for(let i=0;i<80;i++){try{if((await fetch(base+'/api/state')).ok)break;}catch{} await new Promise(r=>setTimeout(r,50));}
  assert.match(output,/Overlay/);
  const socket=io(base,{transports:['websocket'],reconnection:false}); t.after(()=>socket.close());
  const initial = await Promise.race([once(socket,'state'),new Promise((_,reject)=>setTimeout(()=>reject(new Error('Socket timeout')),5000).unref())]);
  assert.equal(initial[0].merit,0);
  const order=[]; socket.on('state',()=>order.push('state')); socket.on('ritual',()=>order.push('ritual'));
  const post = async(path,body={}) => fetch(base+'/api/'+path,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
  const state = async()=> (await fetch(base+'/api/state')).json();
  const actions=await (await fetch(base+'/api/actions')).json();
  let expected=0;
  for(const [action,info] of Object.entries(actions)){
    const event=once(socket,'ritual');
    assert.equal((await (await post('trigger',{user:'Kiểm thử',action,wish:'Bình an'})).json()).ok,true);
    const [ritual]=await event; assert.equal(ritual.action,action); assert.equal(ritual.gain,info.merit);
    assert.equal(order.at(-2),'state'); expected+=info.merit;
  }
  assert.equal(Object.keys(actions).length,9); assert.equal((await state()).merit,expected);
  for(let i=0;i<45;i++) await post('trigger',{user:'Người '+i,action:'incense'});
  const filled=await state(); assert.equal(filled.devotees.length,40); assert.ok(!filled.devotees.some(p=>p.name==='Người 0'));
  assert.equal(filled.board[0].name,'Kiểm thử');
  await post('audio',{musicVol:5,voiceVol:-1,enabled:true,voice:false});
  const audio=(await state()).audio; assert.equal(audio.musicVol,1); assert.equal(audio.voiceVol,0); assert.equal(audio.voice,false);
  await post('simulate',{on:true}); assert.equal((await state()).simulation,true);
  await new Promise(r=>setTimeout(r,1900)); assert.ok((await state()).merit>filled.merit);
  await post('simulate',{on:false}); assert.equal((await state()).simulation,false);
  assert.equal((await post('connect',{username:''})).status,400);
  assert.equal((await post('config',{})).status,400);
  assert.equal((await (await post('trigger',{action:'toString'})).json()).ok,false);
  for(const page of ['overlay.html?clean=1','control.html','admin.html','js/audio.js','css/motion.css']) assert.equal((await fetch(base+'/'+page)).status,200);
  for(const action of Object.values(actions)) assert.equal((await fetch(base+'/assets/fx/'+action.fx+'.webp')).status,200);
  await post('reset'); assert.equal((await state()).merit,0); assert.equal((await state()).devotees.length,0);
});
