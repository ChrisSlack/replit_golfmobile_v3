import { pgTable, text, serial, integer, boolean, timestamp, json, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  handicap: decimal("handicap", { precision: 4, scale: 1 }),
  teamId: integer("team_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  captainId: integer("captain_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rounds = pgTable("rounds", {
  id: serial("id").primaryKey(),
  course: text("course").notNull(),
  date: text("date").notNull(),
  players: json("players").$type<string[]>().notNull(),
  format: text("format").notNull().default("stroke"), // 'stroke', 'betterball', 'matchplay'
  day: integer("day"), // Golf day (1, 2, 3)
  createdAt: timestamp("created_at").defaultNow(),
});

// Matchplay matches - team vs team pairings
export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  roundId: integer("round_id").notNull(),
  teamA: integer("team_a").notNull(), // Team ID
  teamB: integer("team_b").notNull(), // Team ID
  pairAPlayer1: integer("pair_a_player1").notNull(),
  pairAPlayer2: integer("pair_a_player2").notNull(),
  pairBPlayer1: integer("pair_b_player1").notNull(),
  pairBPlayer2: integer("pair_b_player2").notNull(),
  matchType: text("match_type").notNull(), // 'fourball', 'individual'
  status: text("status").default("active"), // 'active', 'completed'
  result: text("result"), // '3&2', '1UP', 'AS', etc.
  winningTeam: integer("winning_team"), // Team ID or null for tie
  createdAt: timestamp("created_at").defaultNow(),
});

// Individual matchplay pairings (Day 3 only)
export const individualMatches = pgTable("individual_matches", {
  id: serial("id").primaryKey(),
  roundId: integer("round_id").notNull(),
  player1: integer("player1").notNull(),
  player2: integer("player2").notNull(),
  status: text("status").default("active"),
  result: text("result"), // '3&2', '1UP', 'AS', etc.
  winningPlayer: integer("winning_player"), // Player ID or null for tie
  createdAt: timestamp("created_at").defaultNow(),
});

// Stableford hole scores for matchplay
export const stablefordScores = pgTable("stableford_scores", {
  id: serial("id").primaryKey(),
  roundId: integer("round_id").notNull(),
  playerId: integer("player_id").notNull(),
  hole: integer("hole").notNull(),
  grossScore: integer("gross_score").notNull(),
  netScore: integer("net_score").notNull(),
  stablefordPoints: integer("stableford_points").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Hole results for matches
export const holeResults = pgTable("hole_results", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").notNull(),
  hole: integer("hole").notNull(),
  teamAPoints: integer("team_a_points").notNull(),
  teamBPoints: integer("team_b_points").notNull(),
  winner: text("winner"), // 'teamA', 'teamB', 'tie'
  createdAt: timestamp("created_at").defaultNow(),
});

export const scores = pgTable("scores", {
  id: serial("id").primaryKey(),
  roundId: integer("round_id").notNull(),
  playerId: integer("player_id").notNull(),
  hole: integer("hole").notNull(),
  score: integer("score").notNull(),
  threePutt: boolean("three_putt").default(false),
  pickedUp: boolean("picked_up").default(false),
  inWater: boolean("in_water").default(false),
  inBunker: boolean("in_bunker").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const fines = pgTable("fines", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull(),
  type: text("type").notNull(),
  amount: integer("amount").notNull(),
  description: text("description"),
  golfDay: text("golf_day").notNull(), // Which golf day (July 2, July 3, July 5)
  createdAt: timestamp("created_at").defaultNow(),
});

export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  activity: text("activity").notNull(),
  count: integer("count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPlayerSchema = createInsertSchema(players).omit({ id: true, createdAt: true }).extend({
  handicap: z.string().optional().transform((val) => val && val !== "" ? val : null),
  teamId: z.number().nullable().optional()
});
export const insertTeamSchema = createInsertSchema(teams).omit({ id: true, createdAt: true });
export const insertRoundSchema = createInsertSchema(rounds).omit({ id: true, createdAt: true });
export const insertScoreSchema = createInsertSchema(scores).omit({ id: true, createdAt: true });
export const insertFineSchema = createInsertSchema(fines).omit({ id: true, createdAt: true });
export const insertVoteSchema = createInsertSchema(votes).omit({ id: true, createdAt: true });
export const insertMatchSchema = createInsertSchema(matches).omit({ id: true, createdAt: true });
export const insertIndividualMatchSchema = createInsertSchema(individualMatches).omit({ id: true, createdAt: true });
export const insertStablefordScoreSchema = createInsertSchema(stablefordScores).omit({ id: true, createdAt: true });
export const insertHoleResultSchema = createInsertSchema(holeResults).omit({ id: true, createdAt: true });

export type Player = typeof players.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type Round = typeof rounds.$inferSelect;
export type Score = typeof scores.$inferSelect;
export type Fine = typeof fines.$inferSelect;
export type Vote = typeof votes.$inferSelect;
export type Match = typeof matches.$inferSelect;
export type IndividualMatch = typeof individualMatches.$inferSelect;
export type StablefordScore = typeof stablefordScores.$inferSelect;
export type HoleResult = typeof holeResults.$inferSelect;

export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type InsertRound = z.infer<typeof insertRoundSchema>;
export type InsertScore = z.infer<typeof insertScoreSchema>;
export type InsertFine = z.infer<typeof insertFineSchema>;
export type InsertVote = z.infer<typeof insertVoteSchema>;
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type InsertIndividualMatch = z.infer<typeof insertIndividualMatchSchema>;
export type InsertStablefordScore = z.infer<typeof insertStablefordScoreSchema>;
export type InsertHoleResult = z.infer<typeof insertHoleResultSchema>;
