import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Coins } from "lucide-react";
import FinesTracker from "@/components/FinesTracker";
import { Player, Fine } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface FineWithPlayerName {
  id: string;
  player: string;
  type: string;
  amount: number;
  description: string;
  golfDay: string;
  timestamp: string;
}

export default function Fines() {
  const queryClient = useQueryClient();

  const { data: players = [] } = useQuery<Player[]>({
    queryKey: ['/api/players']
  });

  const { data: dbFines = [] } = useQuery<Fine[]>({
    queryKey: ['/api/fines']
  });

  // Convert database fines to component format
  const fines: FineWithPlayerName[] = dbFines.map(fine => {
    const player = players.find(p => p.id === fine.playerId);
    const playerName = player ? `${player.firstName} ${player.lastName}`.trim() : 'Unknown Player';
    
    // Handle createdAt as either Date object or string
    let timestamp: string;
    if (fine.createdAt) {
      timestamp = fine.createdAt instanceof Date 
        ? fine.createdAt.toISOString() 
        : new Date(fine.createdAt).toISOString();
    } else {
      timestamp = new Date().toISOString();
    }
    
    return {
      id: fine.id.toString(),
      player: playerName,
      type: fine.type,
      amount: fine.amount,
      description: fine.description || '',
      golfDay: fine.golfDay || '2025-07-02',
      timestamp: timestamp
    };
  });

  const playerNames = players.map(p => `${p.firstName} ${p.lastName}`.trim());

  const addFineMutation = useMutation({
    mutationFn: async (fineData: { player: string; type: string; amount: number; description: string; golfDay: string }) => {
      const player = players.find(p => `${p.firstName} ${p.lastName}`.trim() === fineData.player);
      if (!player) throw new Error('Player not found');

      const response = await fetch('/api/fines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerId: player.id,
          type: fineData.type,
          amount: fineData.amount,
          description: fineData.description,
          golfDay: fineData.golfDay
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add fine');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fines'] });
    }
  });

  const handleAddFine = (fineData: Omit<FineWithPlayerName, 'id' | 'timestamp'>) => {
    addFineMutation.mutate(fineData);
  };

  return (
    <div className="py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center mb-8">
          <Coins className="h-8 w-8 text-golf-gold mr-3" />
          <h1 className="text-3xl font-bold text-golf-green">Fines Tracker</h1>
        </div>
        
        <FinesTracker
          players={playerNames}
          fines={fines}
          onAddFine={handleAddFine}
        />
      </div>
    </div>
  );
}
