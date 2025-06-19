import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Calendar, Trash2, Users, MapPin } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Round } from "@shared/schema";
import { courses } from "@/lib/courseData";

interface RoundSelectorProps {
  selectedRoundId?: number;
  onRoundSelect: (roundId: number) => void;
}

export default function RoundSelector({ selectedRoundId, onRoundSelect }: RoundSelectorProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const { data: rounds = [], isLoading } = useQuery({
    queryKey: ["/api/rounds"],
  });

  const deleteRoundMutation = useMutation({
    mutationFn: async (roundId: number) => {
      await apiRequest(`/api/rounds/${roundId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rounds"] });
      queryClient.invalidateQueries({ queryKey: ["/api/scores/all"] });
      toast({
        title: "Round deleted",
        description: "The scorecard and all associated scores have been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete round. Please try again.",
        variant: "destructive",
      });
    },
  });

  const selectedRound = rounds.find((round: Round) => round.id === selectedRoundId);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCourseInfo = (courseId: string) => {
    return courses.find(course => course.id === courseId);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Calendar className="h-4 w-4 mr-2" />
          {selectedRound ? (
            <span>
              {getCourseInfo(selectedRound.course)?.name || selectedRound.course} - {formatDate(selectedRound.date)}
            </span>
          ) : (
            "Select Round"
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Scorecard Management</DialogTitle>
          <DialogDescription>
            Select a round to view or delete scorecards with all associated scores.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-4 text-gray-500">Loading rounds...</div>
          ) : rounds.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No rounds available</div>
          ) : (
            rounds.map((round: Round) => {
              const courseInfo = getCourseInfo(round.course);
              const isSelected = round.id === selectedRoundId;
              
              return (
                <Card 
                  key={round.id} 
                  className={`cursor-pointer transition-colors ${
                    isSelected ? 'ring-2 ring-green-500 bg-green-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    onRoundSelect(round.id);
                    setOpen(false);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="font-medium text-sm">
                            {courseInfo?.name || round.course}
                          </span>
                          {isSelected && (
                            <Badge variant="default" className="text-xs">Current</Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(round.date)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>{round.players.length} players</span>
                          </div>
                        </div>
                      </div>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Scorecard</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the round and all associated scores for:
                              <br />
                              <strong>{courseInfo?.name || round.course}</strong> on {formatDate(round.date)}
                              <br />
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteRoundMutation.mutate(round.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete Round
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}