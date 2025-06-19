import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, BarChart3, Calculator, Trophy } from "lucide-react";
import { Course } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import type { Match, Player } from "@shared/schema";

interface ScorecardProps {
  course: Course;
  players: string[];
  scores: { [player: string]: { [hole: number]: number } };
  statistics?: { [player: string]: { [hole: number]: { threePutt: boolean; pickedUp: boolean; inWater: boolean; inBunker: boolean } } };
  onScoreEdit: (player: string, hole: number) => void;
  isEditable?: boolean;
  playerHandicaps?: { [player: string]: number };
  roundId?: number;
  allPlayers?: Player[];
  teams?: any[];
}

export default function Scorecard({ course, players, scores, statistics, onScoreEdit, isEditable = true, playerHandicaps = {}, roundId, allPlayers = [], teams = [] }: ScorecardProps) {
  const [viewMode, setViewMode] = useState<'scores' | 'stats'>('scores');
  const [scoreMode, setScoreMode] = useState<'gross' | 'net' | 'stableford'>('gross');

  // Fetch matches for this specific round to determine fourball assignments
  const { data: matches = [] } = useQuery<Match[]>({
    queryKey: ["/api/matches"],
    queryFn: () => fetch(`/api/matches?roundId=${roundId}`).then(res => res.json()),
    enabled: !!roundId
  });

  // Function to get fourball number for a player
  const getFourballNumber = (playerName: string): number | null => {
    const player = allPlayers.find(p => `${p.firstName} ${p.lastName}` === playerName);
    if (!player) return null;

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      if (match.pairAPlayer1 === player.id || 
          match.pairAPlayer2 === player.id || 
          match.pairBPlayer1 === player.id || 
          match.pairBPlayer2 === player.id) {
        return i + 1; // Return 1-indexed fourball number
      }
    }
    return null;
  };

  // Function to get team color for a player
  const getTeamColor = (playerName: string): string => {
    const player = allPlayers.find(p => `${p.firstName} ${p.lastName}` === playerName);
    if (!player || !teams.length) return '';
    
    const teamIndex = teams.findIndex(t => t.id === player.teamId);
    return teamIndex === 0 ? 'border-l-blue-500' : 'border-l-red-500';
  };

  const getScoreClass = (score: number | undefined, par: number): string => {
    if (!score) return 'bg-gray-100 text-gray-400';
    const diff = score - par;
    if (diff <= -2) return 'score-eagle'; // Eagle or better
    if (diff === -1) return 'score-birdie'; // Birdie
    if (diff === 0) return 'score-par'; // Par
    if (diff === 1) return 'score-bogey'; // Bogey
    if (diff === 2) return 'score-double'; // Double bogey
    return 'score-worse'; // Triple bogey or worse
  };

  const calculateHandicapStrokes = (player: string, hole: number): number => {
    const handicap = playerHandicaps[player] || 0;
    const holeHandicap = course.holes.find(h => h.hole === hole)?.handicap || 18;
    
    // Calculate strokes received based on handicap and hole handicap
    const strokesReceived = Math.floor(handicap / 18) + (handicap % 18 >= holeHandicap ? 1 : 0);
    return strokesReceived;
  };

  const calculateStablefordPoints = (player: string, hole: number): number => {
    const grossScore = scores[player]?.[hole];
    if (!grossScore) return 0;
    
    const holeData = course.holes.find(h => h.hole === hole);
    if (!holeData) return 0;
    
    const par = holeData.par;
    const handicapStrokes = calculateHandicapStrokes(player, hole);
    const netScore = grossScore - handicapStrokes;
    const scoreToPar = netScore - par;
    
    // Stableford scoring: Eagle or better = 4+ points, Birdie = 3, Par = 2, Bogey = 1, Double+ = 0
    if (scoreToPar <= -3) return 5; // Albatross or better
    if (scoreToPar === -2) return 4; // Eagle
    if (scoreToPar === -1) return 3; // Birdie
    if (scoreToPar === 0) return 2;  // Par
    if (scoreToPar === 1) return 1;  // Bogey
    return 0; // Double bogey or worse
  };

  const getDisplayScore = (player: string, hole: number): number | undefined => {
    const grossScore = scores[player]?.[hole];
    if (!grossScore) return undefined;
    
    if (scoreMode === 'net') {
      const handicapStrokes = calculateHandicapStrokes(player, hole);
      return grossScore - handicapStrokes;
    } else if (scoreMode === 'stableford') {
      return calculateStablefordPoints(player, hole);
    }
    return grossScore;
  };

  const calculatePlayerTotal = (player: string) => {
    const playerScores = Object.values(scores[player] || {});
    const grossTotal = playerScores.reduce((sum, score) => sum + score, 0);
    
    if (scoreMode === 'net') {
      const netTotal = course.holes.reduce((sum, hole) => {
        const grossScore = scores[player]?.[hole.hole];
        if (!grossScore) return sum;
        const handicapStrokes = calculateHandicapStrokes(player, hole.hole);
        return sum + (grossScore - handicapStrokes);
      }, 0);
      const toPar = netTotal - course.par;
      return { total: netTotal, toPar };
    } else if (scoreMode === 'stableford') {
      const stablefordTotal = course.holes.reduce((sum, hole) => {
        return sum + calculateStablefordPoints(player, hole.hole);
      }, 0);
      return { total: stablefordTotal, toPar: null }; // Stableford doesn't use toPar
    }
    
    const toPar = grossTotal - course.par;
    return { total: grossTotal, toPar };
  };

  const getStatisticsBadges = (player: string, hole: number) => {
    const stats = statistics?.[player]?.[hole];
    if (!stats) return [];
    
    const badges = [];
    if (stats.threePutt) badges.push({ text: '3P', color: 'bg-yellow-500' });
    if (stats.pickedUp) badges.push({ text: 'PU', color: 'bg-orange-500' });
    if (stats.inWater) badges.push({ text: 'W', color: 'bg-blue-500' });
    if (stats.inBunker) badges.push({ text: 'B', color: 'bg-amber-600' });
    
    return badges;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Scorecard</span>
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
            <Button
              variant={scoreMode === 'stableford' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setScoreMode('stableford')}
            >
              <Trophy className="h-4 w-4 mr-1" />
              Stableford
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {viewMode === 'scores' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-2 py-1 text-left min-w-[80px] text-xs font-medium text-gray-600">Hole</th>
                  {course.holes.map(hole => (
                    <th key={hole.hole} className="px-1 py-1 text-center min-w-[32px] text-xs text-gray-600">
                      {hole.hole}
                    </th>
                  ))}
                  <th className="px-2 py-1 text-center min-w-[50px] text-xs text-gray-600">Total</th>
                </tr>
                <tr className="bg-golf-green text-white">
                  <th className="px-2 py-2 text-left min-w-[80px]">Player</th>
                  {course.holes.map(hole => (
                    <th key={hole.hole} className="px-1 py-2 text-center min-w-[32px] text-xs">
                      Par {hole.par}
                    </th>
                  ))}
                  <th className="px-2 py-2 text-center min-w-[50px] text-xs">Total</th>
                </tr>
              </thead>
              <tbody>
                {players.map(player => {
                  const { total, toPar } = calculatePlayerTotal(player);
                  const fourballNumber = getFourballNumber(player);
                  const teamColor = getTeamColor(player);
                  return (
                    <tr key={player} className="border-b hover:bg-gray-50">
                      <td className={`px-2 py-2 font-medium text-sm border-l-4 ${teamColor}`}>
                        <div className="flex items-center space-x-2">
                          <span>{player}</span>
                          {fourballNumber && (
                            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-gray-600 rounded-full">
                              {fourballNumber}
                            </span>
                          )}
                        </div>
                      </td>
                      
                      {course.holes.map(hole => {
                        const grossScore = scores[player]?.[hole.hole];
                        const displayScore = getDisplayScore(player, hole.hole);
                        const hasScore = grossScore !== undefined;
                        const handicapStrokes = calculateHandicapStrokes(player, hole.hole);
                        
                        return (
                          <td key={hole.hole} className="px-1 py-2 text-center">
                            {hasScore ? (
                              <div className="flex flex-col items-center space-y-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`h-7 w-7 p-0 text-xs relative ${getScoreClass(displayScore!, hole.par)} ${!isEditable ? 'cursor-default' : ''}`}
                                  onClick={() => isEditable && onScoreEdit(player, hole.hole)}
                                  disabled={!isEditable}
                                >
                                  {isEditable && hasScore && <Edit className="h-2 w-2 absolute top-0 right-0" />}
                                  {displayScore}
                                </Button>
                                {scoreMode === 'net' && handicapStrokes > 0 && (
                                  <div className="text-xs text-gray-600 bg-gray-100 rounded px-1">
                                    -{handicapStrokes}
                                  </div>
                                )}

                              </div>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-xs bg-gray-100 text-gray-400"
                                onClick={() => isEditable && onScoreEdit(player, hole.hole)}
                                disabled={!isEditable}
                              >
                                -
                              </Button>
                            )}
                          </td>
                        );
                      })}
                      
                      <td className="px-2 py-2 text-center font-medium">
                        <div className="text-sm font-bold">{total || 0}</div>
                        {toPar !== null && toPar !== 0 && (
                          <div className={`text-xs font-medium ${(toPar || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {(toPar || 0) > 0 ? '+' : ''}{toPar}
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          {scoreMode === 'stableford' ? 'Points' : scoreMode === 'net' ? 'Net' : 'Gross'}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-golf-green text-white">
                  <th className="px-2 py-2 text-left min-w-[80px]">Player</th>
                  {course.holes.map(hole => (
                    <th key={hole.hole} className="px-1 py-2 text-center min-w-[32px] text-xs">
                      {hole.hole}
                    </th>
                  ))}
                  <th className="px-2 py-2 text-center min-w-[50px] text-xs">Totals</th>
                </tr>
              </thead>
              <tbody>
                {players.map(player => {
                  return (
                    <tr key={player} className="border-b hover:bg-gray-50">
                      <td className="px-2 py-2 font-medium text-sm">
                        {player}
                      </td>
                      
                      {course.holes.map(hole => {
                        const badges = getStatisticsBadges(player, hole.hole);
                        
                        return (
                          <td key={hole.hole} className="px-1 py-2 text-center">
                            <div className="flex flex-wrap gap-1 justify-center">
                              {badges.map((badge, idx) => (
                                <Badge
                                  key={idx}
                                  className={`text-xs px-1 py-0 ${badge.color} text-white`}
                                >
                                  {badge.text}
                                </Badge>
                              ))}
                              {badges.length === 0 && (
                                <span className="text-gray-400 text-xs">-</span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                      
                      <td className="px-2 py-2 text-center">
                        <div className="flex flex-wrap gap-1 justify-center">
                          {statistics && Object.values(statistics[player] || {}).some(stat => stat.threePutt) && (
                            <Badge className="bg-yellow-500 text-white text-xs">
                              3P: {Object.values(statistics[player] || {}).filter(stat => stat.threePutt).length}
                            </Badge>
                          )}
                          {statistics && Object.values(statistics[player] || {}).some(stat => stat.inWater) && (
                            <Badge className="bg-blue-500 text-white text-xs">
                              W: {Object.values(statistics[player] || {}).filter(stat => stat.inWater).length}
                            </Badge>
                          )}
                          {statistics && Object.values(statistics[player] || {}).some(stat => stat.inBunker) && (
                            <Badge className="bg-amber-600 text-white text-xs">
                              B: {Object.values(statistics[player] || {}).filter(stat => stat.inBunker).length}
                            </Badge>
                          )}
                          {statistics && Object.values(statistics[player] || {}).some(stat => stat.pickedUp) && (
                            <Badge className="bg-orange-500 text-white text-xs">
                              PU: {Object.values(statistics[player] || {}).filter(stat => stat.pickedUp).length}
                            </Badge>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}