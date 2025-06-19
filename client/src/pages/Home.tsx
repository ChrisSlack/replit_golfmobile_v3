import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Club, Users, Smartphone, CalendarDays, Flag, TrendingUp, Coins, Vote, Sun, ChevronLeft, ChevronRight, ExternalLink, Clock, Car, MapPin, Trophy } from "lucide-react";
import { scheduleData } from "@/lib/courseData";
import MatchplayLeaderboard from "@/components/MatchplayLeaderboard";
import Leaderboard from "@/components/Leaderboard";
import TeamLeaderboard from "@/components/TeamLeaderboard";
import CumulativeLeaderboard from "@/components/CumulativeLeaderboard";
import BetterballLeaderboard from "@/components/BetterballLeaderboard";
import { useQuery } from "@tanstack/react-query";
import type { Player, Team, Round, Score } from "@shared/schema";

// Course descriptions and details
const courseDetails = {
  "NAU Morgado Course": {
    description: "The NAU Morgado Golf & Country Club features an 18-hole, par-73 championship course designed by European Golf Design. Located in Portimão near the Monchique mountains, this course offers wide fairways, strategic bunkers, and scenic views.",
    website: "https://www.nauhotels.com/en/nau-morgado-golf-country-club",
    navigationTime: "35 minutes"
  },
  "Amendoeira Golf Resort": {
    description: "The Faldo Course at Amendoeira Golf Resort is a par-72 championship design by Sir Nick Faldo, requiring strategic play and careful positioning. This course won Portugal's Best Golf Course title in 2016 from World Golf Awards.",
    website: "https://www.amendoeiraresort.com",
    navigationTime: "25 minutes"
  },
  "Quinta do Lago South Course": {
    description: "Quinta do Lago is part of the prestigious Golden Triangle and has hosted the Portuguese Open multiple times. The South Course features the famous par-3 15th hole requiring a 200-meter shot over a lake.",
    website: "https://www.quintadolagocc.com/en/quinta-do-lago",
    navigationTime: "45 minutes"
  }
};

