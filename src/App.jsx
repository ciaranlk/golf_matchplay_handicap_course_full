// src/App.jsx
import React, { useState, useEffect } from 'react';
import './index.css';

function App() {
  const [courseName, setCourseName] = useState("Balmore GC");
  const [holes, setHoles] = useState(Array(18).fill({ par: '', si: '' }));
  const [teamRed, setTeamRed] = useState("Team Red");
  const [teamBlue, setTeamBlue] = useState("Team Blue");
  const [hcpRed, setHcpRed] = useState(12);
  const [hcpBlue, setHcpBlue] = useState(10);
  const [scoresRed, setScoresRed] = useState(Array(18).fill(''));
  const [scoresBlue, setScoresBlue] = useState(Array(18).fill(''));
  const [results, setResults] = useState(Array(18).fill('-'));
  const [matchStatus, setMatchStatus] = useState("All Square");

  // Fetch course data
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`/api/coursefetcher?courseName=${encodeURIComponent(courseName)}`);
        const data = await res.json();
        if (data.holes) {
          setHoles(data.holes);
        }
      } catch (err) {
        console.error("Error fetching course:", err);
      }
    };
    fetchCourse();
  }, [courseName]);

  // Compute shots given
  const shotsGiven = Math.abs(hcpRed - hcpBlue);
  const redGivesShots = hcpRed > hcpBlue;
  const shotHoles = holes
    .slice()
    .sort((a, b) => a.si - b.si)
    .slice(0, shotsGiven)
    .map(h => h.hole);

  const getAdjustedScore = (team, i) => {
    let score = team === 'red' ? parseInt(scoresRed[i]) : parseInt(scoresBlue[i]);
    if (shotHoles.includes(i + 1)) {
      if ((team === 'red' && redGivesShots) || (team === 'blue' && !redGivesShots)) {
        score -= 1;
      }
    }
    return score;
  };

  const updateScore = (team, i, val) => {
    const updated = team === 'red' ? [...scoresRed] : [...scoresBlue];
    updated[i] = val;
    if (team === 'red') setScoresRed(updated);
    else setScoresBlue(updated);
  };

  useEffect(() => {
    const newResults = [];
    let redWins = 0;
    let blueWins = 0;

    for (let i = 0; i < 18; i++) {
      const r = getAdjustedScore('red', i);
      const b = getAdjustedScore('blue', i);

      if (!isNaN(r) && !isNaN(b)) {
        if (r < b) {
          newResults[i] = teamRed;
          redWins++;
        } else if (b < r) {
          newResults[i] = teamBlue;
          blueWins++;
        } else {
          newResults[i] = "Half";
        }
      } else {
        newResults[i] = '-';
      }

      if (Math.abs(redWins - blueWins) > (18 - i - 1)) {
        break; // Match over
      }
    }

    setResults(newResults);

    const lead = redWins - blueWins;
    if (lead === 0) {
      setMatchStatus("All Square");
    } else if (lead > 0) {
      setMatchStatus(`${lead} Up ${teamRed}`);
    } else {
      setMatchStatus(`${-lead} Up ${teamBlue}`);
    }

  }, [scoresRed, scoresBlue, holes]);

  return (
    <div className="app">
      <h1>Golf Matchplay Tracker</h1>
      <p><strong>{courseName}</strong></p>

      <div>
        <label>Course: </label>
        <input value={courseName} onChange={e => setCourseName(e.target.value)} />
      </div>

      <div style={{ marginTop: '10px' }}>
        <label>Team Red: </label>
        <input value={teamRed} onChange={e => setTeamRed(e.target.value)} />
        HCP Index: <input type="number" value={hcpRed} onChange={e => setHcpRed(Number(e.target.value))} />
        <br />
        <label>Team Blue: </label>
        <input value={teamBlue} onChange={e => setTeamBlue(e.target.value)} />
        HCP Index: <input type="number" value={hcpBlue} onChange={e => setHcpBlue(Number(e.target.value))} />
      </div>

      <table>
        <thead>
          <tr>
            <th>Hole</th><th>Par</th><th>SI</th>
            <th style={{ color: 'red' }}>{teamRed}</th>
            <th style={{ color: 'blue' }}>{teamBlue}</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          {holes.map((hole, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{hole.par}</td>
              <td>{hole.si}</td>
              <td>
                <input
                  value={scoresRed[i]}
                  onChange={e => updateScore('red', i, e.target.value)}
                  style={{ width: '40px' }}
                />
              </td>
              <td>
                <input
                  value={scoresBlue[i]}
                  onChange={e => updateScore('blue', i, e.target.value)}
                  style={{ width: '40px' }}
                />
              </td>
              <td>{results[i]}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p>🏁 <strong>Match Status:</strong> {matchStatus}</p>
    </div>
  );
}

export default App;
