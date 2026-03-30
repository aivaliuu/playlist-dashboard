import { knownDaily, latestDates, playlistMeta } from '../data/playlistData';
import { estimateCurve } from '../lib/interpolate';

const formatter = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

const series = latestDates.map((date) => ({
  date,
  label: formatter.format(new Date(`${date}T12:00:00Z`)),
  spots: estimateCurve(knownDaily[date], 150),
  exactCount: Object.keys(knownDaily[date]).length,
}));

function num(n) {
  return new Intl.NumberFormat('en-US').format(n);
}

function sumValues(spots) {
  return Object.values(spots).reduce((sum, item) => sum + item.value, 0);
}

export default function Page() {
  const latest = series[series.length - 1];
  const previous = series[series.length - 2];
  const totalEstimatedStreams = sumValues(latest.spots);

  return (
    <main className="page">
      <section className="hero card">
        <div>
          <div className="eyebrow">Spotify playlist diagnostics</div>
          <h1>{playlistMeta.title}</h1>
          <p className="lead">{playlistMeta.subtitle}</p>
          <a className="link" href={playlistMeta.playlistUrl}>Open playlist</a>
        </div>
        <div className="hero-note">
          <div className="estimate-label">Estimated total streams</div>
          <div className="estimate-total">{num(totalEstimatedStreams)}</div>
          <p>Calculated from the latest day’s exact points plus curve-fitted estimates for missing positions.</p>
        </div>
      </section>

      <section className="card section">
        <h2>Last 7 days at a glance</h2>
        <div className="mini-grid">
          {series.map(({ date, label, spots, exactCount }) => (
            <div key={date} className="mini-card">
              <div className="mini-date">{label}</div>
              <div className="mini-stat">Estimated total: {num(sumValues(spots))}</div>
              <div className="mini-stat">Exact API spots: {exactCount}</div>
              <div className="mini-stat">Top visible spot: #{Object.keys(knownDaily[date]).map(Number).sort((a,b)=>a-b)[0]}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="card section">
        <h2>Every spot by day</h2>
        <p className="muted">Bright cells are exact API values. Muted cells are estimated values used to complete the curve.</p>
        <div className="table-wrap massive">
          <table>
            <thead>
              <tr>
                <th>Spot</th>
                {series.map(({ date, label }) => <th key={date}>{label}</th>)}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 150 }, (_, i) => i + 1).map((position) => (
                <tr key={position}>
                  <td>#{position}</td>
                  {series.map(({ date, spots }) => {
                    const item = spots[position];
                    return (
                      <td key={`${date}-${position}`} className={item.estimated ? 'estimated' : 'exact'}>
                        {num(item.value)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card section">
        <h2>Latest daily curve by spot</h2>
        <p className="muted">Latest day: {latest.label}. Exact API points are highlighted brighter than estimated in-between values.</p>
        <div className="bars">
          {Array.from({ length: 150 }, (_, i) => i + 1).map((position) => {
            const current = latest.spots[position];
            const prev = previous.spots[position];
            const max = latest.spots[1].value;
            const height = Math.max(6, Math.round((current.value / max) * 220));
            const delta = current.value - prev.value;
            return (
              <div key={position} className="bar-col" title={`#${position}: ${num(current.value)} (${current.estimated ? 'estimated' : 'exact'})`}>
                <div className={`bar ${current.estimated ? 'estimated-bar' : 'exact-bar'}`} style={{ height }} />
                <div className={`delta ${delta >= 0 ? 'up' : 'down'}`}>{delta >= 0 ? '+' : ''}{delta}</div>
                <div className="label">{position}</div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