export default function Home() {
  const [currentDayIndex, setCurrentDayIndex] = useState(1); // Default to July 2nd
  const [leaderboardMode, setLeaderboardMode] = useState<'individual' | 'team'>('individual');
  const [scoreMode, setScoreMode] = useState<'gross' | 'net' | 'stableford'>('gross');
  
  const navigateDay = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentDayIndex > 0) {
      setCurrentDayIndex(currentDayIndex - 1);
    } else if (direction === 'next' && currentDayIndex < scheduleData.length - 1) {
      setCurrentDayIndex(currentDayIndex + 1);
    }
  };

  const currentSchedule = scheduleData[currentDayIndex];
  const courseDetail = currentSchedule.course ? courseDetails[currentSchedule.course as keyof typeof courseDetails] : null;

  // Fetch data for cumulative leaderboards
  const { data: players = [] } = useQuery<Player[]>({
    queryKey: ['/api/players']
  });

  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ['/api/teams']
  });

  const { data: rounds = [] } = useQuery<Round[]>({
    queryKey: ['/api/rounds']
  });

  const { data: allScores = [] } = useQuery<Score[]>({
    queryKey: ['/api/scores/all'],
    queryFn: () => fetch('/api/scores/all').then(res => res.json())
  });

  // Get current day's round for scoring
  const currentDayRound = rounds.find(r => r.day === currentDayIndex + 1) || rounds[0];

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="relative h-64 md:h-80 rounded-xl overflow-hidden mb-6 bg-gradient-to-r from-green-600 to-green-800 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">Portugal Golf Trip 2025</h1>
              <p className="text-xl md:text-2xl font-medium">July 1-6, 2025 • Vila Gale Cerro Alagoa</p>
            </div>
          </div>
        </div>



        {/* Enhanced Schedule with Navigation */}
        <Card className="golf-green text-white mb-8">
          <CardContent className="p-6">
            {/* Header with Navigation */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold flex items-center">
                <Calendar className="mr-3 h-6 w-6" />
                Trip Schedule
              </h2>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigateDay('prev')}
                  disabled={currentDayIndex === 0}
                  className="bg-white text-green-800 border-white hover:bg-green-100"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm px-3 bg-white text-green-800 rounded px-2 py-1">
                  Day {currentDayIndex + 1} of {scheduleData.length}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigateDay('next')}
                  disabled={currentDayIndex === scheduleData.length - 1}
                  className="bg-white text-green-800 border-white hover:bg-green-100"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Villa Gale Hotel Link */}
            {currentDayIndex === 0 && (
              <div className="mb-4 p-3 bg-blue-600 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5" />
                    <div>
                      <h4 className="font-bold">Villa Gale Cerro Alagoa</h4>
                      <p className="text-sm opacity-90">Our Base Hotel</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open('https://maps.google.com/?q=Villa+Gale+Cerro+Alagoa+Albufeira+Portugal', '_blank')}
                    className="bg-white text-blue-600 border-white hover:bg-blue-50"
                  >
                    <MapPin className="h-4 w-4 mr-1" />
                    Maps
                  </Button>
                </div>
              </div>
            )}

            {/* Current Day Content */}
            <div className="golf-light rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-lg font-medium">{currentSchedule.day}</p>
                <p className="text-sm opacity-75">{currentSchedule.date}</p>
              </div>
              
              {currentSchedule.course ? (
                <>
                  <h4 className="font-bold text-lg mb-2">{currentSchedule.course}</h4>
                  
                  {/* Course Description */}
                  {courseDetail && (
                    <div className="mb-3 p-2 bg-green-600 bg-opacity-50 rounded text-sm">
                      <p className="leading-relaxed">{courseDetail.description}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <div>
                        <span className="font-medium">Departure:</span>
                        <p className="font-bold">{currentSchedule.departure}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Car className="h-4 w-4" />
                      <div>
                        <span className="font-medium">Navigation:</span>
                        <p className="font-bold">{courseDetail?.navigationTime || currentSchedule.travelTime}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-golf-ball"></i>
                      <div>
                        <span className="font-medium">Tee Time:</span>
                        <p className="font-bold">{currentSchedule.teeTime}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <div>
                        <span className="font-medium">Pick Up:</span>
                        <p className="font-bold">{currentSchedule.pickupTime}</p>
                      </div>
                    </div>
                  </div>

                  {/* Course Links */}
                  {courseDetail && (
                    <div className="mt-3 pt-3 border-t border-green-600">
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(courseDetail.website, '_blank')}
                          className="bg-white text-green-800 border-white hover:bg-green-50"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Course Website
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(`https://maps.google.com/?q=${currentSchedule.course} Portugal`, '_blank')}
                          className="bg-white text-green-800 border-white hover:bg-green-50"
                        >
                          <MapPin className="h-4 w-4 mr-2" />
                          Course Maps
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open('https://maps.google.com/?q=Villa+Gale+Cerro+Alagoa+Albufeira+Portugal', '_blank')}
                          className="bg-white text-blue-600 border-white hover:bg-blue-50"
                        >
                          <MapPin className="h-4 w-4 mr-2" />
                          Back to Hotel
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <p className="text-sm">{currentSchedule.description}</p>
                  {currentSchedule.duration && (
                    <div className="flex items-center space-x-2 mt-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">Duration:</span>
                      <span className="font-bold">{currentSchedule.duration}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Navigation Cards - Below Schedule */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/courses">
            <Card className="hover:shadow-xl transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Flag className="text-golf-green h-8 w-8 mx-auto mb-3" />
                <h3 className="font-bold text-lg">3 Courses</h3>
                <p className="text-gray-600 text-sm">Premium Portuguese Golf</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/fines">
            <Card className="hover:shadow-xl transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Users className="text-golf-green h-8 w-8 mx-auto mb-3" />
                <h3 className="font-bold text-lg">Group Fun</h3>
                <p className="text-gray-600 text-sm">Banter & Competition</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/scoring">
            <Card className="hover:shadow-xl transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <TrendingUp className="text-golf-green h-8 w-8 mx-auto mb-3" />
                <h3 className="font-bold text-lg">Live Scoring</h3>
                <p className="text-gray-600 text-sm">Track Your Game</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Live Leaderboards - Show current day's data */}
        <div className="space-y-8">
          {/* Betterball Leaderboard */}
          <BetterballLeaderboard
            players={players || []}
            teams={teams || []}
            rounds={rounds || []}
            allScores={allScores || []}
          />

          {/* Individual Leaderboard */}
          <CumulativeLeaderboard
            players={players || []}
            teams={teams || []}
            scores={allScores || []}
            rounds={rounds || []}
            viewMode={leaderboardMode}
            scoreMode={scoreMode}
          />
        </div>
      </div>
    </div>
  );
}
