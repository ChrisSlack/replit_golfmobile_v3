import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Users, Target, Crown, Plus, Edit } from "lucide-react";
import StablefordScoreEntry from "./StablefordScoreEntry";
import type { Course, CourseHole } from "@/lib/types";
import type { Player, Team, Match, StablefordScore } from "@shared/schema";

interface MatchplayScorecardProps {
  course: Course;
  match: Match;
  teamA: Team;
  teamB: Team;
  players: Player[];
  stablefordScores: StablefordScore[];
  onScoreUpdate: (playerId: number, hole: number, grossScore: number) => void;
}

// Stableford scoring calculation
function calculateStablefordPoints(grossScore: number, par: number, handicap: number, holeHandicap: number): number {
  const strokesReceived = Math.floor(handicap / 18) + (handicap % 18 >= holeHandicap ? 1 : 0);
  const netScore = grossScore - strokesReceived;
  const scoreToPar = netScore - par;
  
  if (scoreToPar <= -3) return 5; // Albatross+
  if (scoreToPar === -2) return 4; // Eagle
  if (scoreToPar === -1) return 3; // Birdie
  if (scoreToPar === 0) return 2;  // Par
  if (scoreToPar === 1) return 1;  // Bogey
  return 0; // Double bogey+
}

// Calculate hole winner
function getHoleWinner(pairAPoints: number[], pairBPoints: number[]): 'teamA' | 'teamB' | 'tie' {
  const bestA = Math.max(...pairAPoints);
  const bestB = Math.max(...pairBPoints);
  
  if (bestA > bestB) return 'teamA';
  if (bestB > bestA) return 'teamB';
  return 'tie';
}

// Calculate match status
function calculateMatchStatus(holesWon: number, holesLost: number, holesPlayed: number): string {
  const lead = holesWon - holesLost;
  const holesRemaining = 18 - holesPlayed;
  
  if (lead === 0) return "AS"; // All Square
  
  if (Math.abs(lead) > holesRemaining) {
    return `${Math.abs(lead)}&${holesRemaining + 1}`;
  }
  
  if (holesRemaining === 0) {
    return `${Math.abs(lead)}UP`;
  }
  
  return `${Math.abs(lead)}UP`;
}

