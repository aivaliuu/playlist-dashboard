import { knownDaily, latestDates, playlistMeta } from '../data/playlistData';
import { estimateCurve } from '../lib/interpolate';

const series = latestDates.map((date) => ({
  date,
  spots: estimateCurve(knownDaily[date], 150),
}));

const focusPositions = [5, 17, 22, 38, 40, 43, 59, 80, 97, 101, 102, 117, 138, 144];

function num(n) {
  return new Intl.NumberFormat('en-US').format(n);
}

export default function Page() {
  const latest = series[series.length - 1];
  const previous = series[series.length - 2];

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
          <strong>Method</strong>
          <p>Solid values are exact API points. Gaps are smooth curve estimates between known positions to make daily spot performance easier to read.</p>
        </div>
      </section>

      <section className="card section">
        <h2>Last 7 days at a glance</h2>
        <div className="mini-grid">
          {series.map(({ date, spots }) => (
            <div key={date} className="mini-card">
              <div className="mini-date">{date}</div>
              <div className="mini-stat">#{focusPositions[0]}: {num(spots[5].value)}</div>
              <div className="mini-stat">#{17}: {num(spots[17].value)}</div>
              <div className="mini-stat">#{38}: {num(spots[38].value)}</div>
              <div className="mini-stat">#{101}: {num(spots[101].value)}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="card section">
        <h2>Key positions by day</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Position</th>
                {latestDates.map((date) => <th key={date}>{date.slice(5)}</th>)}
              </tr>
            </thead>
            <tbody>
              {focusPositions.map((position) => (
                <tr key={position}>
                  <td>#{position}</td>
                  {series.map(({ date, spots }) => {
                    const item = spots[position];
                    return (
                      <td key={date + position} className={item.estimated ? 'estimated' : 'exact'}>
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
        <h2>Latest curve: every spot</h2>
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
