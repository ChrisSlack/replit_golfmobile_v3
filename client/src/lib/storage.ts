// Local storage utilities for offline functionality
export const storage = {
  getPlayers: (): string[] => {
    const players = localStorage.getItem('golf-players');
    return players ? JSON.parse(players) : [];
  },

  setPlayers: (players: string[]): void => {
    localStorage.setItem('golf-players', JSON.stringify(players));
  },

  getScores: (roundKey: string): { [player: string]: { [hole: number]: number } } => {
    const scores = localStorage.getItem(`golf-scores-${roundKey}`);
    return scores ? JSON.parse(scores) : {};
  },

  setScores: (roundKey: string, scores: { [player: string]: { [hole: number]: number } }): void => {
    localStorage.setItem(`golf-scores-${roundKey}`, JSON.stringify(scores));
  },

  getFines: (): Array<{ id: string; player: string; type: string; amount: number; timestamp: string }> => {
    const fines = localStorage.getItem('golf-fines');
    return fines ? JSON.parse(fines) : [];
  },

  setFines: (fines: Array<{ id: string; player: string; type: string; amount: number; timestamp: string }>): void => {
    localStorage.setItem('golf-fines', JSON.stringify(fines));
  },

  getVotes: (): { [activity: string]: number } => {
    const votes = localStorage.getItem('golf-votes');
    return votes ? JSON.parse(votes) : {};
  },

  setVotes: (votes: { [activity: string]: number }): void => {
    localStorage.setItem('golf-votes', JSON.stringify(votes));
  },

  getCurrentRound: (): { course: string; date: string; players: string[] } | null => {
    const round = localStorage.getItem('golf-current-round');
    return round ? JSON.parse(round) : null;
  },

  setCurrentRound: (round: { course: string; date: string; players: string[] }): void => {
    localStorage.setItem('golf-current-round', JSON.stringify(round));
  },

  clearCurrentRound: (): void => {
    localStorage.removeItem('golf-current-round');
  }
};
