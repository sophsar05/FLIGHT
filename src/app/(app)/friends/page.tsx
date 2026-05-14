import { createClient } from '@/lib/supabase/server'

const FRIENDS = [
  ['Maya','Navigation review','78%','Online'],['Jordan','Four forces quiz','64%','Studying'],
  ['Alex','Weather basics','52%','Away'],['Sam','Weather minimums','45%','Offline'],
  ['Riley','Airport signs','41%','Online'],['Noah','Airspace review','38%','Away'],
  ['Ari','Performance charts','36%','Studying'],['Kai','Radio calls','33%','Online'],
  ['Lena','Preflight flow','31%','Offline'],['Owen','Pattern work','28%','Away'],
]

const LEADERS = [
  ['Maya','Navigation boss','2,840','XP','92% accuracy'],
  ['You','Climbing fast','2,630','XP','5 day streak'],
  ['Jordan','Quiz grinder','2,410','XP','18 questions today'],
  ['Alex','Steady builder','2,190','XP','3 day streak'],
]

export default async function FriendsPage() {
  return (
    <section className="page">
      <div className="friends-shell glass">
        <div className="friends-intro">
          <div className="kicker">Study Circle</div>
          <h1>Friends</h1>
          <p className="sub">Keep up with classmates, compare study momentum, and make the rankings personal.</p>
        </div>
        <div className="friends-workspace">
          <aside className="friends-sidebar">
            <div className="friends-section-head">
              <div>
                <div className="kicker">Friends List</div>
                <h3>50 Friends</h3>
                <p className="sub">Scroll here without moving the competition board.</p>
              </div>
            </div>
            <div className="friend-search">
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>
              <span>Search friends...</span>
              <kbd>/</kbd>
            </div>
            <div className="friends-grid">
              {FRIENDS.map(([name, activity, score, status]) => (
                <article key={name} className="friend-card">
                  <div className="friend-avatar">{name.slice(0, 2).toUpperCase()}</div>
                  <div className="friend-copy">
                    <h3>{name}</h3>
                    <p className="sub">{activity}</p>
                  </div>
                  <div className="friend-meta">
                    <b>{score}</b>
                    <span className="friend-status">{status}</span>
                  </div>
                </article>
              ))}
            </div>
          </aside>

          <main className="competition-panel">
            <div className="competition-head">
              <div>
                <div className="kicker">Bragging Rights</div>
                <h3>Weekly Competition</h3>
                <p className="sub">This panel scrolls on its own so browsing the leaderboard does not disturb the friend list.</p>
              </div>
              <button className="btn secondary">Compare Me</button>
            </div>
            <div className="competition-layout">
              <section className="competition-hero">
                <div>
                  <div className="kicker">Your Chase</div>
                  <h2>Take the sunlight badge</h2>
                  <p className="sub">First place is 210 XP away. One perfect quiz and a streak check-in can flip the board.</p>
                </div>
                <div className="competition-stats">
                  <div className="competition-stat"><b>#2</b><span>Your Rank</span></div>
                  <div className="competition-stat"><b>210</b><span>XP Gap</span></div>
                  <div className="competition-stat"><b>5</b><span>Day Streak</span></div>
                </div>
              </section>

              <div className="competition-main">
                <section className="leaderboard">
                  <div className="kicker">Circle Standings</div>
                  {LEADERS.map(([name, tagline, score, unit, detail], i) => (
                    <div key={name} className="leader-row">
                      <div className="rank">{i + 1}</div>
                      <div className="leader-name">
                        <b>{name}</b>
                        <span>{tagline} · {detail}</span>
                      </div>
                      <div className="leader-score">{score}<span>{unit}</span></div>
                    </div>
                  ))}
                </section>

                <section className="challenge-card">
                  <div className="challenge-copy">
                    <b>Four Forces Gauntlet</b>
                    <span>Beat Maya's 92% accuracy this week to take the top badge.</span>
                  </div>
                  <div className="challenge-score">
                    <b>92</b><span>Target</span>
                  </div>
                </section>

                <div className="activity-list">
                  <div className="activity-item"><b>Maya</b> is holding first by 210 XP.</div>
                  <div className="activity-item"><b>You</b> can pass first with one perfect quiz and a streak check-in.</div>
                  <div className="activity-item"><b>Jordan</b> answered 18 questions today and is closing the gap.</div>
                  <div className="activity-item"><b>Alex</b> reclaimed a 3 day streak this morning.</div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </section>
  )
}
