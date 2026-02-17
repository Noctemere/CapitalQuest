// ============================================
// GAME LOGIC - CapitalQuest
// Core functions for investment simulation
// ============================================

import { GAME_CONFIG } from './gameConfigs';
import type {
  Asset,
  Investment,
  GameState,
  GameDate,
  PlayerPortfolio,
  WithdrawalResult,
} from './types';

// ============================================
// INITIALIZATION
// ============================================

/**
 * Create a new game state with starting values
 */
export function initializeGame(): GameState {
  return {
    portfolio: {
      walletBalance: GAME_CONFIG.startingMoney,
      investments: [],
    },
    currentDate: { ...GAME_CONFIG.startDate },
    gameSpeed: GAME_CONFIG.defaultGameSpeed,
    isPaused: true,
    assets: [], // Load your assets here
  };
}

// ============================================
// WALLET OPERATIONS
// ============================================

/**
 * Get total wallet (cash on hand)
 */
export function getWalletBalance(portfolio: PlayerPortfolio): number {
  return portfolio.walletBalance;
}

/**
 * Get total value of all investments at current prices
 */
export function getInvestedValue(
  portfolio: PlayerPortfolio,
  assets: Asset[]
): number {
  return portfolio.investments.reduce((total, investment) => {
    const asset = assets.find((a) => a.id === investment.assetId);
    if (!asset) return total;
    return total + investment.sharesOwned * asset.currentPrice;
  }, 0);
}

/**
 * Get total liquid money (wallet + invested value)
 */
export function getTotalNetWorth(
  portfolio: PlayerPortfolio,
  assets: Asset[]
): number {
  return getWalletBalance(portfolio) + getInvestedValue(portfolio, assets);
}

// ============================================
// INVESTMENT OPERATIONS
// ============================================

/**
 * Buy shares of an asset
 * Returns updated portfolio or null if insufficient funds
 */
export function buyAsset(
  portfolio: PlayerPortfolio,
  asset: Asset,
  amount: number,
  currentDate: GameDate
): PlayerPortfolio | null {
  if (amount <= 0) return null;
  if (portfolio.walletBalance < amount) return null;

  const sharesToBuy = amount / asset.currentPrice;

  const newInvestment: Investment = {
    assetId: asset.id,
    amountInvested: amount,
    sharesOwned: sharesToBuy,
    purchasePrice: asset.currentPrice,
    purchaseDate: { ...currentDate },
  };

  return {
    walletBalance: portfolio.walletBalance - amount,
    investments: [...portfolio.investments, newInvestment],
  };
}

/**
 * Sell/withdraw from an investment
 * Calculates taxes and returns withdrawal result
 */
export function sellAsset(
  portfolio: PlayerPortfolio,
  investmentIndex: number,
  asset: Asset,
  sharesToSell: number
): { portfolio: PlayerPortfolio; result: WithdrawalResult } | null {
  const investment = portfolio.investments[investmentIndex];
  if (!investment) return null;
  if (sharesToSell <= 0 || sharesToSell > investment.sharesOwned) return null;

  const grossAmount = sharesToSell * asset.currentPrice;
  const originalCost = sharesToSell * investment.purchasePrice;
  const capitalGain = grossAmount - originalCost;

  // Calculate tax (only on gains, if positive)
  const taxAmount = calculateTax(capitalGain, grossAmount);
  const netAmount = grossAmount - taxAmount;

  // Update investment or remove if fully sold
  const remainingShares = investment.sharesOwned - sharesToSell;
  let updatedInvestments: Investment[];

  if (remainingShares <= 0) {
    updatedInvestments = portfolio.investments.filter(
      (_, i) => i !== investmentIndex
    );
  } else {
    updatedInvestments = portfolio.investments.map((inv, i) =>
      i === investmentIndex
        ? {
            ...inv,
            sharesOwned: remainingShares,
            amountInvested: inv.amountInvested * (remainingShares / inv.sharesOwned),
          }
        : inv
    );
  }

  return {
    portfolio: {
      walletBalance: portfolio.walletBalance + netAmount,
      investments: updatedInvestments,
    },
    result: {
      grossAmount,
      taxAmount,
      netAmount,
      capitalGain,
    },
  };
}

