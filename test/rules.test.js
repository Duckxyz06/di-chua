import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { commentAction, consumeLikes, giftRitual } from '../lib/rules.js';
const cfg = JSON.parse(fs.readFileSync(new URL('../config.json', import.meta.url)));
test('comment thường cộng 1; xin xăm có dấu, không dấu và Unicode tổ hợp cộng 2', () => {
  for (const [text, points] of [['Bình an',1],['Tôi xin xăm',2],['XIN XAM',2],['xin xăm'.normalize('NFD'),2]])
    assert.equal(cfg.actions[commentAction(text)].merit, points);
});
test('mỗi 5 tim cộng 5, giữ tim dư giữa các gói', () => {
  const a = consumeLikes(0, 4, 5); assert.deepEqual(a,{mult:0,remainder:4});
  const b = consumeLikes(a.remainder, 8, 5); assert.deepEqual(b,{mult:2,remainder:2});
  assert.equal(cfg.actions.bless.merit * b.mult, 10);
});
test('mọi quà giftMap và repeatCount', () => {
  for (const [giftName,action] of Object.entries(cfg.giftMap)) {
    assert.deepEqual(giftRitual({giftDetails:{giftName,giftType:0},repeatCount:3},cfg),{action,mult:3});
  }
});
test('ngưỡng kim cương quà lạ, cấu trúc v1/v2', () => {
  for (const [diamondCount, action] of [[0,'incense'],[9,'incense'],[10,'lotus'],[99,'lotus'],[100,'dragon']]) {
    for (const data of [{giftName:'Unknown',diamondCount},{giftDetails:{giftName:'Unknown',diamondCount}}])
      assert.equal(giftRitual(data,cfg).action, action);
  }
});
test('streak chỉ chốt repeatEnd true, không tính gói đang chạy hoặc thiếu cờ', () => {
  let points = 0;
  for (const [repeatCount,repeatEnd] of [[1,false],[2,false],[3,undefined],[3,true]]) {
    const result = giftRitual({giftDetails:{giftName:'Rose',giftType:1},repeatCount,repeatEnd},cfg);
    if (result) points += cfg.actions[result.action].merit * result.mult;
  }
  assert.equal(points,3);
});
