import { 
  players, teams, rounds, scores, fines, votes, matches, individualMatches, stablefordScores, holeResults,
  type Player, type Team, type Round, type Score, type Fine, type Vote, type Match, type IndividualMatch, type StablefordScore, type HoleResult,
  type InsertPlayer, type InsertTeam, type InsertRound, type InsertScore, type InsertFine, type InsertVote, type InsertMatch, type InsertIndividualMatch, type InsertStablefordScore, type InsertHoleResult
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Players
  getPlayers(): Promise<Player[]>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  updatePlayer(id: number, player: Partial<InsertPlayer>): Promise<Player>;
  deletePlayer(id: number): Promise<void>;
  getPlayerById(id: number): Promise<Player | undefined>;
  
  // Teams
  getTeams(): Promise<Team[]>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: number, team: Partial<InsertTeam>): Promise<Team>;
  deleteTeam(id: number): Promise<void>;
  getTeamById(id: number): Promise<Team | undefined>;
  getTeamPlayers(teamId: number): Promise<Player[]>;
  
  // Rounds
  getRounds(): Promise<Round[]>;
  createRound(round: InsertRound): Promise<Round>;
  updateRound(id: number, round: Partial<InsertRound>): Promise<Round>;
  deleteRound(id: number): Promise<void>;
  
  // Scores
  getScores(roundId: number): Promise<Score[]>;
  getAllScores(): Promise<Score[]>;
  createScore(score: InsertScore): Promise<Score>;
  updateScore(id: number, scoreData: Partial<InsertScore>): Promise<Score>;
  clearRoundScores(roundId: number): Promise<void>;
  
  // Fines
  getFines(): Promise<Fine[]>;
  getFinesByPlayerAndDay(playerId: number, golfDay: string): Promise<Fine[]>;
  createFine(fine: InsertFine): Promise<Fine>;
  
  // Votes
  getVotes(): Promise<Vote[]>;
  createVote(vote: InsertVote): Promise<Vote>;
  updateVote(id: number, count: number): Promise<Vote>;
  getVoteByActivity(activity: string): Promise<Vote | undefined>;
  
  // Matchplay functionality
  // Matches
  getMatches(roundId: number): Promise<Match[]>;
  createMatch(match: InsertMatch): Promise<Match>;
  updateMatch(id: number, match: Partial<InsertMatch>): Promise<Match>;
  deleteMatch(id: number): Promise<void>;
  
  // Individual matches
  getIndividualMatches(roundId: number): Promise<IndividualMatch[]>;
  createIndividualMatch(match: InsertIndividualMatch): Promise<IndividualMatch>;
  updateIndividualMatch(id: number, match: Partial<InsertIndividualMatch>): Promise<IndividualMatch>;
  
  // Stableford scores
  getStablefordScores(roundId: number): Promise<StablefordScore[]>;
  createStablefordScore(score: InsertStablefordScore): Promise<StablefordScore>;
  updateStablefordScore(id: number, score: Partial<InsertStablefordScore>): Promise<StablefordScore>;
  
  // Hole results
  getHoleResults(matchId: number): Promise<HoleResult[]>;
  createHoleResult(result: InsertHoleResult): Promise<HoleResult>;
  updateHoleResult(id: number, result: Partial<InsertHoleResult>): Promise<HoleResult>;
}

export class MemStorage implements IStorage {
  private players: Map<number, Player> = new Map();
  private teams: Map<number, Team> = new Map();
  private rounds: Map<number, Round> = new Map();
  private scores: Map<number, Score> = new Map();
  private fines: Map<number, Fine> = new Map();
  private votes: Map<number, Vote> = new Map();
  private currentId = 1;

  // Players
  async getPlayers(): Promise<Player[]> {
    return Array.from(this.players.values());
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const id = this.currentId++;
    const player: Player = { 
      ...insertPlayer,
      handicap: insertPlayer.handicap || null,
      teamId: insertPlayer.teamId || null,
      id, 
      createdAt: new Date()
    };
    this.players.set(id, player);
    return player;
  }

