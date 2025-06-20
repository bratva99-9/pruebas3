import { UserService } from '../UserService';
import { JsonRpc } from 'eosjs';

const WAX_RPC_URL = 'https://wax.greymass.com';
const ALCOR_API_URL = 'https://wax.alcor.exchange/api/v2';

class SwapService {
  constructor() {
    this.rpc = new JsonRpc(WAX_RPC_URL, { fetch });
    this.supportedTokens = [
      { symbol: 'WAX', contract: 'eosio.token', precision: 8, name: 'WAX' },
      { symbol: 'SEXY', contract: 'nightclub.gm', precision: 8, name: 'SEXY Token' },
      { symbol: 'WAXXX', contract: 'nightclub.gm', precision: 8, name: 'WAXXX Token' }
    ];
  }

  // Obtiene los datos de los pools directamente desde la blockchain
  async getAlcorPools() {
    try {
      const response = await fetch(`${ALCOR_API_URL}/swap/pools`);
      if (!response.ok) {
        throw new Error(`Error al obtener pools de Alcor: ${response.statusText}`);
      }
      const pools = await response.json();
      return pools;
    } catch (error) {
      console.error("Error fetching Alcor pools via API:", error);
      return [];
    }
  }

  // Calcula la cotización usando los datos on-chain
  async getQuote(inputToken, outputToken, amount) {
    if (parseFloat(amount) <= 0 || !amount) return null;

    const inputData = this.supportedTokens.find(t => t.symbol === inputToken);
    const outputData = this.supportedTokens.find(t => t.symbol === outputToken);

    if (!inputData || !outputData) {
      throw new Error("Token no soportado");
    }

    const pools = await this.getAlcorPools();

    const matchingPools = pools.filter(p => {
      const tokenA_match = p.tokenA.symbol === inputData.symbol && p.tokenA.contract === inputData.contract;
      const tokenB_match = p.tokenB.symbol === outputData.symbol && p.tokenB.contract === outputData.contract;
      const reverse_match = p.tokenA.symbol === outputData.symbol && p.tokenA.contract === outputData.contract &&
                            p.tokenB.symbol === inputData.symbol && p.tokenB.contract === inputData.contract;

      return (tokenA_match && tokenB_match) || reverse_match;
    });

    if (matchingPools.length === 0) {
      throw new Error(`No se encontró un pool de liquidez para el par ${inputToken}/${outputToken}.`);
    }

    // Seleccionar el pool con mayor liquidez (usando la suma de cantidades como proxy)
    const bestPool = matchingPools.reduce((best, current) => {
      const bestLiquidity = (best.tokenA.quantity || 0) + (best.tokenB.quantity || 0);
      const currentLiquidity = (current.tokenA.quantity || 0) + (current.tokenB.quantity || 0);
      return currentLiquidity > bestLiquidity ? current : best;
    });
    
    const pool = bestPool;

    // Determinar si el par está invertido
    const isReversed = pool.tokenA.symbol !== inputData.symbol;

    return this.calculateQuote(pool, isReversed, amount);
  }

  calculateQuote(pool, isReversed, amount) {
    const reserveA = pool.tokenA.quantity;
    const reserveB = pool.tokenB.quantity;
    const fee = pool.fee / 10000;

    let reserveIn, reserveOut;

    if (isReversed) {
      reserveIn = reserveB;
      reserveOut = reserveA;
    } else {
      reserveIn = reserveA;
      reserveOut = reserveB;
    }

    if (reserveIn <= 0 || reserveOut <= 0) {
      return 0;
    }

    const amountInWithFee = amount * (1 - fee);
    const quote = (amountInWithFee * reserveOut) / (reserveIn + amountInWithFee);

    return quote;
  }

  // Obtener ruta de swap optimizada
  // async getRoute(inputToken, outputToken, amount) { ... }

