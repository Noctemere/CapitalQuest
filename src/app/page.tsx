'use client';

import { useState, useEffect } from 'react';
import {
  initializeGame,
  advanceTime,
  buyAsset,
  sellAsset,
  getWalletBalance,
  getInvestedValue,
  getTotalNetWorth,
  formatMoney,
  formatDate,
  calculateROI,
  pauseGame,
  resumeGame,
  setGameSpeed,
  checkWinCondition,
} from '@/lib/gameLogic';
import { GAME_CONFIG } from '@/lib/gameConfigs';
import type { GameState, Asset } from '@/lib/types';

export default function Home() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [investAmount, setInvestAmount] = useState<string>('');
  const [sellShares, setSellShares] = useState<string>('');

  // Initialize game on mount
  useEffect(() => {
    setGameState(initializeGame());
  }, []);

  // Game loop - advance time based on speed
  useEffect(() => {
    if (!gameState || gameState.isPaused) return;

    const interval = setInterval(() => {
      setGameState((prev) => (prev ? advanceTime(prev) : prev));
    }, GAME_CONFIG.tickIntervalMs / gameState.gameSpeed);

    return () => clearInterval(interval);
  }, [gameState?.isPaused, gameState?.gameSpeed]);

  // Check win condition
  useEffect(() => {
    if (gameState && checkWinCondition(gameState.portfolio, gameState.assets)) {
      alert('Congratulations! You reached your goal!');
      setGameState((prev) => (prev ? pauseGame(prev) : prev));
    }
  }, [gameState?.portfolio, gameState?.assets]);

  if (!gameState) return <div>Loading...</div>;

  const walletBalance = getWalletBalance(gameState.portfolio);
  const investedValue = getInvestedValue(gameState.portfolio, gameState.assets);
  const netWorth = getTotalNetWorth(gameState.portfolio, gameState.assets);

  const handleBuy = () => {
    if (!selectedAsset || !investAmount) return;
    const amount = parseFloat(investAmount);
    if (isNaN(amount) || amount <= 0) return;

    const newPortfolio = buyAsset(
      gameState.portfolio,
      selectedAsset,
      amount,
      gameState.currentDate
    );

    if (newPortfolio) {
      setGameState({ ...gameState, portfolio: newPortfolio });
      setInvestAmount('');
    }
  };

  const handleSell = (investmentIndex: number) => {
    const investment = gameState.portfolio.investments[investmentIndex];
    const asset = gameState.assets.find((a) => a.id === investment.assetId);
    if (!asset) return;

    const shares = parseFloat(sellShares) || investment.sharesOwned;
    const result = sellAsset(gameState.portfolio, investmentIndex, asset, shares);

    if (result) {
      setGameState({ ...gameState, portfolio: result.portfolio });
      setSellShares('');
    }
  };

  const togglePause = () => {
    setGameState(gameState.isPaused ? resumeGame(gameState) : pauseGame(gameState));
  };

  const changeSpeed = (speed: number) => {
    setGameState(setGameSpeed(gameState, speed));
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-8">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold">CapitalQuest</h1>
        <p className="text-zinc-400">Build your investment portfolio</p>
      </header>

      {/* Top Bar - Date & Controls */}
      <div className="flex justify-between items-center mb-8 p-4 bg-zinc-800 rounded-lg">
        <div className="text-xl">{formatDate(gameState.currentDate)}</div>
        <div className="flex gap-2">
          <button
            onClick={togglePause}
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            {gameState.isPaused ? 'Play' : 'Pause'}
          </button>
          {GAME_CONFIG.speedOptions.map((option) => (
            <button
              key={option.multiplier}
              onClick={() => changeSpeed(option.multiplier)}
              className={`px-4 py-2 rounded ${
                gameState.gameSpeed === option.multiplier
                  ? 'bg-green-600'
                  : 'bg-zinc-700 hover:bg-zinc-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-zinc-800 rounded-lg">
          <div className="text-zinc-400 text-sm">Wallet</div>
          <div className="text-2xl font-bold text-green-400">
            {formatMoney(walletBalance)}
          </div>
        </div>
        <div className="p-4 bg-zinc-800 rounded-lg">
          <div className="text-zinc-400 text-sm">Invested</div>
          <div className="text-2xl font-bold text-blue-400">
            {formatMoney(investedValue)}
          </div>
        </div>
        <div className="p-4 bg-zinc-800 rounded-lg">
          <div className="text-zinc-400 text-sm">Net Worth</div>
          <div className="text-2xl font-bold text-yellow-400">
            {formatMoney(netWorth)}
          </div>
          <div className="text-xs text-zinc-500">
            Goal: {formatMoney(GAME_CONFIG.goalAmount)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Available Assets */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Market</h2>
          <div className="space-y-2">
            {gameState.assets.map((asset) => (
              <div
                key={asset.id}
                onClick={() => setSelectedAsset(asset)}
                className={`p-4 bg-zinc-800 rounded-lg cursor-pointer hover:bg-zinc-700 ${
                  selectedAsset?.id === asset.id ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="flex justify-between">
                  <div>
                    <div className="font-semibold">{asset.name}</div>
                    <div className="text-sm text-zinc-400">
                      {asset.type} • {asset.riskLevel} Risk
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono">{formatMoney(asset.currentPrice)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Buy Form */}
          {selectedAsset && (
            <div className="mt-4 p-4 bg-zinc-800 rounded-lg">
              <h3 className="font-semibold mb-2">Buy {selectedAsset.name}</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={investAmount}
                  onChange={(e) => setInvestAmount(e.target.value)}
                  placeholder="Amount to invest"
                  className="flex-1 px-3 py-2 bg-zinc-700 rounded text-white"
                />
                <button
                  onClick={handleBuy}
                  className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
                >
                  Buy
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Your Investments */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Investments</h2>
          <div className="space-y-2">
            {gameState.portfolio.investments.length === 0 ? (
              <div className="text-zinc-500">No investments yet</div>
            ) : (
              gameState.portfolio.investments.map((investment, index) => {
                const asset = gameState.assets.find(
                  (a) => a.id === investment.assetId
                );
                if (!asset) return null;

                const currentValue = investment.sharesOwned * asset.currentPrice;
                const roi = calculateROI(investment, asset.currentPrice);

                return (
                  <div key={index} className="p-4 bg-zinc-800 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">{asset.name}</div>
                        <div className="text-sm text-zinc-400">
                          {investment.sharesOwned.toFixed(4)} shares
                        </div>
                        <div className="text-sm text-zinc-400">
                          Bought at {formatMoney(investment.purchasePrice)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono">{formatMoney(currentValue)}</div>
                        <div
                          className={`text-sm ${
                            roi >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {roi >= 0 ? '+' : ''}
                          {roi.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <input
                        type="number"
                        placeholder="Shares to sell"
                        className="flex-1 px-3 py-1 bg-zinc-700 rounded text-white text-sm"
                        onChange={(e) => setSellShares(e.target.value)}
                      />
                      <button
                        onClick={() => handleSell(index)}
                        className="px-3 py-1 bg-red-600 rounded text-sm hover:bg-red-700"
                      >
                        Sell
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

