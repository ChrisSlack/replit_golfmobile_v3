import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Crown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Round, Match, Player, Team, Score } from "@shared/schema";
import { courses } from "@/lib/courseData";

interface MatchplayLeaderboardProps {
  day: 1 | 2 | 3;
  players: Player[];
  teams: Team[];
  rounds: Round[];
}

export default function MatchplayLeaderboard({ day, players = [], teams = [], rounds = [] }: MatchplayLeaderboardProps) {
  const { data: allMatches = [] } = useQuery<Match[]>({
    queryKey: ["/api/matches"]
  });

  const { data: allScores = [] } = useQuery<Score[]>({
    queryKey: ["/api/scores/all"]
  });

  const dayRounds = rounds?.filter(r => r.day === day) || [];
  const dayMatches = allMatches?.filter(match => 
    dayRounds.some(round => round.id === match.roundId)
  ).slice(0, 2) || []; // Enforce maximum 2 fourballs

  const mainRound = dayRounds[0];
  const selectedCourse = mainRound ? courses.find(c => c.id === mainRound.course) : null;

  const getTeamName = (teamId: number): string => {
    if (!teams || !Array.isArray(teams)) return "Unknown Team";
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : "Unknown Team";
  };

  const getPlayerName = (playerId: number): string => {
    if (!players || !Array.isArray(players)) return "Unknown Player";
    const player = players.find(p => p.id === playerId);
    return player ? `${player.firstName} ${player.lastName}` : "Unknown Player";
  };

  const calculateStablefordPoints = (playerId: number, roundId: number): number => {
    if (!selectedCourse || !mainRound) return 0;
    
    const player = players.find(p => p.id === playerId);
    if (!player) return 0;

    const playerScores = allScores.filter(s => s.playerId === playerId && s.roundId === roundId);
    let totalPoints = 0;

    for (const score of playerScores) {
      const hole = selectedCourse.holes.find(h => h.hole === score.hole);
      if (!hole) continue;

      const handicap = player.handicap || 0;
      const holeHandicap = hole.handicap;
      
      // Calculate handicap strokes for this hole using proper golf formula
      const handicapStrokes = handicap >= holeHandicap ? Math.floor(handicap / 18) + (handicap % 18 >= holeHandicap ? 1 : 0) : 0;
      const netScore = score.score - handicapStrokes;
      
      // Calculate Stableford points based on net score vs par
      const diff = netScore - hole.par;
      if (diff <= -2) totalPoints += 4;      // Eagle or better
      else if (diff === -1) totalPoints += 3; // Birdie
      else if (diff === 0) totalPoints += 2;  // Par
      else if (diff === 1) totalPoints += 1;  // Bogey
      // Double bogey or worse = 0 points
    }

    return totalPoints;
  };

  const calculateMatchStatus = (match: Match): { teamAHoles: number, teamBHoles: number, status: string } => {
    if (!selectedCourse || !mainRound) return { teamAHoles: 0, teamBHoles: 0, status: "AS" };

    let teamAHoles = 0;
    let teamBHoles = 0;

    // Get all played holes
    const playedHoles = new Set(allScores.filter(s => s.roundId === mainRound.id).map(s => s.hole));
    
    for (const hole of Array.from(playedHoles)) {
      // Get best Stableford score for each team on this hole
      const teamAPlayer1Score = calculatePlayerHoleStableford(match.pairAPlayer1, mainRound.id, hole);
      const teamAPlayer2Score = calculatePlayerHoleStableford(match.pairAPlayer2, mainRound.id, hole);
      const teamBPlayer1Score = calculatePlayerHoleStableford(match.pairBPlayer1, mainRound.id, hole);
      const teamBPlayer2Score = calculatePlayerHoleStableford(match.pairBPlayer2, mainRound.id, hole);

      const teamABest = Math.max(teamAPlayer1Score, teamAPlayer2Score);
      const teamBBest = Math.max(teamBPlayer1Score, teamBPlayer2Score);

      if (teamABest > teamBBest) teamAHoles++;
      else if (teamBBest > teamABest) teamBHoles++;
      // Tied holes don't count
    }

    const holesLeft = 18 - playedHoles.size;
    const lead = Math.abs(teamAHoles - teamBHoles);
    
    let status = "AS";
    if (lead > holesLeft) {
      status = lead === 1 ? "1UP" : `${lead}UP`;
    } else if (lead > 0 && lead === holesLeft) {
      status = `${lead}&${holesLeft}`;
    }

    return { teamAHoles, teamBHoles, status };
  };

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
    
    const handicapStrokes = handicap >= holeHandicap ? Math.floor(handicap / 18) + (handicap % 18 >= holeHandicap ? 1 : 0) : 0;
    const netScore = score.score - handicapStrokes;
    
    const diff = netScore - holeData.par;
    if (diff <= -2) return 4;
    else if (diff === -1) return 3;
    else if (diff === 0) return 2;
    else if (diff === 1) return 1;
    return 0;
  };

  if (!mainRound || !selectedCourse || dayMatches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5" />
            <span>Day {day} Matchplay Leaderboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No matchplay rounds set up for Day {day}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="h-5 w-5" />
          <span>Day {day} Matchplay Leaderboard - {selectedCourse.name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {dayMatches.map((match, index) => {
            const matchStatus = calculateMatchStatus(match);
            return (
            <div key={match.id} className="p-4 border rounded-lg bg-gradient-to-r from-green-50 to-blue-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Crown className="h-4 w-4 text-golf-green" />
                  <span className="font-medium">Fourball {index + 1}</span>
                </div>
                <Badge variant="outline" className="text-golf-green border-golf-green">
                  In Progress
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-white rounded border">
                  <div className="font-medium text-golf-green mb-2">
                    {getTeamName(match.teamA)}
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>{getPlayerName(match.pairAPlayer1)}</span>
                      <span className="font-bold text-golf-green">
                        {calculateStablefordPoints(match.pairAPlayer1, mainRound.id)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{getPlayerName(match.pairAPlayer2)}</span>
                      <span className="font-bold text-golf-green">
                        {calculateStablefordPoints(match.pairAPlayer2, mainRound.id)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-white rounded border">
                  <div className="font-medium text-blue-600 mb-2">
                    {getTeamName(match.teamB)}
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>{getPlayerName(match.pairBPlayer1)}</span>
                      <span className="font-bold text-blue-600">
                        {calculateStablefordPoints(match.pairBPlayer1, mainRound.id)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{getPlayerName(match.pairBPlayer2)}</span>
                      <span className="font-bold text-blue-600">
                        {calculateStablefordPoints(match.pairBPlayer2, mainRound.id)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 text-center">
                <div className="flex justify-center space-x-4 mb-2">
                  <span className="text-sm text-golf-green font-medium">
                    Team A: {matchStatus.teamAHoles} holes
                  </span>
                  <span className="text-sm text-blue-600 font-medium">
                    Team B: {matchStatus.teamBHoles} holes
                  </span>
                </div>
                <Badge variant="secondary">
                  Match Status: {matchStatus.status}
                </Badge>
              </div>
            </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}