export default function MatchplayScorecard({ 
  course, 
  match, 
  teamA, 
  teamB, 
  players, 
  stablefordScores,
  onScoreUpdate 
}: MatchplayScorecardProps) {
  const [selectedHole, setSelectedHole] = useState<number>(1);
  const [scoreEntryOpen, setScoreEntryOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<number>();
  
  // Get players for each pair
  const pairAPlayers = [
    players.find(p => p.id === match.pairAPlayer1),
    players.find(p => p.id === match.pairAPlayer2)
  ].filter(Boolean) as Player[];
  
  const pairBPlayers = [
    players.find(p => p.id === match.pairBPlayer1),
    players.find(p => p.id === match.pairBPlayer2)
  ].filter(Boolean) as Player[];

  // Calculate hole results for all 18 holes
  const holeResults = course.holes.map(hole => {
    const pairAScores = pairAPlayers.map(player => {
      const score = stablefordScores.find(s => s.playerId === player.id && s.hole === hole.hole);
      const handicap = typeof player.handicap === 'string' ? parseFloat(player.handicap) : (player.handicap || 0);
      return score ? calculateStablefordPoints(score.grossScore, hole.par, handicap, hole.handicap) : 0;
    });
    
    const pairBScores = pairBPlayers.map(player => {
      const score = stablefordScores.find(s => s.playerId === player.id && s.hole === hole.hole);
      const handicap = typeof player.handicap === 'string' ? parseFloat(player.handicap) : (player.handicap || 0);
      return score ? calculateStablefordPoints(score.grossScore, hole.par, handicap, hole.handicap) : 0;
    });
    
    return {
      hole: hole.hole,
      par: hole.par,
      pairAPoints: pairAScores,
      pairBPoints: pairBScores,
      winner: getHoleWinner(pairAScores, pairBScores)
    };
  });

  // Calculate match standing
  const teamAWins = holeResults.filter(h => h.winner === 'teamA').length;
  const teamBWins = holeResults.filter(h => h.winner === 'teamB').length;
  const ties = holeResults.filter(h => h.winner === 'tie').length;
  const holesPlayed = holeResults.filter(h => 
    h.pairAPoints.some(p => p > 0) || h.pairBPoints.some(p => p > 0)
  ).length;
  
  const matchStatus = calculateMatchStatus(teamAWins, teamBWins, holesPlayed);
  const leadingTeam = teamAWins > teamBWins ? teamA : teamBWins > teamAWins ? teamB : null;

  return (
    <div className="space-y-6">
      {/* Match Header */}
      <Card className="border-golf-green">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-golf-green" />
              <span>Betterball Matchplay</span>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-lg px-4 py-2">
                {matchStatus}
              </Badge>
              {leadingTeam && (
                <div className="flex items-center space-x-1">
                  <Crown className="h-4 w-4 text-golf-gold" />
                  <span className="font-medium text-golf-green">{leadingTeam.name}</span>
                </div>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-8">
            {/* Team A */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <h3 className="text-xl font-bold text-blue-600">{teamA.name}</h3>
              </div>
              <div className="space-y-1">
                {pairAPlayers.map(player => (
                  <div key={player.id} className="flex justify-between">
                    <span>{player.firstName} {player.lastName}</span>
                    <Badge variant="outline">HCP: {player.handicap || 0}</Badge>
                  </div>
                ))}
              </div>
              <div className="text-sm text-gray-600">
                Holes Won: {teamAWins}
              </div>
            </div>

            {/* Team B */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <h3 className="text-xl font-bold text-red-600">{teamB.name}</h3>
              </div>
              <div className="space-y-1">
                {pairBPlayers.map(player => (
                  <div key={player.id} className="flex justify-between">
                    <span>{player.firstName} {player.lastName}</span>
                    <Badge variant="outline">HCP: {player.handicap || 0}</Badge>
                  </div>
                ))}
              </div>
              <div className="text-sm text-gray-600">
                Holes Won: {teamBWins}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hole-by-Hole Scorecard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Hole-by-Hole Results</span>
            <Select value={selectedHole.toString()} onValueChange={(value) => setSelectedHole(parseInt(value))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {course.holes.map(hole => (
                  <SelectItem key={hole.hole} value={hole.hole.toString()}>
                    Hole {hole.hole}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Hole</th>
                  <th className="text-center p-2">Par</th>
                  <th className="text-center p-2">HCP</th>
                  <th className="text-center p-2 text-blue-600">{teamA.name}</th>
                  <th className="text-center p-2 text-red-600">{teamB.name}</th>
                  <th className="text-center p-2">Winner</th>
                </tr>
              </thead>
              <tbody>
                {course.holes.slice(0, 9).map(hole => {
                  const result = holeResults.find(h => h.hole === hole.hole);
                  return (
                    <tr key={hole.hole} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{hole.hole}</td>
                      <td className="text-center p-2">{hole.par}</td>
                      <td className="text-center p-2">{hole.handicap}</td>
                      <td className="text-center p-2">
                        <div className="flex items-center justify-center space-x-1">
                          <Badge 
                            variant="outline" 
                            className={result?.winner === 'teamA' ? 'bg-blue-100 text-blue-800' : ''}
                          >
                            {Math.max(...(result?.pairAPoints || [0]))}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedPlayer(match.pairAPlayer1);
                              setSelectedHole(hole.hole);
                              setScoreEntryOpen(true);
                            }}
                            className="h-6 w-6 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                      <td className="text-center p-2">
                        <div className="flex items-center justify-center space-x-1">
                          <Badge 
                            variant="outline"
                            className={result?.winner === 'teamB' ? 'bg-red-100 text-red-800' : ''}
                          >
                            {Math.max(...(result?.pairBPoints || [0]))}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedPlayer(match.pairBPlayer1);
                              setSelectedHole(hole.hole);
                              setScoreEntryOpen(true);
                            }}
                            className="h-6 w-6 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                      <td className="text-center p-2">
                        {result?.winner === 'teamA' && <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto"></div>}
                        {result?.winner === 'teamB' && <div className="w-3 h-3 bg-red-500 rounded-full mx-auto"></div>}
                        {result?.winner === 'tie' && <div className="w-3 h-3 bg-gray-400 rounded-full mx-auto"></div>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Back Nine */}
          <div className="mt-6">
            <h4 className="font-semibold mb-2">Back Nine</h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Hole</th>
                    <th className="text-center p-2">Par</th>
                    <th className="text-center p-2">HCP</th>
                    <th className="text-center p-2 text-blue-600">{teamA.name}</th>
                    <th className="text-center p-2 text-red-600">{teamB.name}</th>
                    <th className="text-center p-2">Winner</th>
                  </tr>
                </thead>
                <tbody>
                  {course.holes.slice(9).map(hole => {
                    const result = holeResults.find(h => h.hole === hole.hole);
                    return (
                      <tr key={hole.hole} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{hole.hole}</td>
                        <td className="text-center p-2">{hole.par}</td>
                        <td className="text-center p-2">{hole.handicap}</td>
                        <td className="text-center p-2">
                          <Badge 
                            variant="outline" 
                            className={result?.winner === 'teamA' ? 'bg-blue-100 text-blue-800' : ''}
                          >
                            {Math.max(...(result?.pairAPoints || [0]))}
                          </Badge>
                        </td>
                        <td className="text-center p-2">
                          <Badge 
                            variant="outline"
                            className={result?.winner === 'teamB' ? 'bg-red-100 text-red-800' : ''}
                          >
                            {Math.max(...(result?.pairBPoints || [0]))}
                          </Badge>
                        </td>
                        <td className="text-center p-2">
                          {result?.winner === 'teamA' && <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto"></div>}
                          {result?.winner === 'teamB' && <div className="w-3 h-3 bg-red-500 rounded-full mx-auto"></div>}
                          {result?.winner === 'tie' && <div className="w-3 h-3 bg-gray-400 rounded-full mx-auto"></div>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score Entry Dialog */}
      <StablefordScoreEntry
        open={scoreEntryOpen}
        onOpenChange={setScoreEntryOpen}
        course={course}
        match={match}
        players={players}
        selectedHole={selectedHole}
        selectedPlayer={selectedPlayer}
        existingScores={stablefordScores}
      />
    </div>
  );
}