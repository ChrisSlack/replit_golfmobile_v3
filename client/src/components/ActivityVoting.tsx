import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { activityOptions } from "@/lib/courseData";
import { Umbrella, Waves, Landmark, Mountain, Vote } from "lucide-react";

interface ActivityVotingProps {
  votes: { [activity: string]: number };
  onVote: (activityId: string) => void;
}

export default function ActivityVoting({ votes, onVote }: ActivityVotingProps) {
  const categories = [
    { 
      name: 'Beach Options', 
      icon: <Umbrella className="h-5 w-5" />, 
      color: 'text-blue-500',
      activities: activityOptions.filter(a => a.category === 'Beach Options')
    },
    { 
      name: 'Water Activities', 
      icon: <Waves className="h-5 w-5" />, 
      color: 'text-cyan-500',
      activities: activityOptions.filter(a => a.category === 'Water Activities')
    },
    { 
      name: 'Cultural Experiences', 
      icon: <Landmark className="h-5 w-5" />, 
      color: 'text-yellow-600',
      activities: activityOptions.filter(a => a.category === 'Cultural Experiences')
    },
    { 
      name: 'Adventure Activities', 
      icon: <Mountain className="h-5 w-5" />, 
      color: 'text-red-500',
      activities: activityOptions.filter(a => a.category === 'Adventure Activities')
    }
  ];

  const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0);
  const leadingActivity = Object.keys(votes).length > 0 
    ? Object.keys(votes).reduce((a, b) => votes[a] > votes[b] ? a : b)
    : '';

  const getActivityName = (activityId: string) => {
    const activity = activityOptions.find(a => a.id === activityId);
    return activity ? activity.name : activityId.replace('-', ' ');
  };

  return (
    <div className="space-y-8">
      {/* Voting Header */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-6 text-center">
          <h2 className="text-xl font-bold text-golf-green mb-2">Free Day - July 4, 2025</h2>
          <p className="text-gray-700">Vote for your preferred activities! Multiple votes allowed.</p>
        </CardContent>
      </Card>

      {/* Activity Categories */}
      {categories.map(category => (
        <Card key={category.name}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span className={category.color}>{category.icon}</span>
              <span>{category.name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {category.activities.map(activity => {
                const voteCount = votes[activity.id] || 0;
                return (
                  <div key={activity.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="mb-3">
                      <h4 className="font-bold text-golf-green mb-2">{activity.name}</h4>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <Button 
                        onClick={() => onVote(activity.id)}
                        className="golf-green text-white hover:golf-light"
                      >
                        <Vote className="h-4 w-4 mr-2" />
                        Vote
                      </Button>
                      <Badge variant="outline" className="border-golf-green text-golf-green">
                        {voteCount} vote{voteCount !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Voting Results Summary */}
      <Card className="golf-green text-white">
        <CardHeader>
          <CardTitle>Current Voting Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="golf-light rounded-lg p-4">
              <h4 className="font-bold mb-2">Leading Activity</h4>
              <p>
                {leadingActivity 
                  ? `${getActivityName(leadingActivity)} (${votes[leadingActivity]} votes)`
                  : 'Start voting to see results!'
                }
              </p>
            </div>
            <div className="golf-light rounded-lg p-4">
              <h4 className="font-bold mb-2">Total Votes Cast</h4>
              <p>{totalVotes}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
