import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { courses } from "@/lib/courseData";
import { MapPin, Flag, Award, Info } from "lucide-react";

// Course data with comprehensive metrics
const courseMetrics = {
  "nau": {
    totalLength: "6,399m",
    longestHole: "535m (Par 5, Hole 3)",
    shortestHole: "166m (Par 3, Hole 11)",
    averageGreenSize: "600m²",
    courseRating: "72.7",
    slopeRating: "129",
    totalBunkers: "85+ (Scottish-style)",
    waterHazards: "4 lakes",
    signatureHole: "18th (Par 4, elevated tee)",
    yearOpened: "2003"
  },
  "amendoeira": {
    totalLength: "6,598m",
    longestHole: "613m (Par 5, Hole 9)",
    shortestHole: "138m (Par 3, Hole 16)",
    averageGreenSize: "550m²",
    courseRating: "74.5",
    slopeRating: "142",
    totalBunkers: "70+ (Desert-style)",
    waterHazards: "5 watercourses",
    signatureHole: "18th (Par 5, dogleg)",
    yearOpened: "2008"
  },
  "quinta": {
    totalLength: "6,488m",
    longestHole: "510m (Par 5, Hole 17)",
    shortestHole: "171m (Par 3, Hole 4)",
    averageGreenSize: "650m²",
    courseRating: "73.7",
    slopeRating: "139",
    totalBunkers: "60+ (Strategic placement)",
    waterHazards: "3 lakes (incl. Hole 15)",
    signatureHole: "15th (Par 3 over lake)",
    yearOpened: "1974"
  }
};

