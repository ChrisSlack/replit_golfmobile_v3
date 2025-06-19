import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import type { Player, Team, Round, Score, Match } from "@shared/schema";
import { courses } from "@/lib/courseData";

interface BetterballLeaderboardProps {
  players: Player[];
  teams: Team[];
  rounds: Round[];
  allScores: Score[];
}

export default function BetterballLeaderboard({ players, teams, rounds, allScores }: BetterballLeaderboardProps) {
  const [selectedDay, setSelectedDay] = useState("1");

  const { data: allMatches = [] } = useQuery<Match[]>({
    queryKey: ["/api/matches"]
  });

  const getPlayerName = (playerId: number): string => {
    const player = players.find(p => p.id === playerId);
    return player ? `${player.firstName} ${player.lastName}` : "Unknown Player";
  };

  const dayRounds = rounds?.filter(r => r.day?.toString() === selectedDay) || [];
  const mainRound = dayRounds[0];
  const selectedCourse = mainRound ? courses.find(c => c.id === mainRound.course) : null;
  
  const dayMatches = allMatches?.filter(match => 
    dayRounds.some(round => round.id === match.roundId)
  ).slice(0, 2) || [];

  const calculatePlayerHoleStableford = (playerId: number, roundId: number, hole: number): number => {
    if (!selectedCourse) return 0;
    
    const player = players.find(p => p.id === playerId);
    if (!player) return 0;

    const score = allScores.find(s => s.playerId === playerId && s.roundId === roundId && s.hole === hole);
    if (!score) return 0;

    const holeData = selectedCourse.holes.find(h => h.hole === hole);
    if (!holeData) return 0;

    const handicap = player.handicap || 0;
    const holeHandicap = holeData.handicap;
    
    const numericHandicap = Number(handicap);
    const handicapStrokes = numericHandicap >= holeHandicap ? Math.floor(numericHandicap / 18) + (numericHandicap % 18 >= holeHandicap ? 1 : 0) : 0;
    const netScore = score.score - handicapStrokes;
    
    const diff = netScore - holeData.par;
    if (diff <= -2) return 4;
    else if (diff === -1) return 3;
    else if (diff === 0) return 2;
    else if (diff === 1) return 1;
    return 0;
  };

  const calculateBetterballScore = (player1Id: number, player2Id: number, roundId: number): number => {
    if (!selectedCourse || !mainRound) return 0;

    // Get all holes that have been played by any player in this round
    const allPlayedHoles = new Set(allScores.filter(s => s.roundId === roundId).map(s => s.hole));
    
    if (allPlayedHoles.size === 0) return 0;
    
    let totalPoints = 0;

    // For each hole that's been played, calculate the better ball score for this pair
    for (const hole of Array.from(allPlayedHoles)) {
      const player1Points = calculatePlayerHoleStableford(player1Id, roundId, hole);
      const player2Points = calculatePlayerHoleStableford(player2Id, roundId, hole);
      
      // Take the better of the two scores (higher Stableford points)
      const betterScore = Math.max(player1Points, player2Points);
      totalPoints += betterScore;
      
    }

    return totalPoints;
  };

  const calculateMatchResult = (match: Match): { 
    teamAScore: number, 
    teamBScore: number, 
    status: string,
    lastHolePlayed: number,
    teamAUp: number,
    teamBUp: number,
    isAllSquare: boolean
  } => {
    if (!mainRound) return { 
      teamAScore: 0, 
      teamBScore: 0, 
      status: "AS", 
      lastHolePlayed: 0,
      teamAUp: 0,
      teamBUp: 0,
      isAllSquare: true
    };

    const teamAScore = calculateBetterballScore(match.pairAPlayer1, match.pairAPlayer2, mainRound.id);
    const teamBScore = calculateBetterballScore(match.pairBPlayer1, match.pairBPlayer2, mainRound.id);

    // Get the actual holes played for this match
    const matchPlayers = [match.pairAPlayer1, match.pairAPlayer2, match.pairBPlayer1, match.pairBPlayer2];
    const matchScores = allScores.filter(s => s.roundId === mainRound.id && matchPlayers.includes(s.playerId));
    const playedHoles = new Set(matchScores.map(s => s.hole));
    const lastHolePlayed = playedHoles.size > 0 ? Math.max(...Array.from(playedHoles)) : 4;
    const holesPlayed = playedHoles.size;
    
    const scoreDiff = teamAScore - teamBScore;
    
    // Limit the lead to realistic matchplay terms (can't be more UP than holes remaining)
    // In matchplay, being "X UP" means you're X holes ahead with consideration for holes remaining
    const maxPossibleLead = Math.min(Math.abs(scoreDiff), holesPlayed);
    
    const isAllSquare = scoreDiff === 0;
    const teamAUp = scoreDiff > 0 ? maxPossibleLead : 0;
    const teamBUp = scoreDiff < 0 ? maxPossibleLead : 0;
    
    let status = "AS";
    if (scoreDiff > 0) status = `${maxPossibleLead}UP`;
    else if (scoreDiff < 0) status = `${maxPossibleLead}UP`;

    return { 
      teamAScore, 
      teamBScore, 
      status, 
      lastHolePlayed,
      teamAUp,
      teamBUp,
      isAllSquare
    };
  };

  const overallTeamScores = () => {
    let teamATotal = 0;
    let teamBTotal = 0;

    dayMatches.forEach(match => {
      const result = calculateMatchResult(match);
      teamATotal += result.teamAScore;
      teamBTotal += result.teamBScore;
    });

    return { teamATotal, teamBTotal };
  };

  const { teamATotal, teamBTotal } = overallTeamScores();
  
  // Calculate realistic overall lead based on holes played
  const getOverallLead = () => {
    if (!mainRound) return { leadAmount: 0, isAllSquare: true };
    
    // Get total holes played across all matches
    const allMatchPlayers = dayMatches.flatMap(match => [
      match.pairAPlayer1, match.pairAPlayer2, match.pairBPlayer1, match.pairBPlayer2
    ]);
    const playedHoles = new Set(
      allScores
        .filter(s => s.roundId === mainRound.id && allMatchPlayers.includes(s.playerId))
        .map(s => s.hole)
    );
    const holesPlayed = playedHoles.size;
    
    const scoreDiff = teamATotal - teamBTotal;
    const maxPossibleLead = Math.min(Math.abs(scoreDiff), holesPlayed);
    
    return {
      leadAmount: maxPossibleLead,
      isAllSquare: scoreDiff === 0,
      teamALeading: scoreDiff > 0,
      teamBLeading: scoreDiff < 0
    };
  };

  const overallLead = getOverallLead();

  if (!mainRound || !selectedCourse || dayMatches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-golf-green" />
            <span>Betterball Leaderboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Select value={selectedDay} onValueChange={setSelectedDay}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Day" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Day 1</SelectItem>
                <SelectItem value="2">Day 2</SelectItem>
                <SelectItem value="3">Day 3</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-center text-gray-500">No betterball matches found for Day {selectedDay}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-golf-green" />
          <span>Betterball Leaderboard - {selectedCourse.name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Select value={selectedDay} onValueChange={setSelectedDay}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Day" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Day 1</SelectItem>
              <SelectItem value="2">Day 2</SelectItem>
              <SelectItem value="3">Day 3</SelectItem>
            </SelectContent>
          </Select>

          {/* Overall Team Scores - Ryder Cup Style */}
          <div className="mb-6 border rounded-lg overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
              Overall Match Score
            </div>
            <div className="grid grid-cols-[1fr_90px_1fr] h-[70px] sm:grid-cols-1 sm:h-auto">
              <div className={`p-3 flex items-center justify-center border-r-4 ${
                teamBTotal > teamATotal ? 'bg-red-50 border-r-red-500' : 'bg-gray-50 border-r-gray-300'
              }`}>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">Team B</div>
                  <div className="text-xl font-bold">{teamBTotal}</div>
                </div>
              </div>
              <div className="bg-white flex flex-col items-center justify-center relative min-h-[70px] w-[90px]">
                <div className="text-center w-full">
                  <div className="text-sm font-semibold text-gray-600 mb-1">
                    OVERALL
                  </div>
                  
                  {/* Score positioned below OVERALL text */}
                  {overallLead.isAllSquare ? (
                    <div className="text-sm font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded mx-auto w-fit">
                      AS
                    </div>
                  ) : overallLead.teamBLeading ? (
                    <div className="text-sm font-bold text-red-700 bg-red-100 px-2 py-1 rounded mx-auto w-fit">
                      {overallLead.leadAmount}UP
                    </div>
                  ) : (
                    <div className="text-sm font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded mx-auto w-fit">
                      {overallLead.leadAmount}UP
                    </div>
                  )}
                </div>
              </div>
              <div className={`p-3 flex items-center justify-center border-l-4 ${
                teamATotal > teamBTotal ? 'bg-blue-50 border-l-blue-500' : 'bg-gray-50 border-l-gray-300'
              }`}>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">Team A</div>
                  <div className="text-xl font-bold">{teamATotal}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Ryder Cup Style Fourball Results */}
          <div className="space-y-4">
            {dayMatches.map((match, index) => {
              const result = calculateMatchResult(match);
              return (
                <div key={match.id} className="border rounded-lg overflow-hidden">
                  {/* Header */}
                  <div className="bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
                    Fourball {index + 1}
                  </div>
                  {/* Matchplay Scorecard Style Row - Team B | Hole | Team A */}
                  <div className="grid grid-cols-[1fr_90px_1fr] h-[80px] sm:grid-cols-1 sm:h-auto">
                    {/* Team B Cell (Left) */}
                    <div className={`p-3 flex flex-col justify-center border-r-4 ${
                      result.isAllSquare 
                        ? 'bg-gray-50 border-r-gray-300' 
                        : result.teamBUp > 0 
                          ? 'bg-red-50 border-r-red-500' 
                          : 'bg-gray-50 border-r-gray-300'
                    }`}>
                      <div className="text-sm font-normal text-red-600 text-right">
                        {getPlayerName(match.pairBPlayer1)}
                      </div>
                      <div className="text-sm font-normal text-red-600 text-right">
                        {getPlayerName(match.pairBPlayer2)}
                      </div>

                    </div>

                    {/* Hole Number Cell (Center) with Dynamic Score Positioning */}
                    <div className="bg-white flex flex-col items-center justify-center relative min-h-[80px] w-[90px]">
                      <div className="text-center w-full">
                        <div className="text-lg font-semibold text-gray-800">
                          {result.lastHolePlayed > 0 ? result.lastHolePlayed : 4}
                        </div>
                        <div className="text-xs text-gray-500 mb-1">
                          HOLE
                        </div>
                        
                        {/* Score positioned below HOLE text with more spacing */}
                        {result.isAllSquare ? (
                          <div className="text-sm font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded mx-auto w-fit">
                            AS
                          </div>
                        ) : result.teamBUp > 0 ? (
                          <div className="text-sm font-bold text-red-700 bg-red-100 px-2 py-1 rounded mx-auto w-fit">
                            {result.teamBUp}UP
                          </div>
                        ) : (
                          <div className="text-sm font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded mx-auto w-fit">
                            {result.teamAUp}UP
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Team A Cell (Right) */}
                    <div className={`p-3 flex flex-col justify-center border-l-4 ${
                      result.isAllSquare 
                        ? 'bg-gray-50 border-l-gray-300' 
                        : result.teamAUp > 0 
                          ? 'bg-blue-50 border-l-blue-500' 
                          : 'bg-gray-50 border-l-gray-300'
                    }`}>
                      <div className="text-sm font-normal text-blue-600">
                        {getPlayerName(match.pairAPlayer1)}
                      </div>
                      <div className="text-sm font-normal text-blue-600">
                        {getPlayerName(match.pairAPlayer2)}
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile responsive handled by Tailwind classes */}
      </CardContent>
    </Card>
  );
}