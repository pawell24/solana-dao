export type Proposal = {
  publicKey: string; // Public key of the proposal (base58 encoded)
  creator: string; // Public key of the creator (base58 encoded)
  title: string; // Title of the proposal
  description: string; // Description of the proposal
  options: string[]; // Array of voting options (e.g., ["Yes", "No", "Abstain"])
  votes: number[]; // Array of vote counts corresponding to the options
  startTime: number; // Start time of the proposal (Unix timestamp in seconds)
  endTime: number; // End time of the proposal (Unix timestamp in seconds)
  winnerIndex: number | null; // Optional index of the winning option (-1 if not determined)
};