  // Ejecutar swap usando la transacción directa al contrato
  async executeSwap(inputToken, outputToken, amount, quote) {
    if (!UserService.isLogged()) throw new Error('Debes iniciar sesión para hacer swap');
    if (!quote || !amount) throw new Error('Información de swap incompleta.');

    const inputTokenData = this.supportedTokens.find(t => t.symbol === inputToken);
    const outputTokenData = this.supportedTokens.find(t => t.symbol === outputToken);
    
    // Calcular min_out con un slippage del 0.5% para seguridad
    const amountOut = parseFloat(quote.outputAmount);
    const minOutAmount = (amountOut * (1 - 0.005)).toFixed(outputTokenData.precision);
    const minOutString = `${minOutAmount} ${outputTokenData.symbol}`;

    const memo = `swap:${minOutString}:${quote.poolId}`;

    const quantity = `${parseFloat(amount).toFixed(inputTokenData.precision)} ${inputTokenData.symbol}`;

    const actions = [{
      account: inputTokenData.contract,
      name: 'transfer',
      authorization: [{ actor: UserService.authName, permission: 'active' }],
      data: {
        from: UserService.authName,
        to: 'alcorammswap',
        quantity: quantity,
        memo: memo
      }
    }];

    const result = await UserService.session.signTransaction({ actions }, { blocksBehind: 3, expireSeconds: 60 });

    if (result && result.processed && result.processed.receipt && result.processed.receipt.status === 'executed') {
      await UserService.reloadBalances();
      return result;
    } else {
      throw new Error('La transacción no se ejecutó correctamente');
    }
  }

  // Obtener precio actual de un token en WAX
  async getTokenPrice(tokenSymbol) {
    try {
      if (tokenSymbol === 'WAX') return 1;

      const quote = await this.getQuote(tokenSymbol, 'WAX', '1.00000000');
      return parseFloat(quote.outputAmount || 0);
    } catch (error) {
      console.error(`Error getting price for ${tokenSymbol}:`, error);
      return 0;
    }
  }

  // Obtener precios de todos los tokens soportados
  async getAllTokenPrices() {
    const prices = {};
    
    for (const token of this.supportedTokens) {
      if (token.symbol !== 'WAX') {
        prices[token.symbol] = await this.getTokenPrice(token.symbol);
      } else {
        prices[token.symbol] = 1;
      }
    }
    
    return prices;
  }

  // Obtener historial de swaps del usuario
  async getUserSwapHistory() {
    if (!UserService.authName) return [];

    try {
      const response = await fetch(`/api_alcor/api/v1/history/swaps?account=${UserService.authName}&limit=100`);
      
      if (!response.ok) {
        throw new Error('Error al obtener historial de swaps');
      }

      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('Error getting swap history:', error);
      return [];
    }
  }

  // Validar si un par de tokens tiene liquidez suficiente
  async validateLiquidity(inputToken, outputToken, amount) {
    try {
      const quote = await this.getQuote(inputToken, outputToken, amount);
      return quote && quote.amount_out && parseFloat(quote.amount_out) > 0;
    } catch (error) {
      return false;
    }
  }

  // Obtener slippage estimado para un swap
  async getEstimatedSlippage(inputToken, outputToken, amount) {
    try {
      const quote1 = await this.getQuote(inputToken, outputToken, amount);
      const quote2 = await this.getQuote(inputToken, outputToken, (parseFloat(amount) * 1.01).toFixed(8));
      
      if (quote1.outputAmount && quote2.outputAmount) {
        const slippage = ((parseFloat(quote2.outputAmount) - parseFloat(quote1.outputAmount)) / parseFloat(quote1.outputAmount)) * 100;
        return Math.abs(slippage);
      }
      
      return 0.5; // Slippage por defecto
    } catch (error) {
      return 0.5;
    }
  }

  async createSwapTransaction(inputToken, outputToken, amount, minExpected, user) {
    const inputData = this.supportedTokens.find(t => t.symbol === inputToken);
    const outputData = this.supportedTokens.find(t => t.symbol === outputToken);

    if (!inputData || !outputData) {
      throw new Error("Token no soportado para la transacción.");
    }

    const pools = await this.getAlcorPools();

    const matchingPools = pools.filter(p => {
      const tokenA_match = p.tokenA.symbol === inputData.symbol && p.tokenA.contract === inputData.contract;
      const tokenB_match = p.tokenB.symbol === outputData.symbol && p.tokenB.contract === outputData.contract;
      const reverse_match = p.tokenA.symbol === outputData.symbol && p.tokenA.contract === outputData.contract &&
                            p.tokenB.symbol === inputData.symbol && p.tokenB.contract === inputData.contract;

      return (tokenA_match && tokenB_match) || reverse_match;
    });

    if (matchingPools.length === 0) {
        throw new Error(`No se encontró un pool de liquidez para el par ${inputToken}/${outputToken}.`);
    }

    const bestPool = matchingPools.reduce((best, current) => {
        const bestLiquidity = (best.tokenA.quantity || 0) + (best.tokenB.quantity || 0);
        const currentLiquidity = (current.tokenA.quantity || 0) + (current.tokenB.quantity || 0);
        return currentLiquidity > bestLiquidity ? current : best;
    });
    
    const pool = bestPool;

    // La memo requiere el ID del pool.
    const poolId = pool.id;
    const minReceived = `${minExpected.toFixed(outputData.precision)} ${outputData.symbol}@${outputData.contract}`;
    const receiver = user;
    const memo = `swapexactin#${poolId}#${receiver}#${minReceived}#`;

    const actions = [
      {
        account: inputData.contract,
        name: 'transfer',
        authorization: [{
          actor: user,
          permission: 'active'
        }],
        data: {
          from: user,
          to: 'swap.alcor',
          quantity: `${parseFloat(amount).toFixed(inputData.precision)} ${inputData.symbol}`,
          memo: memo
        }
      }
    ];

    return UserService.session.signTransaction({ actions }, {
      blocksBehind: 3,
      expireSeconds: 30
    });
  }

