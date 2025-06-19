import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, Award, User, TrendingUp, BarChart3, Calculator } from "lucide-react";
import type { Player, Team, Round, Score } from "@shared/schema";
import { courses } from "@/lib/courseData";

interface CumulativeLeaderboardProps {
  players: Player[];
  teams: Team[];
  rounds: Round[];
  scores: Score[];
}

interface PlayerStats {
  playerId: number;
  name: string;
  totalStrokes: number;
  totalPar: number;
  toPar: number;
  roundsPlayed: number;
  averageScore: number;
  bestRound: number | null;
  stablefordPoints: number;
  team?: Team;
}

interface TeamStats {
  team: Team;
  totalStrokes: number;
  totalPar: number;
  toPar: number;
  playersCount: number;
  averageScore: number;
  roundsPlayed: number;
}

export default function CumulativeLeaderboard({ players, teams, rounds, scores }: CumulativeLeaderboardProps) {
  const [viewMode, setViewMode] = useState<'scores' | 'stats'>('scores');
  const [scoreMode, setScoreMode] = useState<'gross' | 'net' | 'stableford'>('gross');
  
  const calculatePlayerStats = (): PlayerStats[] => {
    const playerStats: PlayerStats[] = [];
    
    // Removed debug logging for production
    
    players.forEach(player => {
      const playerScores = scores.filter(s => s.playerId === player.id);
      const playerRounds = Array.from(new Set(playerScores.map(s => s.roundId)));
      
      // Player processing
      
      if (playerScores.length > 0) {
        let totalStrokes = playerScores.reduce((sum, score) => sum + score.score, 0);
        
        // Calculate total par for rounds played
        let totalPar = 0;
        playerRounds.forEach(roundId => {
          const round = rounds.find(r => r.id === roundId);
          if (round) {
            totalPar += 72; // Standard par 72 per round
          }
        });
        
        // Apply handicap for net scoring (hole-by-hole calculation)
        if (scoreMode === 'net') {
          const handicap = parseFloat(player.handicap || '0') || 0;
          let totalHandicapStrokes = 0;
          
          // Calculate handicap strokes for each hole played
          playerScores.forEach(score => {
            // Find the round to get the course
            const round = rounds.find(r => r.id === score.roundId);
            const course = round ? courses.find(c => c.id === round.course) : null;
            
            // Get the actual hole handicap from course data
            const holeHandicap = course?.holes.find(h => h.hole === score.hole)?.handicap || 18;
            
            // Calculate strokes received based on handicap and hole handicap
            if (handicap >= holeHandicap) {
              totalHandicapStrokes += Math.floor(handicap / 18) + (handicap % 18 >= holeHandicap ? 1 : 0);
            }
          });
          
          totalStrokes = totalStrokes - totalHandicapStrokes;
        }
        
        const toPar = totalStrokes - totalPar;
        const averageScore = totalStrokes / playerRounds.length;
        
        // Calculate best round
        let bestRound: number | null = null;
        playerRounds.forEach(roundId => {
          const roundScores = playerScores.filter(s => s.roundId === roundId);
          const roundTotal = roundScores.reduce((sum, score) => sum + score.score, 0);
          if (bestRound === null || roundTotal < bestRound) {
            bestRound = roundTotal;
          }
        });
        
        const playerTeam = teams.find(t => t.id === player.teamId);
        
        // Calculate Stableford points
        let stablefordPoints = 0;
        if (scoreMode === 'stableford') {
          playerScores.forEach(score => {
            const round = rounds.find(r => r.id === score.roundId);
            const course = round ? courses.find(c => c.id === round.course) : null;
            const holeData = course?.holes.find(h => h.hole === score.hole);
            const par = holeData?.par || 4;
            const handicap = parseFloat(player.handicap || '0') || 0;
            const holeHandicap = holeData?.handicap || 18;
            
            // Calculate net score for this hole
            let netScore = score.score;
            if (handicap >= holeHandicap) {
              const strokesReceived = Math.floor(handicap / 18) + (handicap % 18 >= holeHandicap ? 1 : 0);
              netScore = score.score - strokesReceived;
            }
            
            // Calculate Stableford points
            const scoreToPar = netScore - par;
            if (scoreToPar <= -2) stablefordPoints += 4;
            else if (scoreToPar === -1) stablefordPoints += 3;
            else if (scoreToPar === 0) stablefordPoints += 2;
            else if (scoreToPar === 1) stablefordPoints += 1;
            // 2+ over par = 0 points
          });
        }
        
        playerStats.push({
          playerId: player.id,
          name: `${player.firstName} ${player.lastName}`,
          totalStrokes,
          totalPar,
          toPar,
          roundsPlayed: playerRounds.length,
          averageScore,
          bestRound,
          stablefordPoints,
          team: playerTeam
        });
      }
    });
    
    // Sort by score mode
    if (scoreMode === 'stableford') {
      return playerStats.sort((a, b) => b.stablefordPoints - a.stablefordPoints);
    } else {
      return playerStats.sort((a, b) => a.toPar - b.toPar);
    }
  };
  
  const calculateTeamStats = (): TeamStats[] => {
    const teamStats: TeamStats[] = [];
    
    teams.forEach(team => {
      const teamPlayers = players.filter(p => p.teamId === team.id);
      const teamPlayerIds = teamPlayers.map(p => p.id);
      const teamScores = scores.filter(s => teamPlayerIds.includes(s.playerId));
      
      if (teamScores.length > 0) {
        let totalStrokes = teamScores.reduce((sum, score) => sum + score.score, 0);
        const roundsPerPlayer = new Map<number, Set<number>>();
        
        // Count rounds per player
        teamScores.forEach(score => {
          if (!roundsPerPlayer.has(score.playerId)) {
            roundsPerPlayer.set(score.playerId, new Set());
          }
          roundsPerPlayer.get(score.playerId)!.add(score.roundId);
        });
        
        // Calculate total par and rounds played
        let totalPar = 0;
        let totalRoundsPlayed = 0;
        roundsPerPlayer.forEach((roundSet) => {
          totalRoundsPlayed += roundSet.size;
          totalPar += roundSet.size * 72; // Standard par 72 per round
        });
        
        // Apply handicap for net scoring (hole-by-hole calculation)
        if (scoreMode === 'net') {
          let totalTeamHandicapStrokes = 0;
          
          teamScores.forEach(score => {
            const player = teamPlayers.find(p => p.id === score.playerId);
            if (player) {
              const handicap = parseFloat(player.handicap || '0') || 0;
              
              // Find the round to get the course
              const round = rounds.find(r => r.id === score.roundId);
              const course = round ? courses.find(c => c.id === round.course) : null;
              
              // Get the actual hole handicap from course data
              const holeHandicap = course?.holes.find(h => h.hole === score.hole)?.handicap || 18;
              
              // Calculate strokes received based on handicap and hole handicap
              if (handicap >= holeHandicap) {
                totalTeamHandicapStrokes += Math.floor(handicap / 18) + (handicap % 18 >= holeHandicap ? 1 : 0);
              }
            }
          });
          
          totalStrokes = totalStrokes - totalTeamHandicapStrokes;
        }
        
        const toPar = totalStrokes - totalPar;
        const averageScore = totalRoundsPlayed > 0 ? totalStrokes / totalRoundsPlayed : 0;
        
        teamStats.push({
          team,
          totalStrokes,
          totalPar,
          toPar,
          playersCount: teamPlayers.length,
          averageScore,
          roundsPlayed: totalRoundsPlayed
        });
      }
    });
    
    return teamStats.sort((a, b) => a.toPar - b.toPar);
  };
  
  const playerStats = calculatePlayerStats();
  const teamStats = calculateTeamStats();
  
  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Award className="h-5 w-5 text-amber-600" />;
      default: return <User className="h-5 w-5 text-gray-400" />;
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
  
  if (playerStats.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span>Overall Individual Leaderboard</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-gray-500 py-8">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No rounds completed yet!</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-golf-green" />
              <span>Team Standings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-gray-500 py-8">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No team scores yet!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Individual Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span>Leaderboard</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'scores' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('scores')}
              >
                Scores
              </Button>
              <Button
                variant={viewMode === 'stats' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('stats')}
              >
                <BarChart3 className="h-4 w-4 mr-1" />
                Stats
              </Button>
            </div>
          </CardTitle>
          
          {viewMode === 'scores' && (
            <div className="flex items-center space-x-2 mt-4">
              <span className="text-sm text-gray-600 mr-2">Scoring Mode:</span>
              <Button
                variant={scoreMode === 'gross' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setScoreMode('gross')}
              >
                <Trophy className="h-4 w-4 mr-1" />
                Gross
              </Button>
              <Button
                variant={scoreMode === 'net' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setScoreMode('net')}
              >
                <Calculator className="h-4 w-4 mr-1" />
                Net
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {viewMode === 'scores' ? (
              playerStats.slice(0, 5).map((player, index) => {
                const position = index + 1;
                const toPar = player.toPar > 0 ? `+${player.toPar}` : player.toPar.toString();
                
                return (
                  <div 
                    key={player.playerId} 
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      position === 1 ? 'bg-yellow-50 border-yellow-300' : 
                      position === 2 ? 'bg-gray-100 border-gray-200' :
                      position === 3 ? 'bg-amber-50 border-amber-200' :
                      'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {getPositionIcon(position)}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className={`font-semibold ${position === 1 ? 'text-yellow-800' : 'text-gray-900'}`}>
                            {getPositionText(position)}
                          </span>
                          <span className={`font-medium truncate ${position === 1 ? 'text-yellow-900' : 'text-gray-900'}`}>
                            {player.name}
                          </span>
                          {player.team && (
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${position === 1 ? 'border-yellow-600 text-yellow-800' : 'border-gray-300'}`}
                            >
                              {player.team.name}
                            </Badge>
                          )}
                        </div>
                        <p className={`text-sm ${position === 1 ? 'text-yellow-700' : 'text-gray-600'}`}>
                          {player.roundsPlayed} rounds • Avg: {player.averageScore.toFixed(1)}
                          {player.bestRound && ` • Best: ${player.bestRound}`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-xl font-bold ${position === 1 ? 'text-yellow-900' : 'text-gray-900'}`}>
                        {player.toPar === 0 ? 'E' : toPar}
                      </div>
                      <div className={`text-xs ${position === 1 ? 'text-yellow-700' : 'text-gray-500'}`}>
                        {player.totalStrokes} total
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="space-y-4">
                <div className="text-center text-gray-600">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">Player statistics and analysis coming soon</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Team Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-golf-green" />
              <span>Team Standings</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'scores' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('scores')}
              >
                Scores
              </Button>
              <Button
                variant={viewMode === 'stats' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('stats')}
              >
                <BarChart3 className="h-4 w-4 mr-1" />
                Stats
              </Button>
            </div>
          </CardTitle>
          
          {viewMode === 'scores' && (
            <div className="flex items-center space-x-2 mt-4">
              <span className="text-sm text-gray-600 mr-2">Scoring Mode:</span>
              <Button
                variant={scoreMode === 'gross' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setScoreMode('gross')}
              >
                <Trophy className="h-4 w-4 mr-1" />
                Gross
              </Button>
              <Button
                variant={scoreMode === 'net' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setScoreMode('net')}
              >
                <Calculator className="h-4 w-4 mr-1" />
                Net
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {viewMode === 'scores' ? (
              teamStats.map((teamStat, index) => {
                const position = index + 1;
                const toPar = teamStat.toPar > 0 ? `+${teamStat.toPar}` : teamStat.toPar.toString();
                
                return (
                  <div 
                    key={teamStat.team.id} 
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      position === 1 ? 'bg-yellow-50 border-yellow-300' : 
                      position === 2 ? 'bg-gray-100 border-gray-200' :
                      position === 3 ? 'bg-amber-50 border-amber-200' :
                      'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {getPositionIcon(position)}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className={`font-semibold ${position === 1 ? 'text-yellow-800' : 'text-gray-900'}`}>
                            {getPositionText(position)}
                          </span>
                          <span className={`font-medium truncate ${position === 1 ? 'text-yellow-900' : 'text-gray-900'}`}>
                            Team {teamStat.team.name}
                          </span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${position === 1 ? 'border-yellow-600 text-yellow-800' : 'border-gray-300'}`}
                          >
                            {teamStat.playersCount} players
                          </Badge>
                        </div>
                        <p className={`text-sm ${position === 1 ? 'text-yellow-700' : 'text-gray-600'}`}>
                          {teamStat.roundsPlayed} total rounds • Avg: {teamStat.averageScore.toFixed(1)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-xl font-bold ${position === 1 ? 'text-yellow-900' : 'text-gray-900'}`}>
                        {teamStat.toPar === 0 ? 'E' : toPar}
                      </div>
                      <div className={`text-xs ${position === 1 ? 'text-yellow-700' : 'text-gray-500'}`}>
                        {teamStat.totalStrokes} total
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="space-y-4">
                <div className="text-center text-gray-600">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">Team statistics and analysis coming soon</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}