export default function Courses() {
  const getHardestHole = (courseHoles: any[]) => {
    const hardest = courseHoles.reduce((prev, current) => 
      (prev.handicap < current.handicap) ? prev : current
    );
    return hardest;
  };

  const getEasiestHole = (courseHoles: any[]) => {
    const easiest = courseHoles.reduce((prev, current) => 
      (prev.handicap > current.handicap) ? prev : current
    );
    return easiest;
  };

  return (
    <div className="py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-golf-green mb-8 text-center">Golf Courses</h1>
        
        {/* Comprehensive Comparative Metrics */}
        <Card className="mb-8 bg-white shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Comprehensive Comparative Metrics</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left p-3 font-semibold text-gray-900">Metric</th>
                    <th className="text-left p-3 font-semibold text-green-800">NAU Morgado</th>
                    <th className="text-left p-3 font-semibold text-blue-800">Amendoeira</th>
                    <th className="text-left p-3 font-semibold text-yellow-800">Quinta do Lago South</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-700">Total Length (White/Black Tees)</td>
                    <td className="p-3 text-green-800 font-semibold">{courseMetrics.nau.totalLength}</td>
                    <td className="p-3 text-blue-800 font-semibold">{courseMetrics.amendoeira.totalLength}</td>
                    <td className="p-3 text-yellow-800 font-semibold">{courseMetrics.quinta.totalLength}</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-700">Longest Hole</td>
                    <td className="p-3 text-green-800">{courseMetrics.nau.longestHole}</td>
                    <td className="p-3 text-blue-800">{courseMetrics.amendoeira.longestHole}</td>
                    <td className="p-3 text-yellow-800">{courseMetrics.quinta.longestHole}</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-700">Shortest Hole</td>
                    <td className="p-3 text-green-800">{courseMetrics.nau.shortestHole}</td>
                    <td className="p-3 text-blue-800">{courseMetrics.amendoeira.shortestHole}</td>
                    <td className="p-3 text-yellow-800">{courseMetrics.quinta.shortestHole}</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-700">Average Green Size</td>
                    <td className="p-3 text-green-800">{courseMetrics.nau.averageGreenSize}</td>
                    <td className="p-3 text-blue-800">{courseMetrics.amendoeira.averageGreenSize}</td>
                    <td className="p-3 text-yellow-800">{courseMetrics.quinta.averageGreenSize}</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-700">Course Rating (Black)</td>
                    <td className="p-3 text-green-800">{courseMetrics.nau.courseRating}</td>
                    <td className="p-3 text-blue-800">{courseMetrics.amendoeira.courseRating}</td>
                    <td className="p-3 text-yellow-800">{courseMetrics.quinta.courseRating}</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-700">Slope Rating (Black)</td>
                    <td className="p-3 text-green-800">{courseMetrics.nau.slopeRating}</td>
                    <td className="p-3 text-blue-800">{courseMetrics.amendoeira.slopeRating}</td>
                    <td className="p-3 text-yellow-800">{courseMetrics.quinta.slopeRating}</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-700">Total Bunkers</td>
                    <td className="p-3 text-green-800">{courseMetrics.nau.totalBunkers}</td>
                    <td className="p-3 text-blue-800">{courseMetrics.amendoeira.totalBunkers}</td>
                    <td className="p-3 text-yellow-800">{courseMetrics.quinta.totalBunkers}</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-700">Water Hazards</td>
                    <td className="p-3 text-green-800">{courseMetrics.nau.waterHazards}</td>
                    <td className="p-3 text-blue-800">{courseMetrics.amendoeira.waterHazards}</td>
                    <td className="p-3 text-yellow-800">{courseMetrics.quinta.waterHazards}</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-700">Signature Hole</td>
                    <td className="p-3 text-green-800">{courseMetrics.nau.signatureHole}</td>
                    <td className="p-3 text-blue-800">{courseMetrics.amendoeira.signatureHole}</td>
                    <td className="p-3 text-yellow-800">{courseMetrics.quinta.signatureHole}</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-700">Year Opened</td>
                    <td className="p-3 text-green-800">{courseMetrics.nau.yearOpened}</td>
                    <td className="p-3 text-blue-800">{courseMetrics.amendoeira.yearOpened}</td>
                    <td className="p-3 text-yellow-800">{courseMetrics.quinta.yearOpened}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-8">
          {courses.map((course, index) => {
            const hardestHole = getHardestHole(course.holes);
            const easiestHole = getEasiestHole(course.holes);
            const totalYardage = course.holes.reduce((sum, hole) => sum + hole.yardage, 0);
            
            return (
              <Card key={course.id} className="bg-white shadow-lg overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className={`${index % 2 === 1 ? 'order-2 lg:order-1' : 'order-1 lg:order-2'} p-6`}>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold text-golf-green">{course.name}</h2>
                      <Badge variant="outline" className="border-golf-green text-golf-green">
                        Par {course.par}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{course.description}</p>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700 flex items-center">
                          <Flag className="h-4 w-4 mr-2" />
                          Par:
                        </span>
                        <span className="font-bold text-golf-green">{course.par}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700 flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          Total Length:
                        </span>
                        <span className="font-bold text-golf-green">{totalYardage.toLocaleString()}m</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">Holes:</span>
                        <span className="font-bold text-golf-green">18</span>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4 mb-4">
                      <h4 className="font-bold text-golf-green mb-2 flex items-center">
                        <Info className="h-4 w-4 mr-2" />
                        Course Highlights
                      </h4>
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Hardest Hole:</strong> #{hardestHole.hole} (Par {hardestHole.par}, {hardestHole.yardage}m)
                      </p>
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Easiest Hole:</strong> #{easiestHole.hole} (Par {easiestHole.par}, {easiestHole.yardage}m)
                      </p>
                      {course.signatureHole && (
                        <p className="text-sm text-gray-700">
                          <strong>Signature Hole:</strong> {course.signatureHole}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Button 
                        className="w-full golf-green text-white hover:golf-light"
                        onClick={() => {
                          // Scroll to scorecard section or open modal
                          const scorecardSection = document.getElementById(`scorecard-${course.id}`);
                          if (scorecardSection) {
                            scorecardSection.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                      >
                        <Award className="h-4 w-4 mr-2" />
                        View Full Scorecard
                      </Button>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline"
                          className="flex-1"
                          onClick={() => window.open(`https://maps.google.com/?q=${course.name} Portugal`, '_blank')}
                        >
                          <MapPin className="h-4 w-4 mr-2" />
                          Course Maps
                        </Button>
                        <Button 
                          variant="outline"
                          className="flex-1"
                          onClick={() => window.open('https://maps.google.com/?q=Villa+Gale+Cerro+Alagoa+Albufeira+Portugal', '_blank')}
                        >
                          <MapPin className="h-4 w-4 mr-2" />
                          Back to Hotel
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`${index % 2 === 1 ? 'order-1 lg:order-2' : 'order-2 lg:order-1'} h-64 lg:h-auto`}>
                    <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                      <div className="text-white text-center">
                        <i className="fas fa-golf-ball text-6xl mb-4 opacity-20"></i>
                        <p className="text-sm opacity-75">{course.name}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Full Scorecard */}
                <div id={`scorecard-${course.id}`} className="p-6 bg-gray-50 border-t">
                  <h3 className="text-xl font-bold text-golf-green mb-4">Full Scorecard</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="golf-green text-white">
                          <th className="px-3 py-2 text-left">Hole</th>
                          <th className="px-3 py-2 text-center">Par</th>
                          <th className="px-3 py-2 text-center">Yardage</th>
                          <th className="px-3 py-2 text-center">Handicap</th>
                        </tr>
                      </thead>
                      <tbody>
                        {course.holes.map((hole) => (
                          <tr key={hole.hole} className="border-b hover:bg-gray-50">
                            <td className="px-3 py-2 font-medium">{hole.hole}</td>
                            <td className="px-3 py-2 text-center font-medium">{hole.par}</td>
                            <td className="px-3 py-2 text-center">{hole.yardage}m</td>
                            <td className="px-3 py-2 text-center">{hole.handicap}</td>
                          </tr>
                        ))}
                        <tr className="golf-green text-white font-bold">
                          <td className="px-3 py-2">TOTAL</td>
                          <td className="px-3 py-2 text-center">{course.par}</td>
                          <td className="px-3 py-2 text-center">{totalYardage.toLocaleString()}m</td>
                          <td className="px-3 py-2 text-center">-</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