  // Devuelve la cotización y el fee real del pool
  async getQuoteWithFee(inputToken, outputToken, amount) {
    const inputData = this.supportedTokens.find(t => t.symbol === inputToken);
    const outputData = this.supportedTokens.find(t => t.symbol === outputToken);

    if (!inputData || !outputData) {
      throw new Error("Token no soportado");
    }

    const pools = await this.getAlcorPools();

    const matchingPools = pools.filter(p => {
      const tokenA_match = p.tokenA.symbol === inputData.symbol && p.tokenA.contract === inputData.contract;
      const tokenB_match = p.tokenB.symbol === outputData.symbol && p.tokenB.contract === outputData.contract;
      const reverse_match = p.tokenA.symbol === outputData.symbol && p.tokenA.contract === outputData.contract &&
                            p.tokenB.symbol === inputData.symbol && p.tokenB.contract === inputData.contract;
      return (tokenA_match && tokenB_match) || reverse_match;
    });

    if (matchingPools.length === 0) {
      throw new Error(`No se encontró un pool de liquidez para el par ${inputToken}/${outputToken}.`);
    }

    const bestPool = matchingPools.reduce((best, current) => {
      const bestLiquidity = (best.tokenA.quantity || 0) + (best.tokenB.quantity || 0);
      const currentLiquidity = (current.tokenA.quantity || 0) + (current.tokenB.quantity || 0);
      return currentLiquidity > bestLiquidity ? current : best;
    });
    const pool = bestPool;
    const isReversed = pool.tokenA.symbol !== inputData.symbol;
    const quote = this.calculateQuote(pool, isReversed, amount);
    const fee = pool.fee / 10000;
    return { quote, fee };
  }

  // Genera solo el memo para el swap de Alcor
  async getSwapMemo(inputToken, outputToken, minExpected, user) {
    const inputData = this.supportedTokens.find(t => t.symbol === inputToken);
    const outputData = this.supportedTokens.find(t => t.symbol === outputToken);
    if (!inputData || !outputData) throw new Error("Token no soportado.");

    const pools = await this.getAlcorPools();
    const matchingPools = pools.filter(p => 
        (p.tokenA.symbol === inputData.symbol && p.tokenA.contract === inputData.contract && p.tokenB.symbol === outputData.symbol && p.tokenB.contract === outputData.contract) ||
        (p.tokenA.symbol === outputData.symbol && p.tokenA.contract === outputData.contract && p.tokenB.symbol === inputData.symbol && p.tokenB.contract === inputData.contract)
    );
    if (matchingPools.length === 0) throw new Error("Pool no encontrado.");

    const bestPool = matchingPools.reduce((best, current) => {
        const bestLiquidity = (best.tokenA.quantity || 0) + (best.tokenB.quantity || 0);
        const currentLiquidity = (current.tokenA.quantity || 0) + (current.tokenB.quantity || 0);
        return currentLiquidity > bestLiquidity ? current : best;
    });

    const poolId = bestPool.id;
    const minReceived = `${minExpected.toFixed(outputData.precision)} ${outputData.symbol}@${outputData.contract}`;
    const receiver = user;
    return `swapexactin#${poolId}#${receiver}#${minReceived}#`;
  }
}

// Exportar una instancia singleton
export default new SwapService(); 