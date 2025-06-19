import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Trophy, Users, BarChart3 } from "lucide-react";
import Scorecard from "./Scorecard";
import Leaderboard from "./Leaderboard";
import { courses } from "@/lib/courseData";
import type { Round, Score, Player } from "@shared/schema";
import { Course } from "@/lib/types";

interface RoundHistoryProps {
  rounds: Round[];
  scores: Score[];
  players: Player[];
}

export default function RoundHistory({ rounds, scores, players }: RoundHistoryProps) {
  const [selectedRoundId, setSelectedRoundId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'scorecard' | 'leaderboard'>('scorecard');

  const selectedRound = rounds.find(r => r.id === selectedRoundId);
  const selectedCourse = selectedRound ? courses.find(c => c.id === selectedRound.course) : null;
  
  // Filter scores for selected round
  const roundScores = scores.filter(s => s.roundId === selectedRoundId);
  
  // Convert scores to format expected by components
  const formattedScores: { [playerName: string]: { [hole: number]: number } } = {};
  const formattedStatistics: { [playerName: string]: { [hole: number]: { threePutt: boolean; pickedUp: boolean; inWater: boolean; inBunker: boolean } } } = {};
  
  roundScores.forEach(score => {
    const player = players.find(p => p.id === score.playerId);
    if (player) {
      const playerName = `${player.firstName} ${player.lastName}`;
      if (!formattedScores[playerName]) {
        formattedScores[playerName] = {};
        formattedStatistics[playerName] = {};
      }
      formattedScores[playerName][score.hole] = score.score;
      formattedStatistics[playerName][score.hole] = {
        threePutt: score.threePutt || false,
        pickedUp: score.pickedUp || false,
        inWater: score.inWater || false,
        inBunker: score.inBunker || false
      };
    }
  });

  const playerNames = Object.keys(formattedScores);

  // Calculate round statistics
  const getRoundStats = (round: Round) => {
    const roundScoresData = scores.filter(s => s.roundId === round.id);
    const totalScores = roundScoresData.reduce((sum, score) => sum + score.score, 0);
    const uniquePlayers = new Set(roundScoresData.map(s => s.playerId)).size;
    const averageScore = uniquePlayers > 0 ? (totalScores / uniquePlayers).toFixed(1) : '0';
    
    return {
      totalPlayers: uniquePlayers,
      averageScore,
      totalHoles: roundScoresData.length
    };
  };

  if (rounds.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Trophy className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Completed Rounds</h3>
          <p className="text-gray-500 text-center">
            Complete your first round to see it here in the history.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Round Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Round History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Select Round to View
              </label>
              <Select value={selectedRoundId?.toString() || ""} onValueChange={(value) => setSelectedRoundId(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a completed round..." />
                </SelectTrigger>
                <SelectContent>
                  {rounds.map(round => {
                    const course = courses.find(c => c.id === round.course);
                    const stats = getRoundStats(round);
                    return (
                      <SelectItem key={round.id} value={round.id.toString()}>
                        <div className="flex flex-col">
                          <div className="font-medium">
                            {course?.name || round.course} - {new Date(round.date).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {stats.totalPlayers} players • Avg: {stats.averageScore}
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Round Summary */}
            {selectedRound && selectedCourse && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-600">Course</p>
                  <p className="font-semibold">{selectedCourse.name}</p>
                  <p className="text-xs text-gray-500">Par {selectedCourse.par}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-semibold">{new Date(selectedRound.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Players</p>
                  <p className="font-semibold">{playerNames.length} played</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Round Details */}
      {selectedRound && selectedCourse && playerNames.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Round Details</span>
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'scorecard' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('scorecard')}
                >
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Scorecard
                </Button>
                <Button
                  variant={viewMode === 'leaderboard' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('leaderboard')}
                >
                  <Trophy className="h-4 w-4 mr-1" />
                  Leaderboard
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {viewMode === 'scorecard' ? (
              <Scorecard
                course={selectedCourse}
                players={playerNames}
                scores={formattedScores}
                statistics={formattedStatistics}
                onScoreEdit={() => {}} // Read-only for history
                isEditable={false}
              />
            ) : (
              <Leaderboard
                course={selectedCourse}
                players={playerNames}
                scores={formattedScores}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      {selectedRound && playerNames.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-golf-green">
                  {Math.min(...Object.values(formattedScores).map(scores => 
                    Object.values(scores).reduce((sum, score) => sum + score, 0)
                  ))}
                </div>
                <p className="text-xs text-gray-600">Lowest Round</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {roundScores.filter(s => s.threePutt).length}
                </div>
                <p className="text-xs text-gray-600">3-Putts</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">
                  {roundScores.filter(s => s.inWater).length}
                </div>
                <p className="text-xs text-gray-600">Water Hazards</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}