  async updatePlayer(id: number, updateData: Partial<InsertPlayer>): Promise<Player> {
    const player = this.players.get(id);
    if (!player) throw new Error('Player not found');
    
    const updatedPlayer = { 
      ...player, 
      ...updateData,
      handicap: updateData.handicap !== undefined ? updateData.handicap : player.handicap,
      teamId: updateData.teamId !== undefined ? updateData.teamId : player.teamId
    };
    this.players.set(id, updatedPlayer);
    return updatedPlayer;
  }

  async deletePlayer(id: number): Promise<void> {
    this.players.delete(id);
  }

  async getPlayerById(id: number): Promise<Player | undefined> {
    return this.players.get(id);
  }

  // Teams
  async getTeams(): Promise<Team[]> {
    return Array.from(this.teams.values());
  }

  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const id = this.currentId++;
    const team: Team = {
      ...insertTeam,
      captainId: insertTeam.captainId || null,
      id,
      createdAt: new Date()
    };
    this.teams.set(id, team);
    return team;
  }

  async updateTeam(id: number, updateData: Partial<InsertTeam>): Promise<Team> {
    const team = this.teams.get(id);
    if (!team) throw new Error('Team not found');
    
    const updatedTeam = { 
      ...team, 
      ...updateData,
      captainId: updateData.captainId !== undefined ? updateData.captainId : team.captainId
    };
    this.teams.set(id, updatedTeam);
    return updatedTeam;
  }

  async deleteTeam(id: number): Promise<void> {
    this.teams.delete(id);
  }

  async getTeamById(id: number): Promise<Team | undefined> {
    return this.teams.get(id);
  }

  async getTeamPlayers(teamId: number): Promise<Player[]> {
    return Array.from(this.players.values()).filter(player => player.teamId === teamId);
  }

  // Rounds
  async getRounds(): Promise<Round[]> {
    return Array.from(this.rounds.values());
  }

  async createRound(insertRound: InsertRound): Promise<Round> {
    const id = this.currentId++;
    const round: Round = {
      course: insertRound.course,
      date: insertRound.date,
      players: insertRound.players as string[],
      format: insertRound.format || "stroke",
      day: insertRound.day || null,
      id,
      createdAt: new Date()
    };
    this.rounds.set(id, round);
    return round;
  }

  async updateRound(id: number, updateData: Partial<InsertRound>): Promise<Round> {
    const round = this.rounds.get(id);
    if (!round) throw new Error('Round not found');
    
    const updatedRound = { ...round, ...updateData };
    this.rounds.set(id, updatedRound);
    return updatedRound;
  }

  async deleteRound(id: number): Promise<void> {
    this.rounds.delete(id);
    // Also delete associated scores
    for (const [scoreId, score] of Array.from(this.scores.entries())) {
      if (score.roundId === id) {
        this.scores.delete(scoreId);
      }
    }
  }

  // Scores
  async getScores(roundId: number): Promise<Score[]> {
    return Array.from(this.scores.values()).filter(score => score.roundId === roundId);
  }

  async getAllScores(): Promise<Score[]> {
    return Array.from(this.scores.values());
  }

  async createScore(insertScore: InsertScore): Promise<Score> {
    const id = this.currentId++;
    const score: Score = {
      ...insertScore,
      threePutt: insertScore.threePutt || false,
      pickedUp: insertScore.pickedUp || false,
      inWater: insertScore.inWater || false,
      inBunker: insertScore.inBunker || false,
      id,
      createdAt: new Date()
    };
    this.scores.set(id, score);
    return score;
  }

  async updateScore(id: number, scoreData: Partial<InsertScore>): Promise<Score> {
    const score = this.scores.get(id);
    if (!score) throw new Error('Score not found');
    
    const updatedScore = { 
      ...score, 
      ...scoreData,
      threePutt: scoreData.threePutt !== undefined ? scoreData.threePutt : score.threePutt,
      pickedUp: scoreData.pickedUp !== undefined ? scoreData.pickedUp : score.pickedUp,
      inWater: scoreData.inWater !== undefined ? scoreData.inWater : score.inWater,
      inBunker: scoreData.inBunker !== undefined ? scoreData.inBunker : score.inBunker
    };
    this.scores.set(id, updatedScore);
    return updatedScore;
  }

  async clearRoundScores(roundId: number): Promise<void> {
    // Delete all scores for the given round
    for (const [scoreId, score] of Array.from(this.scores.entries())) {
      if (score.roundId === roundId) {
        this.scores.delete(scoreId);
      }
    }
  }

  // Fines
  async getFines(): Promise<Fine[]> {
    return Array.from(this.fines.values());
  }

  async getFinesByPlayerAndDay(playerId: number, golfDay: string): Promise<Fine[]> {
    return Array.from(this.fines.values()).filter(fine => 
      fine.playerId === playerId && fine.golfDay === golfDay
    );
  }

  async createFine(insertFine: InsertFine): Promise<Fine> {
    const id = this.currentId++;
    const fine: Fine = {
      ...insertFine,
      description: insertFine.description || null,
      id,
      createdAt: new Date()
    };
    this.fines.set(id, fine);
    return fine;
  }

  // Votes
  async getVotes(): Promise<Vote[]> {
    return Array.from(this.votes.values());
  }

  async createVote(insertVote: InsertVote): Promise<Vote> {
    const id = this.currentId++;
    const vote: Vote = {
      ...insertVote,
      count: insertVote.count || 0,
      id,
      createdAt: new Date()
    };
    this.votes.set(id, vote);
    return vote;
  }

  async updateVote(id: number, count: number): Promise<Vote> {
    const vote = this.votes.get(id);
    if (!vote) throw new Error('Vote not found');
    
    const updatedVote = { ...vote, count };
    this.votes.set(id, updatedVote);
    return updatedVote;
  }

  async getVoteByActivity(activity: string): Promise<Vote | undefined> {
    return Array.from(this.votes.values()).find(vote => vote.activity === activity);
  }

  // Matchplay functionality - Stub implementations for MemStorage
  async getMatches(roundId: number): Promise<Match[]> { return []; }
  async createMatch(match: InsertMatch): Promise<Match> { throw new Error('Matchplay not supported in MemStorage'); }
  async updateMatch(id: number, match: Partial<InsertMatch>): Promise<Match> { throw new Error('Matchplay not supported in MemStorage'); }
  async deleteMatch(id: number): Promise<void> { throw new Error('Matchplay not supported in MemStorage'); }
  async getIndividualMatches(roundId: number): Promise<IndividualMatch[]> { return []; }
  async createIndividualMatch(match: InsertIndividualMatch): Promise<IndividualMatch> { throw new Error('Matchplay not supported in MemStorage'); }
  async updateIndividualMatch(id: number, match: Partial<InsertIndividualMatch>): Promise<IndividualMatch> { throw new Error('Matchplay not supported in MemStorage'); }
  async getStablefordScores(roundId: number): Promise<StablefordScore[]> { return []; }
  async createStablefordScore(score: InsertStablefordScore): Promise<StablefordScore> { throw new Error('Stableford not supported in MemStorage'); }
  async updateStablefordScore(id: number, score: Partial<InsertStablefordScore>): Promise<StablefordScore> { throw new Error('Stableford not supported in MemStorage'); }
  async getHoleResults(matchId: number): Promise<HoleResult[]> { return []; }
  async createHoleResult(result: InsertHoleResult): Promise<HoleResult> { throw new Error('Hole results not supported in MemStorage'); }
  async updateHoleResult(id: number, result: Partial<InsertHoleResult>): Promise<HoleResult> { throw new Error('Hole results not supported in MemStorage'); }
}

