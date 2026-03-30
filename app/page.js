import rawPlaylist from '../data/raw-playlist';
import { estimateCurve } from '../lib/interpolate';
import { groupLatestOneDayRows, summarizeWeeks, sumValues } from '../lib/buildDataset';

const playlistMeta = {
  playlistId: '39yEFHNrv2IzDHxo7XaXi6',
  playlistUrl: 'https://open.spotify.com/playlist/39yEFHNrv2IzDHxo7XaXi6?si=SYdT6hAJR-CJxvKrYlpDBQ&pi=XswuSPC5S56Sq',
  title: 'Playlist Streams Dashboard',
  subtitle: 'Daily one-day stream snapshots by playlist position, with conservative estimates for missing spots.',
};

const formatter = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
const compact = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
const { dates, knownDaily } = groupLatestOneDayRows(rawPlaylist);
const latestDates = dates.slice(-14);
const maxKnownPosition = Math.max(...Object.values(knownDaily).flatMap((obj) => Object.keys(obj).map(Number)));
const maxPosition = Math.max(40, maxKnownPosition);
const series = latestDates.map((date) => ({
  date,
  label: formatter.format(new Date(`${date}T12:00:00Z`)),
  shortLabel: compact.format(new Date(`${date}T12:00:00Z`)),
  spots: estimateCurve(knownDaily[date], maxPosition, rawPlaylist.estimation),
  exactCount: Object.keys(knownDaily[date]).length,
}));
const weekly = summarizeWeeks(latestDates, series);

function num(n) {
  return new Intl.NumberFormat('en-US').format(Math.round(n));
}

export default function Page() {
  const latest = series[series.length - 1];
  const previous = series[series.length - 2] || latest;
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
          <p>Top spots are now estimated more conservatively using flatter extrapolation and the API’s own estimation bands where available.</p>
        </div>
      </section>

      <section className="card section">
        <h2>Week-to-week daily totals</h2>
        <p className="muted">Latest 7-day estimated total: <strong>{num(weekly.latestWeekTotal)}</strong> · Previous 7-day estimated total: <strong>{num(weekly.prevWeekTotal)}</strong> · Delta: <strong>{weekly.delta >= 0 ? '+' : ''}{num(weekly.delta)}</strong></p>
        <div className="mini-grid two-weeks">
          {series.map(({ date, shortLabel, spots, exactCount }) => (
            <div key={date} className="mini-card">
              <div className="mini-date">{shortLabel}</div>
              <div className="mini-stat">Daily total: {num(sumValues(spots))}</div>
              <div className="mini-stat">Exact API spots: {exactCount}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="card section">
        <h2>Every spot by day</h2>
        <p className="muted">Bright cells are exact API values. Muted cells are estimated. Dates include weekday names.</p>
        <div className="table-wrap massive">
          <table>
            <thead>
              <tr>
                <th>Spot</th>
                {series.map(({ date, label }) => <th key={date}>{label}</th>)}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: maxPosition }, (_, i) => i + 1).map((position) => (
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
        <p className="muted">Latest day: {latest.label}. Exact API points are highlighted brighter than estimated values.</p>
        <div className="bars">
          {Array.from({ length: maxPosition }, (_, i) => i + 1).map((position) => {
            const current = latest.spots[position];
            const prev = previous.spots[position] || current;
            const max = latest.spots[1].value;
            const height = Math.max(6, Math.round((current.value / max) * 220));
            const delta = current.value - prev.value;
            return (
              <div key={position} className="bar-col" title={`#${position}: ${num(current.value)} (${current.estimated ? 'estimated' : 'exact'})`}>
                <div className={`bar ${current.estimated ? 'estimated-bar' : 'exact-bar'}`} style={{ height }} />
                <div className={`delta ${delta >= 0 ? 'up' : 'down'}`}>{delta >= 0 ? '+' : ''}{Math.round(delta)}</div>
                <div className="label">{position}</div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
