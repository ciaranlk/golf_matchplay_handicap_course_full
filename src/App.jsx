import React, { useState, useEffect } from 'react';

const initialState = {
  redName: 'Team Red',
  blueName: 'Team Blue',
  redHcpIndex: 12,
  blueHcpIndex: 10,
  holes: Array(18).fill({ par: '', si: '', redScore: '', blueScore: '' }),
  course: 'Balmore GC – Gents White',
  slopeRating: 125,
  courseRating: 70.4,
};

const siList = [13, 17, 3, 7, 11, 1, 15, 9, 5, 14, 10, 18, 6, 12, 8, 16, 2, 4];
const parList = [4, 3, 4, 5, 4, 4, 3, 5, 4, 4, 4, 3, 4, 4, 5, 3, 5, 4];

const App = () => {
  const [state, setState] = useState(initialState);
  const [shotsGiven, setShotsGiven] = useState([]);
  const [matchResults, setMatchResults] = useState(Array(18).fill('-'));
  const [matchScore, setMatchScore] = useState('All Square');

  // Compute course handicaps and shots given
  useEffect(() => {
    const redCourseHcp = Math.round((state.redHcpIndex * state.slopeRating) / 113);
    const blueCourseHcp = Math.round((state.blueHcpIndex * state.slopeRating) / 113);
    const diff = Math.abs(redCourseHcp - blueCourseHcp);
    const shots = Array(18).fill(0);
    for (let i = 0; i < diff; i++) {
      const holeIndex = siList.indexOf(i + 1);
      if (redCourseHcp > blueCourseHcp) {
        shots[holeIndex] = 1; // red gets shot
      } else {
        shots[holeIndex] = -1; // blue gets shot
      }
    }
    setShotsGiven(shots);
  }, [state.redHcpIndex, state.blueHcpIndex, state.slopeRating]);

  // Update match results and match score
  useEffect(() => {
    const results = [];
    let redHolesWon = 0;
    let blueHolesWon = 0;

    for (let i = 0; i < 18; i++) {
      const r = Number(state.holes[i].redScore);
      const b = Number(state.holes[i].blueScore);
      if (isNaN(r) || isNaN(b)) {
        results.push('-');
        continue;
      }

      const rAdj = r - (shotsGiven[i] === 1 ? 1 : 0);
      const bAdj = b - (shotsGiven[i] === -1 ? 1 : 0);

      if (rAdj < bAdj) {
        redHolesWon++;
        results.push(`${state.redName}`);
      } else if (bAdj < rAdj) {
        blueHolesWon++;
        results.push(`${state.blueName}`);
      } else {
        results.push('Half');
      }

      // Check for matchplay result
      const up = redHolesWon - blueHolesWon;
      const remaining = 17 - i;
      if (Math.abs(up) > remaining) {
        setMatchScore(`${Math.abs(up)}&${remaining + 1}`);
        break;
      } else if (up > 0) {
        setMatchScore(`${state.redName} ${up} Up`);
      } else if (up < 0) {
        setMatchScore(`${state.blueName} ${Math.abs(up)} Up`);
      } else {
        setMatchScore('All Square');
      }
    }
    setMatchResults(results);
  }, [state.holes, shotsGiven]);

  const updateScore = (index, team, value) => {
    const updated = [...state.holes];
    updated[index] = {
      ...updated[index],
      [`${team}Score`]: value,
    };
    setState({ ...state, holes: updated });
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h2>Golf Matchplay Tracker</h2>
      <p><strong>{state.course}</strong></p>

      <div style={{ marginBottom: 10 }}>
        <label>🔴 Team Red: </label>
        <input value={state.redName} onChange={e => setState({ ...state, redName: e.target.value })} style={{ marginRight: 10 }} />
        HCP Index: <input type="number" value={state.redHcpIndex} onChange={e => setState({ ...state, redHcpIndex: Number(e.target.value) })} style={{ width: 50 }} />
      </div>
      <div style={{ marginBottom: 20 }}>
        <label>🔵 Team Blue: </label>
        <input value={state.blueName} onChange={e => setState({ ...state, blueName: e.target.value })} style={{ marginRight: 10 }} />
        HCP Index: <input type="number" value={state.blueHcpIndex} onChange={e => setState({ ...state, blueHcpIndex: Number(e.target.value) })} style={{ width: 50 }} />
      </div>

      <table border="1" cellPadding={5} style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr style={{ background: '#eee' }}>
            <th>Hole</th>
            <th>Par</th>
            <th>SI</th>
            <th style={{ color: 'red' }}>{state.redName}</th>
            <th style={{ color: 'blue' }}>{state.blueName}</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          {state.holes.map((hole, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{parList[i]}</td>
              <td>{siList[i]}</td>
              <td>
                <input
                  type="number"
                  value={hole.redScore}
                  onChange={e => updateScore(i, 'red', e.target.value)}
                  style={{ width: '50px' }}
                />
                {shotsGiven[i] === 1 && <span style={{ color: 'red', fontSize: 12 }}> (-1)</span>}
              </td>
              <td>
                <input
                  type="number"
                  value={hole.blueScore}
                  onChange={e => updateScore(i, 'blue', e.target.value)}
                  style={{ width: '50px' }}
                />
                {shotsGiven[i] === -1 && <span style={{ color: 'blue', fontSize: 12 }}> (-1)</span>}
              </td>
              <td>{matchResults[i]}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 20 }}>
        🏁 <strong>Match Status:</strong> {matchScore}
      </div>
    </div>
  );
};

export default App;
