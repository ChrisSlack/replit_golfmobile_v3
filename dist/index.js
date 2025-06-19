var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  fines: () => fines,
  insertFineSchema: () => insertFineSchema,
  insertPlayerSchema: () => insertPlayerSchema,
  insertRoundSchema: () => insertRoundSchema,
  insertScoreSchema: () => insertScoreSchema,
  insertTeamSchema: () => insertTeamSchema,
  insertVoteSchema: () => insertVoteSchema,
  players: () => players,
  rounds: () => rounds,
  scores: () => scores,
  teams: () => teams,
  votes: () => votes
});
import { pgTable, text, serial, integer, boolean, timestamp, json, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var players = pgTable("players", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  handicap: decimal("handicap", { precision: 4, scale: 1 }),
  teamId: integer("team_id"),
  createdAt: timestamp("created_at").defaultNow()
});
var teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  captainId: integer("captain_id"),
  createdAt: timestamp("created_at").defaultNow()
});
var rounds = pgTable("rounds", {
  id: serial("id").primaryKey(),
  course: text("course").notNull(),
  date: text("date").notNull(),
  players: json("players").$type().notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var scores = pgTable("scores", {
  id: serial("id").primaryKey(),
  roundId: integer("round_id").notNull(),
  playerId: integer("player_id").notNull(),
  hole: integer("hole").notNull(),
  score: integer("score").notNull(),
  threePutt: boolean("three_putt").default(false),
  pickedUp: boolean("picked_up").default(false),
  inWater: boolean("in_water").default(false),
  inBunker: boolean("in_bunker").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var fines = pgTable("fines", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull(),
  type: text("type").notNull(),
  amount: integer("amount").notNull(),
  description: text("description"),
  golfDay: text("golf_day").notNull(),
  // Which golf day (July 2, July 3, July 5)
  createdAt: timestamp("created_at").defaultNow()
});
var votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  activity: text("activity").notNull(),
  count: integer("count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow()
});
var insertPlayerSchema = createInsertSchema(players).omit({ id: true, createdAt: true }).extend({
  handicap: z.string().optional().transform((val) => val && val !== "" ? val : null),
  teamId: z.number().nullable().optional()
});
var insertTeamSchema = createInsertSchema(teams).omit({ id: true, createdAt: true });
var insertRoundSchema = createInsertSchema(rounds).omit({ id: true, createdAt: true });
var insertScoreSchema = createInsertSchema(scores).omit({ id: true, createdAt: true });
var insertFineSchema = createInsertSchema(fines).omit({ id: true, createdAt: true });
var insertVoteSchema = createInsertSchema(votes).omit({ id: true, createdAt: true });

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq } from "drizzle-orm";
var MemStorage = class {
  players = /* @__PURE__ */ new Map();
  teams = /* @__PURE__ */ new Map();
  rounds = /* @__PURE__ */ new Map();
  scores = /* @__PURE__ */ new Map();
  fines = /* @__PURE__ */ new Map();
  votes = /* @__PURE__ */ new Map();
  currentId = 1;
  // Players
  async getPlayers() {
    return Array.from(this.players.values());
  }
  async createPlayer(insertPlayer) {
    const id = this.currentId++;
    const player = {
      ...insertPlayer,
      handicap: insertPlayer.handicap || null,
      teamId: insertPlayer.teamId || null,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.players.set(id, player);
    return player;
  }
  async updatePlayer(id, updateData) {
    const player = this.players.get(id);
    if (!player) throw new Error("Player not found");
    const updatedPlayer = {
      ...player,
      ...updateData,
      handicap: updateData.handicap !== void 0 ? updateData.handicap : player.handicap,
      teamId: updateData.teamId !== void 0 ? updateData.teamId : player.teamId
    };
    this.players.set(id, updatedPlayer);
    return updatedPlayer;
  }
  async deletePlayer(id) {
    this.players.delete(id);
  }
  async getPlayerById(id) {
    return this.players.get(id);
  }
  // Teams
  async getTeams() {
    return Array.from(this.teams.values());
  }
  async createTeam(insertTeam) {
    const id = this.currentId++;
    const team = {
      ...insertTeam,
      captainId: insertTeam.captainId || null,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.teams.set(id, team);
    return team;
  }
  async updateTeam(id, updateData) {
    const team = this.teams.get(id);
    if (!team) throw new Error("Team not found");
    const updatedTeam = {
      ...team,
      ...updateData,
      captainId: updateData.captainId !== void 0 ? updateData.captainId : team.captainId
    };
    this.teams.set(id, updatedTeam);
    return updatedTeam;
  }
  async deleteTeam(id) {
    this.teams.delete(id);
  }
  async getTeamById(id) {
    return this.teams.get(id);
  }
  async getTeamPlayers(teamId) {
    return Array.from(this.players.values()).filter((player) => player.teamId === teamId);
  }
  // Rounds
  async getRounds() {
    return Array.from(this.rounds.values());
  }
  async createRound(insertRound) {
    const id = this.currentId++;
    const round = {
      course: insertRound.course,
      date: insertRound.date,
      players: insertRound.players,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.rounds.set(id, round);
    return round;
  }
  // Scores
  async getScores(roundId) {
    return Array.from(this.scores.values()).filter((score) => score.roundId === roundId);
  }
  async getAllScores() {
    return Array.from(this.scores.values());
  }
  async createScore(insertScore) {
    const id = this.currentId++;
    const score = {
      ...insertScore,
      threePutt: insertScore.threePutt || false,
      pickedUp: insertScore.pickedUp || false,
      inWater: insertScore.inWater || false,
      inBunker: insertScore.inBunker || false,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.scores.set(id, score);
    return score;
  }
  async updateScore(id, scoreData) {
    const score = this.scores.get(id);
    if (!score) throw new Error("Score not found");
    const updatedScore = {
      ...score,
      ...scoreData,
      threePutt: scoreData.threePutt !== void 0 ? scoreData.threePutt : score.threePutt,
      pickedUp: scoreData.pickedUp !== void 0 ? scoreData.pickedUp : score.pickedUp,
      inWater: scoreData.inWater !== void 0 ? scoreData.inWater : score.inWater,
      inBunker: scoreData.inBunker !== void 0 ? scoreData.inBunker : score.inBunker
    };
    this.scores.set(id, updatedScore);
    return updatedScore;
  }
  // Fines
  async getFines() {
    return Array.from(this.fines.values());
  }
  async getFinesByPlayerAndDay(playerId, golfDay) {
    return Array.from(this.fines.values()).filter(
      (fine) => fine.playerId === playerId && fine.golfDay === golfDay
    );
  }
  async createFine(insertFine) {
    const id = this.currentId++;
    const fine = {
      ...insertFine,
      description: insertFine.description || null,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.fines.set(id, fine);
    return fine;
  }
  // Votes
  async getVotes() {
    return Array.from(this.votes.values());
  }
  async createVote(insertVote) {
    const id = this.currentId++;
    const vote = {
      ...insertVote,
      count: insertVote.count || 0,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.votes.set(id, vote);
    return vote;
  }
  async updateVote(id, count) {
    const vote = this.votes.get(id);
    if (!vote) throw new Error("Vote not found");
    const updatedVote = { ...vote, count };
    this.votes.set(id, updatedVote);
    return updatedVote;
  }
  async getVoteByActivity(activity) {
    return Array.from(this.votes.values()).find((vote) => vote.activity === activity);
  }
};
var storage = new MemStorage();

// server/routes.ts
async function registerRoutes(app2) {
  app2.get("/api/players", async (req, res) => {
    try {
      const players2 = await storage.getPlayers();
      res.json(players2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch players" });
    }
  });
  app2.get("/api/players/:id", async (req, res) => {
    try {
      const player = await storage.getPlayerById(parseInt(req.params.id));
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }
      res.json(player);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch player" });
    }
  });
  app2.post("/api/players", async (req, res) => {
    try {
      console.log("Received player data:", req.body);
      const validatedData = insertPlayerSchema.parse(req.body);
      console.log("Validated player data:", validatedData);
      const player = await storage.createPlayer(validatedData);
      res.json(player);
    } catch (error) {
      console.error("Player creation error:", error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: "Invalid player data" });
      }
    }
  });
  app2.patch("/api/players/:id", async (req, res) => {
    try {
      const validatedData = insertPlayerSchema.partial().parse(req.body);
      const player = await storage.updatePlayer(parseInt(req.params.id), validatedData);
      res.json(player);
    } catch (error) {
      res.status(400).json({ message: "Failed to update player" });
    }
  });
  app2.delete("/api/players/:id", async (req, res) => {
    try {
      await storage.deletePlayer(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete player" });
    }
  });
  app2.get("/api/teams", async (req, res) => {
    try {
      const teams2 = await storage.getTeams();
      res.json(teams2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch teams" });
    }
  });
  app2.get("/api/teams/:id", async (req, res) => {
    try {
      const team = await storage.getTeamById(parseInt(req.params.id));
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      res.json(team);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch team" });
    }
  });
  app2.get("/api/teams/:id/players", async (req, res) => {
    try {
      const players2 = await storage.getTeamPlayers(parseInt(req.params.id));
      res.json(players2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch team players" });
    }
  });
  app2.post("/api/teams", async (req, res) => {
    try {
      const validatedData = insertTeamSchema.parse(req.body);
      const team = await storage.createTeam(validatedData);
      res.json(team);
    } catch (error) {
      res.status(400).json({ message: "Invalid team data" });
    }
  });
  app2.patch("/api/teams/:id", async (req, res) => {
    try {
      const validatedData = insertTeamSchema.partial().parse(req.body);
      const team = await storage.updateTeam(parseInt(req.params.id), validatedData);
      res.json(team);
    } catch (error) {
      res.status(400).json({ message: "Failed to update team" });
    }
  });
  app2.delete("/api/teams/:id", async (req, res) => {
    try {
      await storage.deleteTeam(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete team" });
    }
  });
  app2.get("/api/rounds", async (req, res) => {
    try {
      const rounds2 = await storage.getRounds();
      res.json(rounds2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rounds" });
    }
  });
  app2.post("/api/rounds", async (req, res) => {
    try {
      console.log("Round creation request body:", req.body);
      const validatedData = insertRoundSchema.parse(req.body);
      console.log("Validated round data:", validatedData);
      const round = await storage.createRound(validatedData);
      res.json(round);
    } catch (error) {
      console.error("Round creation error:", error);
      res.status(400).json({ message: "Invalid round data", error: error.message || String(error) });
    }
  });
  app2.get("/api/scores/all", async (req, res) => {
    try {
      const allScores = await storage.getAllScores();
      res.json(allScores);
    } catch (error) {
      console.error("Error fetching all scores:", error);
      res.status(500).json({ message: "Failed to fetch all scores" });
    }
  });
  app2.get("/api/scores/:roundId", async (req, res) => {
    try {
      const roundId = parseInt(req.params.roundId);
      const scores2 = await storage.getScores(roundId);
      res.json(scores2);
    } catch (error) {
      console.error("Error fetching scores for round:", req.params.roundId, error);
      res.status(500).json({ message: "Failed to fetch scores" });
    }
  });
  app2.get("/api/scores", async (req, res) => {
    try {
      const roundId = req.query.roundId;
      if (!roundId) {
        res.json([]);
        return;
      }
      const scores2 = await storage.getScores(parseInt(roundId));
      res.json(scores2);
    } catch (error) {
      console.error("Error fetching scores:", error);
      res.status(500).json({ message: "Failed to fetch scores" });
    }
  });
  app2.post("/api/scores", async (req, res) => {
    try {
      console.log("Creating score with data:", req.body);
      const validatedData = insertScoreSchema.parse(req.body);
      const score = await storage.createScore(validatedData);
      console.log("Score created successfully:", score);
      res.json(score);
    } catch (error) {
      console.error("Error creating score:", error);
      res.status(400).json({ message: "Invalid score data" });
    }
  });
  app2.patch("/api/scores/:id", async (req, res) => {
    try {
      const validatedData = insertScoreSchema.partial().parse(req.body);
      const updatedScore = await storage.updateScore(parseInt(req.params.id), validatedData);
      res.json(updatedScore);
    } catch (error) {
      res.status(500).json({ message: "Failed to update score" });
    }
  });
  app2.get("/api/fines", async (req, res) => {
    try {
      const fines2 = await storage.getFines();
      res.json(fines2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch fines" });
    }
  });
  app2.get("/api/fines/:playerId/:golfDay", async (req, res) => {
    try {
      const playerId = parseInt(req.params.playerId);
      const golfDay = req.params.golfDay;
      const fines2 = await storage.getFinesByPlayerAndDay(playerId, golfDay);
      res.json(fines2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch player fines" });
    }
  });
  app2.post("/api/fines", async (req, res) => {
    try {
      const validatedData = insertFineSchema.parse(req.body);
      const fine = await storage.createFine(validatedData);
      res.json(fine);
    } catch (error) {
      res.status(400).json({ message: "Invalid fine data" });
    }
  });
  app2.get("/api/votes", async (req, res) => {
    try {
      const votes2 = await storage.getVotes();
      res.json(votes2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch votes" });
    }
  });
  app2.post("/api/votes", async (req, res) => {
    try {
      const { activity } = req.body;
      const existingVote = await storage.getVoteByActivity(activity);
      if (existingVote) {
        const updatedVote = await storage.updateVote(existingVote.id, existingVote.count + 1);
        res.json(updatedVote);
      } else {
        const validatedData = insertVoteSchema.parse({ activity, count: 1 });
        const vote = await storage.createVote(validatedData);
        res.json(vote);
      }
    } catch (error) {
      res.status(400).json({ message: "Invalid vote data" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
