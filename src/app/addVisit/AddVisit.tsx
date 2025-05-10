'use client';

import { useEffect, useState } from 'react';
import { Team, Competition } from '../../../prisma/generated/client';
import ScoreboardTeam from '../components/ScoreboardTeam';

function format(date: Date, formatString: string) {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };
  const parts = new Intl.DateTimeFormat('en-US', options).formatToParts(date);
  const year = parts.find(part => part.type === 'year')?.value;
  const month = parts.find(part => part.type === 'month')?.value;
  const day = parts.find(part => part.type === 'day')?.value;
  return formatString
    .replace('yyyy', year || '')
    .replace('MM', month || '')
    .replace('dd', day || '');
}

export default function AddVisit() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<string>('');
  const [matchDate, setMatchDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [homeTeam, setHomeTeam] = useState<Team | null>(null);
  const [awayTeam, setAwayTeam] = useState<Team | null>(null);

  async function searchTeam(name: string, home: boolean) {
    const teams = await fetch(`/api/teams/search?name=${name}`)
      .then((res) => res.json())
      .then((data) => {
        return data;
      })
      .catch((error) => {
        return []
      });
    
    // Check if teams are found
    if(!teams?.length) {      
        alert('No matching team found.');
        return;
    }
    else if(teams.length === 1) {
      // If only one team is found, set it as the selected team
      const selectedTeam = teams[0];
      if (home) { setHomeTeam(selectedTeam); } 
      else { setAwayTeam(selectedTeam); }
    }
    else {
      // If multiple teams are found, prompt the user to select one
      let teamNames: string[] = teams.map((team: Team) => team.name || '');
      while (teamNames.length > 1) {
        const selectedTeamName = prompt(`Multiple teams found: ${teamNames.join(', ')}. Please enter the exact name of the team you want to select:`);

        // Find the selected team based on the name entered by the user
        const filteredTeams = teams.filter((team: Team) => 
          team.name && team.name.toLowerCase().includes(selectedTeamName?.toLowerCase() || '')
        );
  
        if (filteredTeams.length === 1) {
          const selectedTeam = filteredTeams[0];
          if (home) { setHomeTeam(selectedTeam); } 
          else { setAwayTeam(selectedTeam); }
          break;
        } 
        else if (filteredTeams.length === 0) {
          alert('No matching team found.');
        }
        else {
          // Update the team names to show the filtered teams
          teamNames = filteredTeams.map((team: Team) => team.name || '');
        }
      }
    }
  }

  useEffect(() => {
    const fetchCompetitions = async () => {
      const res = await fetch('/api/competitions');
      const data = await res.json();
      setCompetitions(data);
    };
    fetchCompetitions();
  }, []);

  return (
    <div className="max-w-xl mx-auto p-4 mt-10 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold my-4">Add Match Visit</h2>

      {/* League dropdown */}
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium">Competition</label>
        <select
          value={selectedCompetition}
          onChange={(e) => setSelectedCompetition(e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">Select competition</option>
          {competitions.map((comp) => (
            <option key={comp.id} value={comp.id}>
              {comp.name}
            </option>
          ))}
        </select>
      </div>

      {/* Date input */}
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium">Match Date</label>
        <input
          type="date"
          value={matchDate}
          onChange={(e) => setMatchDate(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      {/* Scorecard look */}
      <div className="flex justify-center items-center space-x-4 mb-6">
        <div
            className="w-48 h-42 border rounded-lg flex items-center justify-center bg-gray-50 cursor-pointer hover:bg-gray-100"
            onClick={() => {
              const name = prompt(`Enter home team name:`);
              if(!name) return;
              searchTeam(name, true);
            }}
          >
            <ScoreboardTeam team={homeTeam} />
          </div>
          <span className="text-2xl font-bold">-</span>
          <div
            className="w-48 h-42 border rounded-lg flex items-center justify-center bg-gray-50 cursor-pointer hover:bg-gray-100"
            onClick={() => {
              const name = prompt(`Enter away team name:`);
              if(!name) return;
              searchTeam(name, false);
            }}
          >
            <span className="text-center text-sm text-gray-700">
              <ScoreboardTeam team={awayTeam} />
            </span>
          </div>
      </div>

    </div>
  );
}
