// ============================================
// TYPE DEFINITIONS - CapitalQuest
// ============================================

export type AssetType = 'Stock' | 'Bond' | 'Fund' | 'Crypto';

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Extreme';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  riskLevel: RiskLevel;
  baseReturnRate: number;       // e.g., 0.05 for 5% annual return
  volatility: number;           // how much the price fluctuates
  currentPrice: number;
  priceHistory: number[];
}

export interface Investment {
  assetId: string;
  amountInvested: number;       // original amount put in
  sharesOwned: number;          // how many shares/units owned
  purchasePrice: number;        // price per share at purchase
  purchaseDate: GameDate;
}

export interface GameDate {
  year: number;
  month: number;                // 1-12
  day: number;                  // 1-31
}

export interface PlayerPortfolio {
  walletBalance: number;        // cash on hand
  investments: Investment[];    // active investments
}

export interface GameState {
  portfolio: PlayerPortfolio;
  currentDate: GameDate;
  gameSpeed: number;            // multiplier for time passage
  isPaused: boolean;
  assets: Asset[];              // available assets in the market
}

export interface WithdrawalResult {
  grossAmount: number;          // amount before tax
  taxAmount: number;            // tax deducted
  netAmount: number;            // amount added to wallet
  capitalGain: number;          // profit or loss
}

export interface MarketEvent {
  id: string;
  name: string;
  description: string;
  affectedAssetTypes: AssetType[];
  priceModifier: number;        // multiplier applied to affected assets
  duration: number;             // how many game days it lasts
}
