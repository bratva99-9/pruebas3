import React, { useState, useEffect, useCallback } from 'react';
import { UserService } from '../UserService';
import swapService from '../services/SwapService';
import './SwapModal.css';

const SwapModal = ({ onClose, onSuccess, defaultInput = 'WAX', defaultOutput = 'SEXY' }) => {
  const [fromToken, setFromToken] = useState(defaultInput);
  const [toToken, setToToken] = useState(defaultOutput);
  const [inputAmount, setInputAmount] = useState('');
  const [outputAmount, setOutputAmount] = useState(0);
  const [fromTokenBalance, setFromTokenBalance] = useState(0);
  const [toTokenBalance, setToTokenBalance] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [swapLoading, setSwapLoading] = useState(false);

  const [poolFee, setPoolFee] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // --- CONFIGURACIÓN DE COMISIONES Y SLIPPAGE ---
  const POOL_FEE = 0.006; // 0.6% total (0.3% Alcor + 0.3% dApp)
  const DAPP_FEE = 0.003; // 0.3% dApp
  const DAPP_FEE_ACCOUNT = 'nightclubapp';
  const SLIPPAGE_TOLERANCE = 0.003; // 0.3%

  const commissionAmount = parseFloat(inputAmount || 0) * DAPP_FEE;
  const swapAmount = parseFloat(inputAmount || 0) - commissionAmount;

  useEffect(() => {
    const fromBalance = UserService.getBalanceBySymbol(fromToken);
    setFromTokenBalance(fromBalance);
    const toBalance = UserService.getBalanceBySymbol(toToken);
    setToTokenBalance(toBalance);
  }, [fromToken, toToken]);

  const getQuote = useCallback(async (isMounted) => {
    if (!inputAmount || parseFloat(inputAmount) <= 0 || !fromToken || !toToken) {
      if (isMounted) setOutputAmount(0);
      return;
    }

    if (isMounted) {
      setLoading(true);
      setError('');
    }
    
    try {
      if (swapAmount > 0) {
          const quoteResult = await swapService.getQuoteWithFee(fromToken, toToken, swapAmount);
          if (isMounted) {
            setOutputAmount(quoteResult.quote || 0);
          }
      } else {
          if (isMounted) setOutputAmount(0);
      }

    } catch (err) {
      console.error("Error getting quote:", err);
      if (isMounted) {
        setError(err.message || 'Error al obtener cotización');
        setOutputAmount(0);
      }
    } finally {
      if (isMounted) setLoading(false);
    }
  }, [inputAmount, fromToken, toToken, swapAmount]);

  useEffect(() => {
    let isMounted = true;
    const debounceTimeout = setTimeout(() => {
      getQuote(isMounted);
    }, 500);

    return () => {
      isMounted = false;
      clearTimeout(debounceTimeout);
    };
  }, [getQuote]);

  useEffect(() => {
    const safeInputAmount = parseFloat(inputAmount) || 0;
    if (fromTokenBalance > 0 && safeInputAmount > 0) {
        const maxAmount = fromToken === 'WAX' ? Math.max(0, fromTokenBalance - 0.1) : fromTokenBalance;
        if (maxAmount > 0) {
            const newPercentage = Math.min(100, (safeInputAmount / maxAmount) * 100);
            setPercentage(newPercentage);
        } else {
            setPercentage(0);
        }
    } else {
        setPercentage(0);
    }
  }, [inputAmount, fromTokenBalance, fromToken]);

  const handleSwap = async () => {
    if (!UserService.session) {
      setError("Por favor, inicia sesión para hacer el swap.");
      return;
    }
    if (outputAmount <= 0) {
      setError("La cantidad a recibir debe ser mayor que cero.");
      return;
    }

    setSwapLoading(true);
    setError('');

    try {
        const inputData = swapService.supportedTokens.find(t => t.symbol === fromToken);
        const outputData = swapService.supportedTokens.find(t => t.symbol === toToken);
        if (!inputData || !outputData) throw new Error("Token no soportado.");

        const actions = [];

        // 1. Acción de la comisión para la dApp (0.3%)
        if (commissionAmount > 0) {
            actions.push({
                account: inputData.contract,
                name: 'transfer',
                authorization: [{ actor: UserService.authName, permission: 'active' }],
                data: {
                    from: UserService.authName,
                    to: DAPP_FEE_ACCOUNT,
                    quantity: `${commissionAmount.toFixed(inputData.precision)} ${inputData.symbol}`,
                    memo: `NightClub dApp Fee - 0.3%`,
                },
            });
        }
        
        // 2. Acción del Swap para Alcor
        const minExpected = outputAmount * (1 - SLIPPAGE_TOLERANCE);
        const alcorMemo = await swapService.getSwapMemo(fromToken, toToken, minExpected, UserService.authName);
        
        actions.push({
            account: inputData.contract,
            name: 'transfer',
            authorization: [{ actor: UserService.authName, permission: 'active' }],
            data: {
                from: UserService.authName,
                to: 'swap.alcor',
                quantity: `${swapAmount.toFixed(inputData.precision)} ${inputData.symbol}`,
                memo: alcorMemo,
            },
        });

      await UserService.session.signTransaction({ actions }, { blocksBehind: 3, expireSeconds: 30 });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Error executing swap:', err);
      const errorMessage = err.message || (err.cause && err.cause.message) || 'Error al ejecutar el swap.';
      setError(errorMessage);
    } finally {
      setSwapLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (/^[0-9]*\.?[0-9]*$/.test(value)) {
      setInputAmount(value);
    }
  };

  const handleMaxClick = () => {
    const tokenData = swapService.supportedTokens.find(t => t.symbol === fromToken);
    const precision = tokenData ? tokenData.precision : 4;
    // Deja un pequeño margen para cubrir posibles fees de transacción de RAM
    const maxAmount = fromToken === 'WAX' ? Math.max(0, fromTokenBalance - 0.1) : fromTokenBalance;
    setInputAmount(maxAmount.toFixed(precision));
  };

  const handlePercentageClick = (newPercentage) => {
    setPercentage(newPercentage);

    if (fromTokenBalance > 0) {
        const tokenData = swapService.supportedTokens.find(t => t.symbol === fromToken);
        const precision = tokenData ? tokenData.precision : 4;
        const maxAmount = fromToken === 'WAX' ? Math.max(0, fromTokenBalance - 0.1) : fromTokenBalance;
        const newAmount = (maxAmount * newPercentage) / 100;
        setInputAmount(newAmount.toFixed(precision));
    }
  };

  const handleSliderChange = (e) => {
    const newPercentage = Number(e.target.value);
    setPercentage(newPercentage);

    if (fromTokenBalance > 0) {
        const tokenData = swapService.supportedTokens.find(t => t.symbol === fromToken);
        const precision = tokenData ? tokenData.precision : 4;
        const maxAmount = fromToken === 'WAX' ? Math.max(0, fromTokenBalance - 0.1) : fromTokenBalance;
        const newAmount = (maxAmount * newPercentage) / 100;
        setInputAmount(newAmount.toFixed(precision));
    }
  };

  const switchTokens = () => {
    const currentFrom = fromToken;
    setFromToken(toToken);
    setToToken(currentFrom);
    setInputAmount(outputAmount > 0 ? outputAmount.toFixed(3) : '');
  };

  return (
    <div className="swap-modal-bg" onClick={onClose}>
      <div className="swap-modal" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="swap-close-btn">&times;</button>
        <h2 className="swap-title">Swap Tokens</h2>
        
        <div className="swap-slider-container">
          <div className="swap-percentage-selector">
            {[0, 25, 50, 75, 100].map(p => (
              <span key={p} onClick={() => handlePercentageClick(p)} className="swap-percentage-btn">
                {p}%
              </span>
            ))}
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            step="1"
            value={percentage}
            onChange={handleSliderChange}
            className="swap-slider"
            style={{ backgroundSize: `${percentage}% 100%` }}
          />
        </div>

        {/* From */}
        <div className="swap-row">
            <div className="swap-balance">
              <span className="swap-balance-label">Balance:</span>
              <span onClick={handleMaxClick} className="swap-balance-value" title="Use maximum balance">
                {fromTokenBalance.toFixed(4)}
              </span>
            </div>
            <div className="swap-input-group">
                <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.0"
                    value={inputAmount}
                    onChange={handleInputChange}
                    className="swap-input"
                />
                 <select className="swap-token-select" value={fromToken} onChange={e => setFromToken(e.target.value)}>
                    {swapService.supportedTokens.map(t => <option key={t.symbol} value={t.symbol}>{t.symbol}</option>)}
                </select>
            </div>
        </div>

        {/* Switch Button */}
        <div className="swap-arrow">
             <button onClick={switchTokens} style={{background: 'none', border: 'none', cursor: 'pointer', padding: 0}} title="Switch pairs">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 11V5.5M9 5.5L6 8.5M9 5.5L12 8.5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M19 17V22.5M19 22.5L16 19.5M19 22.5L22 19.5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
             </button>
        </div>

        {/* To */}
        <div className="swap-row">
            <div className="swap-balance">
              <span className="swap-balance-label">Balance:</span>
              <span className="swap-balance-value">{toTokenBalance.toFixed(4)}</span>
            </div>
            <div className="swap-input-group">
                <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.0"
                    value={outputAmount > 0 ? outputAmount.toFixed(3) : '0.0'}
                    readOnly
                    className="swap-input"
                />
                <select className="swap-token-select" value={toToken} onChange={e => setToToken(e.target.value)}>
                    {swapService.supportedTokens.map(t => <option key={t.symbol} value={t.symbol}>{t.symbol}</option>)}
                </select>
            </div>
        </div>
        
        {/* Info Box */}
        <div className="swap-info-box">
          <div>Minimum received: <b>{outputAmount > 0 ? (outputAmount * (1 - SLIPPAGE_TOLERANCE)).toFixed(3) : '0'} {toToken}</b></div>
          
          <button className="swap-details-toggle" onClick={() => setShowAdvanced(v => !v)}>
            {showAdvanced ? (
              <>
                <span>Hide advanced details</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M12 10L8 6L4 10" stroke="#f0dfff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </>
            ) : (
              <>
                <span>Show advanced details</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6L8 10L12 6" stroke="#f0dfff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </>
            )}
          </button>

          {showAdvanced && (
            <div className="swap-advanced-details">
              <div>Pool fee: <b>0.6%</b></div>
              <div>Slippage: <b>0.3%</b></div>
              {outputAmount > 0 && inputAmount > 0 && (
                <>
                  <div>Price: <b>1 {fromToken} ≈ {(outputAmount / swapAmount).toFixed(6)} {toToken}</b></div>
                  <div>Price: <b>1 {toToken} ≈ {(swapAmount / outputAmount).toFixed(6)} {fromToken}</b></div>
                </>
              )}
            </div>
          )}
        </div>

        {error && <div className="swap-error">{error}</div>}

        <button 
          onClick={handleSwap} 
          disabled={loading || swapLoading || parseFloat(inputAmount) <= 0 || outputAmount <= 0} 
          className="swap-button"
        >
          {loading ? 'Calculating...' : swapLoading ? 'Processing...' : 'Swap'}
        </button>
      </div>
    </div>
  );
};

export default SwapModal; 