export class DatabaseStorage implements IStorage {
  
  async initializeSampleData() {
    // Check if we already have players
    const existingPlayers = await this.getPlayers();
    if (existingPlayers.length >= 8) {
      return; // Already initialized
    }

    // Create 8 players
    const playerNames = [
      ["John", "Doe"], ["Jane", "Smith"], ["Chris", "Slack"], ["Mike", "Johnson"],
      ["Sarah", "Wilson"], ["David", "Brown"], ["Emma", "Davis"], ["Tom", "Miller"]
    ];

    const players = [];
    for (const [firstName, lastName] of playerNames) {
      const player = await this.createPlayer({
        firstName,
        lastName,
        handicap: `${Math.floor(Math.random() * 28) + 1}`, // Random handicap 1-28
        teamId: null
      });
      players.push(player);
    }

    // Create 2 teams with 4 players each
    const team1 = await this.createTeam({
      name: "Team A",
      captainId: players[0].id
    });

    const team2 = await this.createTeam({
      name: "Team B", 
      captainId: players[4].id
    });

    // Assign players to teams
    for (let i = 0; i < 4; i++) {
      await this.updatePlayer(players[i].id, { teamId: team1.id });
    }
    for (let i = 4; i < 8; i++) {
      await this.updatePlayer(players[i].id, { teamId: team2.id });
    }
  }
  // Players
  async getPlayers(): Promise<Player[]> {
    return await db.select().from(players);
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const [player] = await db.insert(players).values(insertPlayer).returning();
    return player;
  }

