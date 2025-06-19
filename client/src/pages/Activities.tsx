import { useState, useEffect } from "react";
import { Vote } from "lucide-react";
import ActivityVoting from "@/components/ActivityVoting";
import { storage } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

export default function Activities() {
  const [votes, setVotes] = useState<{ [activity: string]: number }>({});
  const { toast } = useToast();

  useEffect(() => {
    const savedVotes = storage.getVotes();
    setVotes(savedVotes);
  }, []);

  const handleVote = (activityId: string) => {
    const updatedVotes = {
      ...votes,
      [activityId]: (votes[activityId] || 0) + 1
    };
    
    setVotes(updatedVotes);
    storage.setVotes(updatedVotes);
    
    toast({
      title: "Vote Recorded!",
      description: `Your vote for ${activityId.replace('-', ' ')} has been counted.`
    });
  };

  return (
    <div className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center mb-8">
          <Vote className="h-8 w-8 text-golf-green mr-3" />
          <h1 className="text-3xl font-bold text-golf-green">Friday Activities Voting</h1>
        </div>
        
        <ActivityVoting votes={votes} onVote={handleVote} />
      </div>
    </div>
  );
}
