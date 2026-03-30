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

export function summarizeWeeks(dates, series) {
  const totals = dates.map((date, i) => ({ date, total: sumValues(series[i].spots) }));
  const latest7 = totals.slice(-7);
  const prev7 = totals.slice(-14, -7);
  const latestWeekTotal = latest7.reduce((a, b) => a + b.total, 0);
  const prevWeekTotal = prev7.reduce((a, b) => a + b.total, 0);
  return { latest7, prev7, latestWeekTotal, prevWeekTotal, delta: latestWeekTotal - prevWeekTotal };
}

export function sumValues(spots) {
  return Object.values(spots).reduce((sum, item) => sum + item.value, 0);
}