  async updatePlayer(id: number, updateData: Partial<InsertPlayer>): Promise<Player> {
    const [player] = await db
      .update(players)
      .set(updateData)
      .where(eq(players.id, id))
      .returning();
    return player;
  }

  async deletePlayer(id: number): Promise<void> {
    await db.delete(players).where(eq(players.id, id));
  }

  async getPlayerById(id: number): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.id, id));
    return player;
  }

  // Teams
  async getTeams(): Promise<Team[]> {
    return await db.select().from(teams);
  }

  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const [team] = await db.insert(teams).values(insertTeam).returning();
    return team;
  }

  async updateTeam(id: number, updateData: Partial<InsertTeam>): Promise<Team> {
    const [team] = await db
      .update(teams)
      .set(updateData)
      .where(eq(teams.id, id))
      .returning();
    return team;
  }

  async deleteTeam(id: number): Promise<void> {
    await db.delete(teams).where(eq(teams.id, id));
  }

  async getTeamById(id: number): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team;
  }

  async getTeamPlayers(teamId: number): Promise<Player[]> {
    return await db.select().from(players).where(eq(players.teamId, teamId));
  }

  // Rounds
  async getRounds(): Promise<Round[]> {
    return await db.select().from(rounds);
  }

  async createRound(insertRound: InsertRound): Promise<Round> {
    console.log("Creating round with data:", insertRound);
    try {
      const [round] = await db.insert(rounds).values({
        course: insertRound.course,
        date: insertRound.date,
        players: insertRound.players as string[],
        format: insertRound.format || "stroke",
        day: insertRound.day || null
      }).returning();
      console.log("Round created:", round);
      return round;
    } catch (error) {
      console.error("Database round creation error:", error);
      throw error;
    }
  }

  async updateRound(id: number, updateData: Partial<InsertRound>): Promise<Round> {
    const [updatedRound] = await db
      .update(rounds)
      .set(updateData)
      .where(eq(rounds.id, id))
      .returning();
    
    if (!updatedRound) {
      throw new Error('Round not found');
    }
    
    return updatedRound;
  }

  async deleteRound(id: number): Promise<void> {
    console.log("Deleting round:", id);
    // Delete associated scores first
    await db.delete(scores).where(eq(scores.roundId, id));
    // Then delete the round
    await db.delete(rounds).where(eq(rounds.id, id));
    console.log("Round and associated scores deleted");
  }

  // Scores
  async getScores(roundId: number): Promise<Score[]> {
    console.log("Fetching scores for round:", roundId);
    const result = await db.select().from(scores).where(eq(scores.roundId, roundId));
    console.log("Found scores:", result);
    return result;
  }

  async getAllScores(): Promise<Score[]> {
    return await db.select().from(scores);
  }

  async createScore(insertScore: InsertScore): Promise<Score> {
    console.log("Creating score in database with data:", insertScore);
    const [score] = await db.insert(scores).values(insertScore).returning();
    console.log("Score created in database:", score);
    return score;
  }

  async updateScore(id: number, scoreData: Partial<InsertScore>): Promise<Score> {
    const [score] = await db
      .update(scores)
      .set(scoreData)
      .where(eq(scores.id, id))
      .returning();
    return score;
  }

  async clearRoundScores(roundId: number): Promise<void> {
    console.log("Clearing all scores for round:", roundId);
    await db.delete(scores).where(eq(scores.roundId, roundId));
    console.log("Round scores cleared");
  }

  // Fines
  async getFines(): Promise<Fine[]> {
    return await db.select().from(fines);
  }

  async getFinesByPlayerAndDay(playerId: number, golfDay: string): Promise<Fine[]> {
    const allFines = await db.select().from(fines).where(eq(fines.playerId, playerId));
    return allFines.filter(fine => fine.golfDay === golfDay);
  }

  async createFine(insertFine: InsertFine): Promise<Fine> {
    const [fine] = await db.insert(fines).values(insertFine).returning();
    return fine;
  }

  // Votes
  async getVotes(): Promise<Vote[]> {
    return await db.select().from(votes);
  }

  async createVote(insertVote: InsertVote): Promise<Vote> {
    const [vote] = await db.insert(votes).values(insertVote).returning();
    return vote;
  }

  async updateVote(id: number, count: number): Promise<Vote> {
    const [vote] = await db
      .update(votes)
      .set({ count })
      .where(eq(votes.id, id))
      .returning();
    return vote;
  }

  async getVoteByActivity(activity: string): Promise<Vote | undefined> {
    const [vote] = await db.select().from(votes).where(eq(votes.activity, activity));
    return vote;
  }

  // Matchplay functionality
  // Matches
  async getMatches(roundId: number): Promise<Match[]> {
    return await db.select().from(matches).where(eq(matches.roundId, roundId));
  }

  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    const [match] = await db.insert(matches).values(insertMatch).returning();
    return match;
  }

  async updateMatch(id: number, matchData: Partial<InsertMatch>): Promise<Match> {
    const [match] = await db
      .update(matches)
      .set(matchData)
      .where(eq(matches.id, id))
      .returning();
    return match;
  }

  async deleteMatch(id: number): Promise<void> {
    await db.delete(matches).where(eq(matches.id, id));
  }

  // Individual matches
  async getIndividualMatches(roundId: number): Promise<IndividualMatch[]> {
    return await db.select().from(individualMatches).where(eq(individualMatches.roundId, roundId));
  }

  async createIndividualMatch(insertMatch: InsertIndividualMatch): Promise<IndividualMatch> {
    const [match] = await db.insert(individualMatches).values(insertMatch).returning();
    return match;
  }

  async updateIndividualMatch(id: number, matchData: Partial<InsertIndividualMatch>): Promise<IndividualMatch> {
    const [match] = await db
      .update(individualMatches)
      .set(matchData)
      .where(eq(individualMatches.id, id))
      .returning();
    return match;
  }

  // Stableford scores
  async getStablefordScores(roundId: number): Promise<StablefordScore[]> {
    return await db.select().from(stablefordScores).where(eq(stablefordScores.roundId, roundId));
  }

  async createStablefordScore(insertScore: InsertStablefordScore): Promise<StablefordScore> {
    const [score] = await db.insert(stablefordScores).values(insertScore).returning();
    return score;
  }

  async updateStablefordScore(id: number, scoreData: Partial<InsertStablefordScore>): Promise<StablefordScore> {
    const [score] = await db
      .update(stablefordScores)
      .set(scoreData)
      .where(eq(stablefordScores.id, id))
      .returning();
    return score;
  }

  // Hole results
  async getHoleResults(matchId: number): Promise<HoleResult[]> {
    return await db.select().from(holeResults).where(eq(holeResults.matchId, matchId));
  }

  async createHoleResult(insertResult: InsertHoleResult): Promise<HoleResult> {
    const [result] = await db.insert(holeResults).values(insertResult).returning();
    return result;
  }

  async updateHoleResult(id: number, resultData: Partial<InsertHoleResult>): Promise<HoleResult> {
    const [result] = await db
      .update(holeResults)
      .set(resultData)
      .where(eq(holeResults.id, id))
      .returning();
    return result;
  }
}

const dbStorage = new DatabaseStorage();
// Initialize sample data on startup
dbStorage.initializeSampleData().catch(console.error);
export const storage = dbStorage;
