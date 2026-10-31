// Pure rules shared by the TikTok adapter and regression tests.
export const commentAction = text => /xin\s*x[aă]m/iu.test(String(text).normalize('NFC')) ? 'fortune' : 'incense';
export function consumeLikes(previous, count, threshold) {
  const total = previous + Math.max(0, Number(count) || 0);
  return { mult: Math.floor(total / threshold), remainder: total % threshold };
}
export function giftRitual(data, cfg) {
  const gift = data.giftDetails || data;
  if (Number(gift.giftType ?? data.giftType) === 1 && data.repeatEnd !== true) return null;
  const diamonds = Number(gift.diamondCount ?? data.diamondCount) || 0;
  const name = gift.giftName ?? data.giftName;
  const action = Object.hasOwn(cfg.giftMap, name) ? cfg.giftMap[name] :
    diamonds >= cfg.unknownGift.dragonMinDiamonds ? 'dragon' :
    diamonds >= cfg.unknownGift.lotusMinDiamonds ? 'lotus' : cfg.unknownGift.else;
  return { action, mult: Math.max(1, Math.floor(Number(data.repeatCount) || 1)) };
}
