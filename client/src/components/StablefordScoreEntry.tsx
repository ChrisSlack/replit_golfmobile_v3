import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Target, Plus, Edit } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Course, CourseHole } from "@/lib/types";
import type { Player, Match, StablefordScore } from "@shared/schema";

interface StablefordScoreEntryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course;
  match: Match;
  players: Player[];
  selectedHole?: number;
  selectedPlayer?: number;
  existingScores: StablefordScore[];
}

// Stableford point calculation
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

export default function StablefordScoreEntry({
  open,
  onOpenChange,
  course,
  match,
  players,
  selectedHole = 1,
  selectedPlayer,
  existingScores
}: StablefordScoreEntryProps) {
  const [playerId, setPlayerId] = useState<number>(selectedPlayer || 0);
  const [hole, setHole] = useState<number>(selectedHole);
  const [grossScore, setGrossScore] = useState<number>(0);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get all players in this match
  const matchPlayers = players.filter(p => 
    p.id === match.pairAPlayer1 || 
    p.id === match.pairAPlayer2 || 
    p.id === match.pairBPlayer1 || 
    p.id === match.pairBPlayer2
  );

  const selectedPlayerData = players.find(p => p.id === playerId);
  const holeData = course.holes.find(h => h.hole === hole);
  const existingScore = existingScores.find(s => s.playerId === playerId && s.hole === hole);

  const createOrUpdateScoreMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPlayerData || !holeData || !grossScore) return;

      const handicap = selectedPlayerData.handicap ? parseFloat(selectedPlayerData.handicap.toString()) : 0;
      const strokesReceived = Math.floor(handicap / 18) + (handicap % 18 >= holeData.handicap ? 1 : 0);
      const netScore = grossScore - strokesReceived;
      const stablefordPoints = calculateStablefordPoints(grossScore, holeData.par, handicap, holeData.handicap);

      const scoreData = {
        roundId: match.roundId,
        playerId: playerId,
        hole: hole,
        grossScore: grossScore,
        netScore: netScore,
        stablefordPoints: stablefordPoints
      };

      if (existingScore) {
        const response = await apiRequest("PATCH", `/api/stableford-scores/${existingScore.id}`, scoreData);
        return await response.json();
      } else {
        const response = await apiRequest("POST", "/api/stableford-scores", scoreData);
        return await response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stableford-scores", match.roundId] });
      toast({
        title: "Score Saved",
        description: `${selectedPlayerData?.firstName} ${selectedPlayerData?.lastName} - Hole ${hole}: ${grossScore} strokes`,
      });
      onOpenChange(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save score",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setPlayerId(selectedPlayer || 0);
    setHole(selectedHole);
    setGrossScore(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerId || !hole || !grossScore) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    createOrUpdateScoreMutation.mutate();
  };

  // Calculate preview values
  const previewData = selectedPlayerData && holeData && grossScore ? {
    handicap: selectedPlayerData.handicap ? parseFloat(selectedPlayerData.handicap.toString()) : 0,
    strokesReceived: Math.floor((selectedPlayerData.handicap ? parseFloat(selectedPlayerData.handicap.toString()) : 0) / 18) + 
                   ((selectedPlayerData.handicap ? parseFloat(selectedPlayerData.handicap.toString()) : 0) % 18 >= holeData.handicap ? 1 : 0),
    netScore: grossScore - (Math.floor((selectedPlayerData.handicap ? parseFloat(selectedPlayerData.handicap.toString()) : 0) / 18) + 
             ((selectedPlayerData.handicap ? parseFloat(selectedPlayerData.handicap.toString()) : 0) % 18 >= holeData.handicap ? 1 : 0)),
    stablefordPoints: calculateStablefordPoints(
      grossScore, 
      holeData.par, 
      selectedPlayerData.handicap ? parseFloat(selectedPlayerData.handicap.toString()) : 0, 
      holeData.handicap
    )
  } : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {existingScore ? "Edit" : "Enter"} Stableford Score
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Player Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Player</label>
            <Select value={playerId.toString()} onValueChange={(value) => setPlayerId(parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Select player..." />
              </SelectTrigger>
              <SelectContent>
                {matchPlayers.map((player) => (
                  <SelectItem key={player.id} value={player.id.toString()}>
                    {player.firstName} {player.lastName} (HCP: {player.handicap || 0})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Hole Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Hole</label>
            <Select value={hole.toString()} onValueChange={(value) => setHole(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {course.holes.map((courseHole) => (
                  <SelectItem key={courseHole.hole} value={courseHole.hole.toString()}>
                    Hole {courseHole.hole} (Par {courseHole.par})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Gross Score Input */}
          <div>
            <label className="block text-sm font-medium mb-2">Gross Score</label>
            <Input
              type="number"
              min="1"
              max="12"
              value={grossScore || ""}
              onChange={(e) => setGrossScore(parseInt(e.target.value) || 0)}
              placeholder="Enter strokes..."
            />
          </div>

          {/* Score Preview */}
          {previewData && (
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Score Calculation</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Gross Score: {grossScore}</div>
                  <div>Par: {holeData?.par}</div>
                  <div>Handicap Strokes: {previewData.strokesReceived}</div>
                  <div>Net Score: {previewData.netScore}</div>
                  <div className="col-span-2 mt-2">
                    <Badge 
                      variant="outline" 
                      className="text-lg px-3 py-1 bg-golf-green text-white"
                    >
                      {previewData.stablefordPoints} Stableford Points
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full golf-green text-white"
            disabled={!playerId || !hole || !grossScore || createOrUpdateScoreMutation.isPending}
          >
            {createOrUpdateScoreMutation.isPending ? "Saving..." : existingScore ? "Update Score" : "Save Score"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}