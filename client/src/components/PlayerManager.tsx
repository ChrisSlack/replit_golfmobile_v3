import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Trash2, UserPlus, Users } from "lucide-react";
import { storage } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

interface PlayerManagerProps {
  players: string[];
  onPlayersChange: (players: string[]) => void;
}

export default function PlayerManager({ players, onPlayersChange }: PlayerManagerProps) {
  const [newPlayerName, setNewPlayerName] = useState("");
  const { toast } = useToast();

  const addPlayer = () => {
    const name = newPlayerName.trim();
    if (!name) {
      toast({
        title: "Error",
        description: "Please enter a player name",
        variant: "destructive"
      });
      return;
    }

    if (players.includes(name)) {
      toast({
        title: "Error", 
        description: "Player already exists",
        variant: "destructive"
      });
      return;
    }

    const updatedPlayers = [...players, name];
    onPlayersChange(updatedPlayers);
    storage.setPlayers(updatedPlayers);
    setNewPlayerName("");
    
    toast({
      title: "Success",
      description: `${name} added to the group`
    });
  };

  const removePlayer = (playerName: string) => {
    const updatedPlayers = players.filter(p => p !== playerName);
    onPlayersChange(updatedPlayers);
    storage.setPlayers(updatedPlayers);
    
    toast({
      title: "Player Removed",
      description: `${playerName} removed from the group`
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addPlayer();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>Player Management</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="new-player-name" className="text-sm font-medium mb-2 block">
              Add New Player
            </Label>
            <div className="flex gap-2">
              <Input
                id="new-player-name"
                placeholder="Player Name"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={addPlayer} className="golf-green text-white">
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Current Players ({players.length})
            </Label>
            {players.length === 0 ? (
              <p className="text-gray-500 text-sm">No players added yet</p>
            ) : (
              <div className="space-y-2">
                {players.map((player) => (
                  <div key={player} className="flex items-center justify-between bg-white px-3 py-2 rounded border">
                    <Badge variant="outline" className="border-golf-green text-golf-green">
                      {player}
                    </Badge>
                    <Button
                      onClick={() => removePlayer(player)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
