// Main Event type to be showed and handed as a prop
export interface Event {
  name: string;
  transactionHash: string;
  logTime: number;
  userAddress?: string;
  fundingPotId?: string;
  amount?: string;
  token?: string;
  role?: string;
  domainId?: string;
  values?: any;
}

// Manual Token Symbol from Etherscan
export const SYMBOL: any = {
  "0x0dd7b8f3d1fa88FAbAa8a04A0c7B52FC35D4312c": "ΒLNY",
  "0x6B175474E89094C44Da98b954EedeAC495271d0F": "DAI",
};

// Event Types to be filtered.
export enum EventTypes {
  COLONY_INITIALIZED = "ColonyInitialised",
  DOMAIN_ADDED = "DomainAdded",
  COLONY_ROLE_SET = "ColonyRoleSet",
  PAYOUT_CLAIMED = "PayoutClaimed",
}
