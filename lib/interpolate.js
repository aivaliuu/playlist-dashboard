export function estimateCurve(points, maxPosition = 40, apiEstimation = null) {
  const entries = Object.entries(points)
    .map(([k, v]) => [Number(k), Number(v)])
    .sort((a, b) => a[0] - b[0]);

  const result = {};
  if (!entries.length) return result;

  for (const [pos, value] of entries) {
    result[pos] = { value, estimated: false };
  }

  for (let i = 0; i < entries.length - 1; i++) {
    const [startPos, startVal] = entries[i];
    const [endPos, endVal] = entries[i + 1];
    const gap = endPos - startPos;
    if (gap <= 1) continue;
    for (let step = 1; step < gap; step++) {
      const t = step / gap;
      const curved = startVal + (endVal - startVal) * t;
      result[startPos + step] = { value: Math.round(curved), estimated: true };
    }
  }

  const [firstPos, firstVal] = entries[0];
  for (let p = 1; p < firstPos; p++) {
    let target = firstVal;
    if (apiEstimation) {
      if (p === 1 && apiEstimation['1']) target = apiEstimation['1'];
      else if (p >= 2 && p <= 10 && apiEstimation['2-10']) target = apiEstimation['2-10'];
    }
    const ceiling = Math.min(target || firstVal, Math.round(firstVal * 1.12));
    const blend = firstVal + (ceiling - firstVal) * ((firstPos - p) / Math.max(1, firstPos - 1));
    result[p] = { value: Math.round(blend), estimated: true };
  }

  const [lastPos, lastVal] = entries[entries.length - 1];
  for (let p = lastPos + 1; p <= maxPosition; p++) {
    let anchor = lastVal;
    if (apiEstimation) {
      if (p <= 10 && apiEstimation['2-10']) anchor = apiEstimation['2-10'];
      else if (p <= 20 && apiEstimation['11-20']) anchor = apiEstimation['11-20'];
      else if (p <= 50 && apiEstimation['21-50']) anchor = apiEstimation['21-50'];
      else if (apiEstimation['50+']) anchor = apiEstimation['50+'];
    }
    const decay = Math.exp(-(p - lastPos) / 10);
    const value = Math.min(anchor, Math.round(lastVal * decay + anchor * (1 - decay)));
    result[p] = { value: Math.max(1, value), estimated: true };
  }

  return result;
}
