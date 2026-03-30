export function groupLatestOneDayRows(raw) {
  const points = Array.isArray(raw?.datapoints) ? raw.datapoints : [];
  const oneDay = points.filter((row) => row.period === '1day' && row.position != null);
  const byDate = new Map();
  for (const row of oneDay) {
    const date = row.collected_date;
    if (!byDate.has(date)) byDate.set(date, new Map());
    const bucket = byDate.get(date);
    const pos = Number(row.position);
    const current = bucket.get(pos);
    const val = Number(row.streams || 0);
    if (!current || val > current) bucket.set(pos, val);
  }
  const dates = Array.from(byDate.keys()).sort();
  return {
    dates,
    knownDaily: Object.fromEntries(
      dates.map((date) => [date, Object.fromEntries(Array.from(byDate.get(date).entries()).sort((a,b)=>a[0]-b[0]))])
    ),
  };
}

export function summarizeWeeks(dates, series, weeks = 10) {
  const totals = dates.map((date, i) => ({ date, total: sumValues(series[i].spots) }));
  const buckets = [];
  for (let end = totals.length; end > 0 && buckets.length < weeks; end -= 7) {
    const start = Math.max(0, end - 7);
    const slice = totals.slice(start, end);
    if (!slice.length) continue;
    const avg = slice.reduce((a, b) => a + b.total, 0) / slice.length;
    buckets.push({
      start: slice[0].date,
      end: slice[slice.length - 1].date,
      average: avg,
      days: slice.length,
      items: slice,
    });
  }
  return buckets.reverse();
}

export function sumValues(spots) {
  return Object.values(spots).reduce((sum, item) => sum + item.value, 0);
}