/**
 * Calculate tax on withdrawal
 * You define the tax logic here
 */
export function calculateTax(capitalGain: number, grossAmount: number): number {
  // Tax only applies to profits
  if (capitalGain <= 0) {
    return grossAmount * GAME_CONFIG.flatWithdrawalTaxRate;
  }

  // Tax on capital gains + flat withdrawal fee
  const gainsTax = capitalGain * GAME_CONFIG.capitalGainsTaxRate;
  const flatTax = grossAmount * GAME_CONFIG.flatWithdrawalTaxRate;

  return gainsTax + flatTax;
}

// ============================================
// TIME & MARKET SIMULATION
// ============================================

/**
 * Advance game time by one tick
 * Updates date and triggers market price changes
 */
export function advanceTime(state: GameState): GameState {
  if (state.isPaused) return state;

  const newDate = incrementDate(state.currentDate, GAME_CONFIG.daysPerTick);
  const updatedAssets = updateAssetPrices(state.assets);

  return {
    ...state,
    currentDate: newDate,
    assets: updatedAssets,
  };
}

/**
 * Increment the game date by a number of days
 */
export function incrementDate(date: GameDate, days: number): GameDate {
  let { year, month, day } = date;
  day += days;

  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  while (day > daysInMonth[month - 1]) {
    day -= daysInMonth[month - 1];
    month++;
    if (month > 12) {
      month = 1;
      year++;
    }
  }

  return { year, month, day };
}

/**
 * Update all asset prices based on their risk/volatility
 * This simulates market movement
 */
export function updateAssetPrices(assets: Asset[]): Asset[] {
  return assets.map((asset) => {
    const priceChange = calculatePriceChange(asset);
    const newPrice = Math.max(0.01, asset.currentPrice * (1 + priceChange));

    return {
      ...asset,
      currentPrice: newPrice,
      priceHistory: [...asset.priceHistory.slice(-99), newPrice],
    };
  });
}

/**
 * Calculate price change for an asset based on risk and volatility
 * Returns a decimal (e.g., 0.02 for +2%, -0.05 for -5%)
 */
export function calculatePriceChange(asset: Asset): number {
  const riskMultiplier = GAME_CONFIG.riskMultipliers[asset.riskLevel];

  // Random factor between -1 and 1
  const randomFactor = (Math.random() * 2 - 1) * asset.volatility;

  // Base trend (slight upward bias based on return rate)
  const baseTrend = asset.baseReturnRate / 365; // daily return

  return (baseTrend + randomFactor) * riskMultiplier;
}

// ============================================
// GAME SPEED CONTROLS
// ============================================

export function setGameSpeed(state: GameState, speed: number): GameState {
  return { ...state, gameSpeed: speed };
}

export function pauseGame(state: GameState): GameState {
  return { ...state, isPaused: true };
}

export function resumeGame(state: GameState): GameState {
  return { ...state, isPaused: false };
}

// ============================================
// WIN CONDITION
// ============================================

/**
 * Check if player has reached the goal
 */
export function checkWinCondition(
  portfolio: PlayerPortfolio,
  assets: Asset[]
): boolean {
  const netWorth = getTotalNetWorth(portfolio, assets);
  return netWorth >= GAME_CONFIG.goalAmount;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format currency for display
 */
export function formatMoney(amount: number): string {
  return `$${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

/**
 * Format date for display
 */
export function formatDate(date: GameDate): string {
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${monthNames[date.month - 1]} ${date.day}, ${date.year}`;
}

/**
 * Calculate ROI for an investment
 */
export function calculateROI(investment: Investment, currentPrice: number): number {
  const currentValue = investment.sharesOwned * currentPrice;
  return ((currentValue - investment.amountInvested) / investment.amountInvested) * 100;
}
