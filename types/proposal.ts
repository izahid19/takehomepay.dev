export enum ProposalMode {
  DIRECT_CLIENT = "direct_client",
  UPWORK = "upwork",
  LINKEDIN = "linkedin",
  COLD_EMAIL = "cold_email",
  FIVERR = "fiverr",
  FREELANCER = "freelancer"
}

export const proposalModeLabels: Record<ProposalMode, string> = {
  [ProposalMode.DIRECT_CLIENT]: "Direct Client",
  [ProposalMode.UPWORK]: "Upwork",
  [ProposalMode.LINKEDIN]: "LinkedIn Message",
  [ProposalMode.COLD_EMAIL]: "Cold Email",
  [ProposalMode.FIVERR]: "Fiverr",
  [ProposalMode.FREELANCER]: "Freelancer.com"
};
