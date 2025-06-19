import type { Course, CourseHole } from "@/lib/types";
import type { Player } from "@shared/schema";

// Stableford scoring system
export function calculateStablefordPoints(grossScore: number, par: number, netScore: number): number {
  const scoreToPar = netScore - par;
  
  if (scoreToPar <= -3) return 5; // Albatross or better
  if (scoreToPar === -2) return 4; // Eagle
  if (scoreToPar === -1) return 3; // Birdie
  if (scoreToPar === 0) return 2;  // Par
  if (scoreToPar === 1) return 1;  // Bogey
  
  return 0; // Double bogey or worse
}

// Calculate net score using handicap strokes
export function calculateNetScore(grossScore: number, playerHandicap: number, holeHandicap: number): number {
  const strokesReceived = Math.floor(playerHandicap / 18) + (playerHandicap % 18 >= holeHandicap ? 1 : 0);
  return grossScore - strokesReceived;
}

// Get handicap strokes for a specific hole
export function getHoleHandicapStrokes(playerHandicap: number, holeHandicap: number): number {
  return Math.floor(playerHandicap / 18) + (playerHandicap % 18 >= holeHandicap ? 1 : 0);
}

// Calculate match result string (1UP, 2&1, AS, etc.)
export function calculateMatchResult(holesWon: number, holesLost: number, holesRemaining: number): string {
  const leadingBy = holesWon - holesLost;
  
  if (leadingBy === 0) return "AS"; // All Square
  
  if (Math.abs(leadingBy) > holesRemaining) {
    // Match is over
    return `${Math.abs(leadingBy)}&${holesRemaining + 1}`;
  }
  
  if (holesRemaining === 0) {
    // Match finished on 18th hole
    return `${Math.abs(leadingBy)}UP`;
  }
  
  // Match still ongoing
  return `${Math.abs(leadingBy)}UP`;
}

// Determine hole winner for betterball match
export function calculateHoleWinner(
  pairAStablefordPoints: number[], 
  pairBStablefordPoints: number[]
): 'teamA' | 'teamB' | 'tie' {
  const bestA = Math.max(...pairAStablefordPoints);
  const bestB = Math.max(...pairBStablefordPoints);
  
  if (bestA > bestB) return 'teamA';
  if (bestB > bestA) return 'teamB';
  return 'tie';
}

// Format team names for display
export function formatTeamMatch(teamAName: string, teamBName: string): string {
  return `${teamAName} vs ${teamBName}`;
}

// Validate matchplay pairing
export function validateMatchPairing(
  teamAPlayers: Player[], 
  teamBPlayers: Player[], 
  pairAPlayer1: number, 
  pairAPlayer2: number,
  pairBPlayer1: number, 
  pairBPlayer2: number
): boolean {
  const teamAIds = teamAPlayers.map(p => p.id);
  const teamBIds = teamBPlayers.map(p => p.id);
  
  return (
    teamAIds.includes(pairAPlayer1) &&
    teamAIds.includes(pairAPlayer2) &&
    teamBIds.includes(pairBPlayer1) &&
    teamBIds.includes(pairBPlayer2) &&
    pairAPlayer1 !== pairAPlayer2 &&
    pairBPlayer1 !== pairBPlayer2
  );
}

// Golf day mapping
export const GOLF_DAYS = {
  1: "July 2, 2025",
  2: "July 3, 2025", 
  3: "July 5, 2025"
} as const;

export type GolfDay = keyof typeof GOLF_DAYS;