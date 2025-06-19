import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Users, Star } from "lucide-react";
import { Course } from "@/lib/types";
import type { Player, Team } from "@shared/schema";

interface TeamLeaderboardProps {
  course: Course;
  players: Player[];
  teams: Team[];
  scores: { [playerId: number]: { [hole: number]: number } };
}

export default function TeamLeaderboard({ course, players, teams, scores }: TeamLeaderboardProps) {
  const calculateTeamStats = (teamId: number) => {
    const teamPlayers = players.filter(player => player.teamId === teamId);
    if (teamPlayers.length === 0) return { totalScore: 0, toPar: 0, playersCompleted: 0, avgScore: 0 };

    let totalScore = 0;
    let totalHoles = 0;
    let playersWithScores = 0;

    teamPlayers.forEach(player => {
      const playerScores = scores[player.id] || {};
      const completedScores = Object.values(playerScores).filter(score => score && score > 0);
      
      if (completedScores.length > 0) {
        totalScore += completedScores.reduce((sum, score) => sum + score, 0);
        totalHoles += completedScores.length;
        playersWithScores++;
      }
    });

    if (totalHoles === 0) return { totalScore: 0, toPar: 0, playersCompleted: 0, avgScore: 0 };

    const avgHolesPerPlayer = totalHoles / playersWithScores;
    const parForCompletedHoles = Math.floor(avgHolesPerPlayer) * course.par / 18;
    const toPar = totalScore - (parForCompletedHoles * playersWithScores);
    const avgScore = totalScore / totalHoles;

    return {
      totalScore,
      toPar: Math.round(toPar),
      playersCompleted: playersWithScores,
      avgScore: avgScore.toFixed(1)
    };
  };

  const teamLeaderboard = teams.map(team => ({
    ...team,
    ...calculateTeamStats(team.id),
    playerCount: players.filter(p => p.teamId === team.id).length,
    captain: players.find(p => p.id === team.captainId)
  })).sort((a, b) => {
    // Sort by players completed first, then by total score
    if (a.playersCompleted === 0 && b.playersCompleted === 0) return 0;
    if (a.playersCompleted === 0) return 1;
    if (b.playersCompleted === 0) return -1;
    
    if (a.playersCompleted === b.playersCompleted) {
      return a.totalScore - b.totalScore;
    }
    
    return b.playersCompleted - a.playersCompleted;
  });

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2: return <Medal className="h-6 w-6 text-gray-400" />;
      case 3: return <Award className="h-6 w-6 text-yellow-600" />;
      default: return <Users className="h-6 w-6 text-gray-400" />;
    }
  };

  const getPositionText = (position: number): string => {
    switch (position) {
      case 1: return '1st';
      case 2: return '2nd';
      case 3: return '3rd';
      default: return `${position}th`;
    }
  };

  if (teams.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span>Team Leaderboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Create teams to see the team leaderboard!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <span>Team Leaderboard</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {teamLeaderboard.map((team, index) => {
            const position = index + 1;
            const toPar = team.toPar > 0 ? `+${team.toPar}` : team.toPar.toString();
            
            return (
              <div 
                key={team.id} 
                className={`flex items-center justify-between p-4 rounded-lg ${
                  position === 1 ? 'golf-light text-white' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-4">
                  {getPositionIcon(position)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`font-bold text-lg ${position === 1 ? 'text-white' : 'text-gray-900'}`}>
                        {getPositionText(position)} - {team.name}
                      </span>
                      {team.captainId && (
                        <Star className={`h-4 w-4 ${position === 1 ? 'text-yellow-300' : 'text-golf-gold'}`} />
                      )}
                      <Badge 
                        variant="outline" 
                        className={`${position === 1 ? 'border-white text-white' : 'border-golf-green text-golf-green'}`}
                      >
                        {team.playerCount} players
                      </Badge>
                    </div>
                    <div className={`text-sm ${position === 1 ? 'text-white opacity-90' : 'text-gray-600'}`}>
                      {team.playersCompleted > 0 ? (
                        <div className="space-y-1">
                          <p>{team.totalScore} total strokes ({team.toPar === 0 ? 'Even' : toPar})</p>
                          <p>{team.playersCompleted}/{team.playerCount} players active</p>
                          {team.captain && (
                            <p>Captain: {team.captain.firstName} {team.captain.lastName}</p>
                          )}
                        </div>
                      ) : (
                        <p>No scores recorded yet</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {team.playersCompleted > 0 && (
                    <div>
                      <div className={`text-2xl font-bold ${position === 1 ? 'text-white' : 'text-gray-900'}`}>
                        {team.toPar === 0 ? 'E' : toPar}
                      </div>
                      <div className={`text-xs ${position === 1 ? 'text-white opacity-75' : 'text-gray-500'}`}>
                        Avg: {team.avgScore}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {teamLeaderboard.some(team => team.totalScore > 0) && (
          <div className="mt-6 pt-4 border-t">
            <h4 className="font-medium text-gray-700 mb-3">Team Statistics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-white p-3 rounded border">
                <span className="font-medium text-gray-700 block">Best Team Score:</span>
                <span className="text-golf-green font-bold">
                  {Math.min(...teamLeaderboard.filter(t => t.totalScore > 0).map(t => t.totalScore)) || 'N/A'}
                </span>
              </div>
              <div className="bg-white p-3 rounded border">
                <span className="font-medium text-gray-700 block">Most Active:</span>
                <span className="text-golf-green font-bold">
                  {teamLeaderboard.reduce((prev, curr) => 
                    prev.playersCompleted > curr.playersCompleted ? prev : curr
                  ).name}
                </span>
              </div>
              <div className="bg-white p-3 rounded border">
                <span className="font-medium text-gray-700 block">Teams Playing:</span>
                <span className="text-golf-green font-bold">
                  {teamLeaderboard.filter(t => t.playersCompleted > 0).length}/{teamLeaderboard.length}
                </span>
              </div>
              <div className="bg-white p-3 rounded border">
                <span className="font-medium text-gray-700 block">Total Players:</span>
                <span className="text-golf-green font-bold">
                  {teamLeaderboard.reduce((sum, team) => sum + team.playerCount, 0)}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}