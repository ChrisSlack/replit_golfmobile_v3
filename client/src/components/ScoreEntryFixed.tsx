import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { courses } from "@/lib/courseData";

interface ScoreEntryProps {
  isOpen: boolean;
  onClose: () => void;
  player: string;
  hole: number;
  roundId: number;
  playerId: number;
  currentScore?: number;
  currentStats?: {
    threePutt: boolean;
    pickedUp: boolean;
    inWater: boolean;
    inBunker: boolean;
  };
}

export default function ScoreEntryFixed({ 
  isOpen, 
  onClose, 
  player, 
  hole, 
  roundId, 
  playerId,
  currentScore = 0,
  currentStats = { threePutt: false, pickedUp: false, inWater: false, inBunker: false }
}: ScoreEntryProps) {
  const [score, setScore] = useState("");
  const [threePutt, setThreePutt] = useState(false);
  const [pickedUp, setPickedUp] = useState(false);
  const [inWater, setInWater] = useState(false);
  const [inBunker, setInBunker] = useState(false);

  // Reset form when dialog opens or player/hole changes
  useEffect(() => {
    if (isOpen) {
      setScore(currentScore > 0 ? currentScore.toString() : "");
      setThreePutt(currentStats.threePutt);
      setPickedUp(currentStats.pickedUp);
      setInWater(currentStats.inWater);
      setInBunker(currentStats.inBunker);
    } else {
      // Clear form when dialog closes
      setScore("");
      setThreePutt(false);
      setPickedUp(false);
      setInWater(false);
      setInBunker(false);
    }
  }, [isOpen, playerId, hole, currentScore, currentStats]);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saveScore = useMutation({
    mutationFn: async () => {
      const scoreData = {
        roundId,
        playerId,
        hole,
        score: parseInt(score),
        threePutt,
        pickedUp,
        inWater,
        inBunker
      };

      console.log("Saving score data:", scoreData);
      
      // Try to create/update score directly
      const response = await fetch("/api/scores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(scoreData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    },
    onSuccess: (data) => {
      console.log("Score saved successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["/api/scores/all"] });
      toast({
        title: "Score saved",
        description: `${player} - Hole ${hole}: ${score} strokes`,
      });
      onClose();
    },
    onError: (error) => {
      console.error("Error saving score:", error);
      toast({
        title: "Error saving score",
        description: "Please try again",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!score || isNaN(parseInt(score))) {
      toast({
        title: "Invalid score",
        description: "Please select a score",
        variant: "destructive",
      });
      return;
    }
    saveScore.mutate();
  };

  // Get course information
  const currentCourse = courses.find(c => c.id === 'nau'); // Default to NAU for now
  const currentHoleData = currentCourse?.holes.find(h => h.hole === hole);

  const handleScoreSelect = (scoreValue: number) => {
    setScore(scoreValue.toString());
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg h-[90vh] flex flex-col" data-dialog="score-entry">
        <DialogHeader className="space-y-1 pb-2">
          <DialogTitle className="text-center text-lg font-semibold">Portugal Golf 2025</DialogTitle>
          <DialogDescription className="text-center text-sm text-gray-600">
            Record a score for {player}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-6 overflow-y-auto">
          {/* Hole Navigation */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={hole <= 1}
                className="p-2"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="text-center">
                <div className="text-lg font-bold">Hole {hole}</div>
                {currentHoleData && (
                  <div className="text-sm text-gray-600">
                    Par {currentHoleData.par} • Handicap: {currentHoleData.handicap}
                  </div>
                )}
              </div>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={hole >= 18}
                className="p-2"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Player Info */}
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">{player}</div>
          </div>

          {/* Hole Info Summary */}
          {currentHoleData && (
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-sm font-medium text-blue-900">Hole {hole}</div>
              <div className="text-sm text-blue-700">
                Handicap: {currentHoleData.handicap}
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-blue-900">Par {currentHoleData.par}</span>
              </div>
            </div>
          )}

          {/* Score Selection Grid */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Score</Label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((scoreValue) => (
                <Button
                  key={scoreValue}
                  type="button"
                  variant="outline"
                  style={{
                    backgroundColor: score === scoreValue.toString() ? '#10b981' : 'white',
                    color: score === scoreValue.toString() ? 'white' : '#1f2937',
                    borderColor: score === scoreValue.toString() ? '#10b981' : '#d1d5db',
                  }}
                  className="h-12 text-lg font-semibold transition-all duration-200 border-2 hover:border-golf-green"
                  onClick={() => handleScoreSelect(scoreValue)}
                >
                  {scoreValue}
                </Button>
              ))}
            </div>
          </div>

          {/* Additional Score Information */}
          <div className="space-y-4">
            <Label className="text-sm font-medium text-gray-700">Additional Score Information</Label>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="threePutt"
                    checked={threePutt}
                    onCheckedChange={(checked) => setThreePutt(checked === true)}
                    style={{
                      backgroundColor: threePutt ? '#10b981' : 'white',
                      borderColor: threePutt ? '#10b981' : '#d1d5db'
                    }}
                  />
                  <label htmlFor="threePutt" className="text-sm text-gray-700">
                    3-Putt (Three putts on green)
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pickedUp"
                    checked={pickedUp}
                    onCheckedChange={(checked) => setPickedUp(checked === true)}
                    style={{
                      backgroundColor: pickedUp ? '#10b981' : 'white',
                      borderColor: pickedUp ? '#10b981' : '#d1d5db'
                    }}
                  />
                  <label htmlFor="pickedUp" className="text-sm text-gray-700">
                    Picked Up (Ball not holed out)
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="inWater"
                    checked={inWater}
                    onCheckedChange={(checked) => setInWater(checked === true)}
                    style={{
                      backgroundColor: inWater ? '#10b981' : 'white',
                      borderColor: inWater ? '#10b981' : '#d1d5db'
                    }}
                  />
                  <label htmlFor="inWater" className="text-sm text-gray-700">
                    In Water (Ball went into water hazard)
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="inBunker"
                    checked={inBunker}
                    onCheckedChange={(checked) => setInBunker(checked === true)}
                    style={{
                      backgroundColor: inBunker ? '#10b981' : 'white',
                      borderColor: inBunker ? '#10b981' : '#d1d5db'
                    }}
                  />
                  <label htmlFor="inBunker" className="text-sm text-gray-700">
                    In Bunker (Ball landed in sand bunker)
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Spacer to push buttons to bottom */}
          <div className="flex-1"></div>
          
          {/* Action Buttons - Fixed at bottom */}
          <div className="mt-auto pt-4 border-t border-gray-200 bg-white">
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 h-12 text-base border-gray-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!score || saveScore.isPending}
                className="flex-1 h-12 text-base"
                style={{ backgroundColor: '#10b981', color: 'white' }}
              >
                {saveScore.isPending ? "Saving..." : "Save Score"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}