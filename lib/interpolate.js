export function estimateCurve(points, maxPosition = 150) {
  const entries = Object.entries(points)
    .map(([k, v]) => [Number(k), Number(v)])
    .sort((a, b) => a[0] - b[0]);

  const result = {};
  if (!entries.length) return result;

  for (let i = 0; i < entries.length; i++) {
    const [pos, value] = entries[i];
    result[pos] = { value, estimated: false };
  }

  for (let i = 0; i < entries.length - 1; i++) {
    const [startPos, startVal] = entries[i];
    const [endPos, endVal] = entries[i + 1];
    const gap = endPos - startPos;
    if (gap <= 1) continue;

    for (let step = 1; step < gap; step++) {
      const t = step / gap;
      const curved = startVal * Math.pow(endVal / startVal, t);
      result[startPos + step] = { value: Math.round(curved), estimated: true };
    }
  }

  const [firstPos, firstVal] = entries[0];
  for (let p = 1; p < firstPos; p++) {
    const ratio = (firstPos - p + 1) / firstPos;
    result[p] = { value: Math.round(firstVal * (1 + ratio * 0.35)), estimated: true };
  }

  const [lastPos, lastVal] = entries[entries.length - 1];
  for (let p = lastPos + 1; p <= maxPosition; p++) {
    const decay = Math.exp(-(p - lastPos) / 28);
    result[p] = { value: Math.max(1, Math.round(lastVal * decay)), estimated: true };
  }

  return result;
}
