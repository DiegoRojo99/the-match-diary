'use client';

import { useEffect, useState } from 'react';
import { Team, Competition } from '@prisma/generated/client';
import ScoreboardTeam from '../components/ScoreboardTeam';
import CompetitionDropdown from './CompetitionDropdown';
import { format } from 'date-fns';

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
        console.error('Error fetching teams:', error);
        return [];
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
      if (teams.find((team: Team) => team.name?.toLowerCase() === name.toLowerCase())) {
        // If the exact name is found, set it as the selected team
        const selectedTeam = teams.find((team: Team) => team.name?.toLowerCase() === name.toLowerCase());
        if (home) { setHomeTeam(selectedTeam); } 
        else { setAwayTeam(selectedTeam); }
        return;
      }

      // If multiple teams are found, prompt the user to select one
      let teamNames: string[] = teams.map((team: Team) => team.name || '');
      while (teamNames.length > 1) {
        const selectedTeamName = prompt(`Multiple teams found: ${teamNames.join(', ')}. Please enter the exact name of the team you want to select:`);
        if (!selectedTeamName) {
          alert('No team selected.');
          return;
        }

        // Find the selected team based on the name entered by the user
        const filteredTeams = teams.filter((team: Team) => 
          team.name && team.name.toLowerCase().includes(selectedTeamName?.toLowerCase() || '')
        );

        const exactTeam = teams.find((team: Team) =>
          team.name && team.name.toLowerCase() === selectedTeamName?.toLowerCase()
        );
        if (exactTeam) {
          if (home) { setHomeTeam(exactTeam); } 
          else { setAwayTeam(exactTeam); }
          break;
        }  
        else if (filteredTeams.length === 1) {
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

  async function submitMatchVisit() {
    if(!selectedCompetition || !matchDate || !homeTeam || !awayTeam) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      const response = await fetch('/api/matchVisit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          selectedCompetition,
          matchDate,
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
          // homeScore: 0,
          // awayScore: 0,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Request failed: ${text}`);
      }

      alert('Match visit created successfully!');
      setTimeout(() => {
        window.location.href = '/visits';
      }, 500);
    } 
    catch (error) {
      console.error('Error submitting match visit:', error);
      if (error instanceof Error) {
        console.error('Error message submitting match visit:', error.message);
        alert(`Failed to create match visit: ${error.message}`);
      } 
      else {
        console.error('Error submitting match visit:', error);
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
    <div className="w-[90vw] sm:max-w-xl p-4 bg-white shadow-md rounded-lg h-fit mx-auto my-4 sm:my-auto">
      <h2 className="text-xl font-bold my-4">Add Match Visit</h2>

      {/* League dropdown */}
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium">Competition</label>
        <CompetitionDropdown competitions={competitions} onSelect={(comp) => {
          setSelectedCompetition(comp.id);
        }} />
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

      {/* Submit button */}
      <button
        onClick={() => submitMatchVisit()}
        disabled={!selectedCompetition || !matchDate || !homeTeam || !awayTeam}
        className="w-full bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition cursor-pointer"
      >
        Add Visit
      </button>

    </div>
  );
}
