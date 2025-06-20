import React, { useState } from 'react';
import SwapModal from '../components/SwapModal';
import SwapHistoryModal from '../components/SwapHistoryModal';
import { swapService } from '../services/SwapService';

const SwapExample = () => {
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [swapConfig, setSwapConfig] = useState({ input: 'WAX', output: 'SEXY' });
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(false);

  const openSwapModal = (inputToken, outputToken) => {
    setSwapConfig({ input: inputToken, output: outputToken });
    setShowSwapModal(true);
  };

  const getTokenPrices = async () => {
    setLoading(true);
    try {
      const tokenPrices = await swapService.getAllTokenPrices();
      setPrices(tokenPrices);
    } catch (error) {
      console.error('Error getting prices:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#fff', textAlign: 'center', marginBottom: '30px' }}>
        🔄 Ejemplo de Integración de Swap
      </h1>

      {/* Botones de Swap */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px', 
        marginBottom: '30px' 
      }}>
        <button
          onClick={() => openSwapModal('WAX', 'SEXY')}
          style={{
            background: 'linear-gradient(135deg, #ff36ba 0%, #7f36ff 100%)',
            border: 'none',
            borderRadius: '12px',
            padding: '16px',
            color: '#fff',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          🟡 WAX → 💖 SEXY
        </button>

        <button
          onClick={() => openSwapModal('WAX', 'WAXXX')}
          style={{
            background: 'linear-gradient(135deg, #ff36ba 0%, #7f36ff 100%)',
            border: 'none',
            borderRadius: '12px',
            padding: '16px',
            color: '#fff',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          🟡 WAX → 💎 WAXXX
        </button>

        <button
          onClick={() => openSwapModal('SEXY', 'WAX')}
          style={{
            background: 'linear-gradient(135deg, #ff36ba 0%, #7f36ff 100%)',
            border: 'none',
            borderRadius: '12px',
            padding: '16px',
            color: '#fff',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          💖 SEXY → 🟡 WAX
        </button>

        <button
          onClick={() => openSwapModal('WAXXX', 'WAX')}
          style={{
            background: 'linear-gradient(135deg, #ff36ba 0%, #7f36ff 100%)',
            border: 'none',
            borderRadius: '12px',
            padding: '16px',
            color: '#fff',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          💎 WAXXX → 🟡 WAX
        </button>
      </div>

      {/* Botones de Acción */}
      <div style={{ 
        display: 'flex', 
        gap: '20px', 
        justifyContent: 'center', 
        marginBottom: '30px' 
      }}>
        <button
          onClick={() => setShowHistoryModal(true)}
          style={{
            background: 'rgba(255, 54, 186, 0.1)',
            border: '2px solid #ff36ba',
            borderRadius: '12px',
            padding: '12px 24px',
            color: '#ff36ba',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          📊 Ver Historial
        </button>

        <button
          onClick={getTokenPrices}
          disabled={loading}
          style={{
            background: 'rgba(127, 54, 255, 0.1)',
            border: '2px solid #7f36ff',
            borderRadius: '12px',
            padding: '12px 24px',
            color: '#7f36ff',
            fontSize: '14px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            opacity: loading ? 0.5 : 1
          }}
        >
          {loading ? '⏳ Cargando...' : '💰 Ver Precios'}
        </button>
      </div>

      {/* Precios de Tokens */}
      {Object.keys(prices).length > 0 && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 54, 186, 0.3)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '30px'
        }}>
          <h3 style={{ color: '#fff', marginBottom: '16px', textAlign: 'center' }}>
            💰 Precios Actuales (en WAX)
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '16px' 
          }}>
            {Object.entries(prices).map(([token, price]) => (
              <div key={token} style={{
                background: 'rgba(255, 54, 186, 0.1)',
                border: '1px solid rgba(255, 54, 186, 0.3)',
                borderRadius: '12px',
                padding: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>
                  {token === 'WAX' ? '🟡' : token === 'SEXY' ? '💖' : '💎'}
                </div>
                <div style={{ color: '#fff', fontWeight: '600', marginBottom: '4px' }}>
                  {token}
                </div>
                <div style={{ color: '#ff36ba', fontSize: '14px' }}>
                  {price.toFixed(8)} WAX
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Información de la API */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 54, 186, 0.2)',
        borderRadius: '16px',
        padding: '20px'
      }}>
        <h3 style={{ color: '#fff', marginBottom: '16px' }}>
          🔧 Información Técnica
        </h3>
        <div style={{ color: '#b0b0b0', fontSize: '14px', lineHeight: '1.6' }}>
          <p><strong>API Utilizada:</strong> Alcor Exchange (https://wax.alcor.exchange/api/v2)</p>
          <p><strong>Blockchain:</strong> WAX</p>
          <p><strong>Tokens Soportados:</strong> WAX, SEXY, WAXXX</p>
          <p><strong>Funcionalidades:</strong> Cotizaciones en tiempo real, swaps nativos, historial de transacciones</p>
          <p><strong>Seguridad:</strong> Validaciones de balance, slippage, y permisos de wallet</p>
        </div>
      </div>

      {/* Modales */}
      {showSwapModal && (
        <SwapModal
          onClose={() => setShowSwapModal(false)}
          defaultInput={swapConfig.input}
          defaultOutput={swapConfig.output}
        />
      )}

      {showHistoryModal && (
        <SwapHistoryModal
          onClose={() => setShowHistoryModal(false)}
        />
      )}
    </div>
  );
};

export default SwapExample; 