import React, { useState, useEffect } from 'react';
import { UserService } from '../UserService';
import { swapService } from '../services/SwapService';

const SwapModal = ({ onClose, defaultInput = 'WAX', defaultOutput = 'SEXY' }) => {
  const [inputToken, setInputToken] = useState(defaultInput);
  const [outputToken, setOutputToken] = useState(defaultOutput);
  const [inputAmount, setInputAmount] = useState('');
  const [outputAmount, setOutputAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [swapLoading, setSwapLoading] = useState(false);
  const [error, setError] = useState('');
  const [quote, setQuote] = useState(null);
  const [slippage, setSlippage] = useState(0.5);

  // Tokens disponibles desde el servicio
  const availableTokens = swapService.supportedTokens;

  useEffect(() => {
    let isMounted = true;

    const fetchQuote = async () => {
      if (!inputAmount || parseFloat(inputAmount) <= 0 || !inputToken || !outputToken) {
        if (isMounted) setOutputAmount(0);
        return;
      }

      if (isMounted) {
        setLoading(true);
        setError('');
      }
      
      try {
        const quote = await swapService.getQuote(inputToken, outputToken, parseFloat(inputAmount));
        if (isMounted) setOutputAmount(quote || 0);
      } catch (err) {
        console.error("Error getting quote:", err);
        if (isMounted) {
          setError(err.message || 'Error al obtener cotización');
          setOutputAmount(0);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const debounceTimeout = setTimeout(() => {
      fetchQuote();
    }, 500); // 500ms debounce

    return () => {
      isMounted = false;
      clearTimeout(debounceTimeout);
    };
  }, [inputAmount, inputToken, outputToken]);

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
      // 0.5% slippage
      const minExpected = outputAmount * (1 - 0.005); 
      await swapService.createSwapTransaction(
        inputToken,
        outputToken,
        parseFloat(inputAmount),
        minExpected,
        UserService.authName
      );
      alert('¡Swap exitoso!');
      onClose(); // Cerrar modal al éxito
    } catch (err) {
      console.error('Error executing swap:', err);
      setError(err.message || 'Error al ejecutar el swap.');
    } finally {
      setSwapLoading(false);
    }
  };

  const handleInputChange = (e) => {
    // ... existing code ...
  };

  const switchTokens = () => {
    setInputToken(outputToken);
    setOutputToken(inputToken);
    setInputAmount(outputAmount.toString());
    setOutputAmount(0);
    setQuote(null);
  };

  const getTokenIcon = (symbol) => {
    switch (symbol) {
      case 'WAX':
        return '🟡';
      case 'SEXY':
        return '💖';
      case 'WAXXX':
        return '💎';
      default:
        return '🪙';
    }
  };

  const getTokenBalance = (tokenSymbol) => {
    switch (tokenSymbol) {
      case 'WAX':
        return UserService.formatWAXOnly();
      case 'SEXY':
        return UserService.formatSEXYOnly();
      case 'WAXXX':
        return UserService.formatWAXXXOnly();
      default:
        return '0.00';
    }
  };

  const setMaxAmount = () => {
    const balance = getTokenBalance(inputToken);
    setInputAmount(balance);
  };

  return (
    <div className="swap-modal-overlay" onClick={onClose}>
      <div className="swap-modal" onClick={(e) => e.stopPropagation()}>
        <div className="swap-modal-header">
          <h2>Swap Tokens</h2>
          <button className="swap-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="swap-modal-content">
          {/* Input Token */}
          <div className="swap-input-container">
            <div className="swap-input-header">
              <span>From</span>
              <div className="balance-info">
                <span>Balance: {getTokenBalance(inputToken)} {inputToken}</span>
                <button className="max-btn" onClick={setMaxAmount}>MAX</button>
              </div>
            </div>
            <div className="swap-input-field">
              <div className="token-selector">
                <span className="token-icon">{getTokenIcon(inputToken)}</span>
                <select 
                  value={inputToken} 
                  onChange={(e) => setInputToken(e.target.value)}
                  className="token-select"
                >
                  {availableTokens.map(token => (
                    <option key={token.symbol} value={token.symbol}>
                      {token.symbol}
                    </option>
                  ))}
                </select>
              </div>
              <input
                type="number"
                value={inputAmount}
                onChange={(e) => setInputAmount(e.target.value)}
                placeholder="0.0"
                className="swap-amount-input"
                min="0"
                step="0.00000001"
              />
            </div>
          </div>

          {/* Switch Button */}
          <div className="swap-switch-container">
            <button className="swap-switch-btn" onClick={switchTokens}>
              ↓
            </button>
          </div>

          {/* Output Token */}
          <div className="swap-input-container">
            <div className="swap-input-header">
              <span>To</span>
              <span>Balance: {getTokenBalance(outputToken)} {outputToken}</span>
            </div>
            <div className="swap-input-field">
              <div className="token-selector">
                <span className="token-icon">{getTokenIcon(outputToken)}</span>
                <select 
                  value={outputToken} 
                  onChange={(e) => setOutputToken(e.target.value)}
                  className="token-select"
                >
                  {availableTokens.map(token => (
                    <option key={token.symbol} value={token.symbol}>
                      {token.symbol}
                    </option>
                  ))}
                </select>
              </div>
              <input
                type="number"
                placeholder="0.0"
                value={outputAmount > 0 ? outputAmount.toFixed(8) : '0.0'}
                readOnly
                className="swap-input"
              />
            </div>
          </div>

          {/* Quote Info */}
          {quote && (
            <div className="swap-quote-info">
              <div className="quote-row">
                <span>Rate:</span>
                <span>1 {inputToken} = {(parseFloat(outputAmount) / parseFloat(inputAmount)).toFixed(8)} {outputToken}</span>
              </div>
              <div className="quote-row">
                <span>Slippage:</span>
                <span>{slippage.toFixed(2)}%</span>
              </div>
              <div className="quote-row">
                <span>Fee:</span>
                <span>0.3%</span>
              </div>
              <div className="quote-row">
                <span>Minimum received:</span>
                <span>{(parseFloat(outputAmount) * (1 - slippage / 100)).toFixed(8)} {outputToken}</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="swap-error">
              {error}
            </div>
          )}

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            disabled={loading || swapLoading || parseFloat(inputAmount) <= 0 || outputAmount <= 0}
            className="swap-execute-btn"
          >
            {loading ? 'Calculando...' : swapLoading ? 'Procesando...' : 'Swap'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .swap-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          backdrop-filter: blur(8px);
        }

        .swap-modal {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border: 2px solid #ff36ba;
          border-radius: 20px;
          padding: 24px;
          width: 90%;
          max-width: 480px;
          box-shadow: 0 20px 60px rgba(255, 54, 186, 0.3);
          animation: modalSlideIn 0.3s ease-out;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .swap-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .swap-modal-header h2 {
          color: #fff;
          margin: 0;
          font-size: 24px;
          font-weight: 700;
        }

        .swap-close-btn {
          background: none;
          border: none;
          color: #ff36ba;
          font-size: 28px;
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s;
        }

        .swap-close-btn:hover {
          background: rgba(255, 54, 186, 0.1);
          transform: scale(1.1);
        }

        .swap-input-container {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 54, 186, 0.3);
          border-radius: 16px;
          padding: 16px;
          margin-bottom: 16px;
        }

        .swap-input-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          font-size: 14px;
          color: #b0b0b0;
        }

        .balance-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .max-btn {
          background: linear-gradient(135deg, #ff36ba 0%, #7f36ff 100%);
          border: none;
          border-radius: 8px;
          padding: 4px 8px;
          color: #fff;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .max-btn:hover {
          transform: scale(1.05);
        }

        .swap-input-field {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .token-selector {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 54, 186, 0.1);
          border: 1px solid rgba(255, 54, 186, 0.3);
          border-radius: 12px;
          padding: 8px 12px;
          min-width: 120px;
        }

        .token-icon {
          font-size: 20px;
        }

        .token-select {
          background: none;
          border: none;
          color: #fff;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          outline: none;
        }

        .token-select option {
          background: #1a1a2e;
          color: #fff;
        }

        .swap-amount-input {
          flex: 1;
          background: none;
          border: none;
          color: #fff;
          font-size: 18px;
          font-weight: 600;
          text-align: right;
          outline: none;
          padding: 8px;
        }

        .swap-amount-input::placeholder {
          color: #666;
        }

        .swap-switch-container {
          display: flex;
          justify-content: center;
          margin: 8px 0;
        }

        .swap-switch-btn {
          background: linear-gradient(135deg, #ff36ba 0%, #7f36ff 100%);
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          color: #fff;
          font-size: 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .swap-switch-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 16px rgba(255, 54, 186, 0.4);
        }

        .swap-quote-info {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 54, 186, 0.2);
          border-radius: 12px;
          padding: 16px;
          margin: 16px 0;
        }

        .quote-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
          color: #b0b0b0;
        }

        .quote-row:last-child {
          margin-bottom: 0;
        }

        .swap-error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 12px;
          padding: 12px;
          margin: 16px 0;
          color: #ef4444;
          font-size: 14px;
          text-align: center;
        }

        .swap-execute-btn {
          width: 100%;
          background: linear-gradient(135deg, #ff36ba 0%, #7f36ff 100%);
          border: none;
          border-radius: 16px;
          padding: 16px;
          color: #fff;
          font-size: 18px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 16px;
        }

        .swap-execute-btn:hover:not(.disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(255, 54, 186, 0.4);
        }

        .swap-execute-btn.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }
      `}</style>
    </div>
  );
};

export default SwapModal; 