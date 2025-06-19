import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, AlertTriangle } from "lucide-react";
import { Fine } from "@shared/schema";

interface PlayerFinesDetailProps {
  playerId: number;
  playerName: string;
  onBack: () => void;
}

const golfDays = [
  { value: '2025-07-02', label: 'July 2 - NAU Morgado' },
  { value: '2025-07-03', label: 'July 3 - Amendoeira' },
  { value: '2025-07-05', label: 'July 5 - Quinta do Lago' }
];

export default function PlayerFinesDetail({ playerId, playerName, onBack }: PlayerFinesDetailProps) {
  const [selectedDay, setSelectedDay] = useState<string>('2025-07-02');

  const { data: playerFines = [], isLoading } = useQuery<Fine[]>({
    queryKey: [`/api/fines/${playerId}/${selectedDay}`],
    queryFn: () => fetch(`/api/fines/${playerId}/${selectedDay}`).then(res => res.json())
  });

  const totalAmount = playerFines.reduce((sum, fine) => sum + fine.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Leaderboard</span>
        </Button>
        <h2 className="text-2xl font-bold text-golf-green">{playerName}'s Fines</h2>
      </div>

      {/* Day Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Select Golf Day</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {golfDays.map(day => (
              <Button
                key={day.value}
                variant={selectedDay === day.value ? "default" : "outline"}
                onClick={() => setSelectedDay(day.value)}
                className={selectedDay === day.value ? "golf-green text-white" : ""}
              >
                {day.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Day Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-golf-green mb-2">{totalAmount}</div>
            <div className="text-gray-600">Total fines for {golfDays.find(d => d.value === selectedDay)?.label}</div>
            <div className="text-sm text-gray-500 mt-1">{playerFines.length} fines recorded</div>
          </div>
        </CardContent>
      </Card>

      {/* Fines List */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Fines</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading fines...</div>
            </div>
          ) : playerFines.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No fines recorded for this day.</p>
              <p className="text-sm text-gray-400 mt-1">Clean round!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {playerFines.map((fine, index) => (
                <div key={fine.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-golf-green text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{fine.type === 'custom' ? 'Custom Fine' : fine.type}</h4>
                        <p className="text-sm text-gray-600">{fine.description}</p>
                        <p className="text-xs text-gray-400">
                          {fine.createdAt ? new Date(fine.createdAt).toLocaleTimeString('en-GB', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          }) : 'Unknown time'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={`${fine.amount === 1 ? 'bg-yellow-500' : fine.amount >= 5 ? 'bg-red-600' : 'bg-orange-500'} text-white`}>
                      {fine.amount}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}