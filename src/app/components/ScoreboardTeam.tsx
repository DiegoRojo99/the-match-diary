import React from 'react';
import { Team } from '@prisma/generated/client';
import Image from 'next/image';

interface ScoreboardTeamProps {
  team: Team | null;
}

const ScoreboardTeam: React.FC<ScoreboardTeamProps> = ({ team }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {
        team && team.crest && (
          <Image
            src={team.crest}
            alt={`${team.name} crest`}
            style={{ objectFit: 'cover' }}
            className='w-32 h-32'
            width={128}
            height={128}
          />
        )
      }
      <p>{team?.name}</p>
    </div>
  );
};

export default ScoreboardTeam;