import { UALJs } from 'ual-plainjs-renderer';
import { Wax } from '@eosdacio/ual-wax';
import { isEmpty } from 'lodash';
import { Anchor } from 'ual-anchor';
import { JsonRpc } from 'eosjs';

import { storeAppDispatch } from './GlobalState/Store';
import {
  setPlayerBalance,
  setPlayerData,
  setPlayerLogout,
  setPlayerSexy
} from './GlobalState/UserReducer';

export class User {
  // Nombre de la app para UAL
  appName = 'ual_template';

  // Configuración de la cadena WAX
  myChain = {
    chainId: '1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4',
    rpcEndpoints: [{
      protocol: 'https',
      host: 'wax.greymass.com',
      port: ''
    }]
  };

  // Instancia para llamadas RPC
  rpc = new JsonRpc('https://wax.greymass.com');

  // UAL session
  ual;
  authName = undefined;
  serviceLoginName = undefined;
  session = undefined;

  // Balances como strings
  balance = "0.00000000 WAX";
  sexyBalance = "0.00000000 SEXY";
  waxxxBalance = "0.00000000 WAXXX";

  // Callback cuando cambia el estado de login
  callbackServerUserData = undefined;

  // Devuelve el nombre de cuenta activo
  getName() {
    return this.authName;
  }

  // Inicia el flujo de login (click al botón UAL)
  login(callback) {
    const ualButton = document.querySelector(".ual-button-gen");
    if (ualButton) ualButton.click();
    this.callbackServerUserData = callback;
  }

  // ¿Está logueado?
  isLogged() {
    return !isEmpty(this.authName) && !isEmpty(this.session);
  }

  // Logout de UAL y redux
  logout() {
    this.authName = undefined;
    this.session = undefined;
    this.ual.logoutUser();
    storeAppDispatch(setPlayerLogout());
    if (this.callbackServerUserData) this.callbackServerUserData();
  }

  // Callback que recibe UAL cuando el usuario se autentica
  async ualCallback(userObject) {
    this.session = userObject[0];
    this.serviceLoginName = this.session.constructor.name;
    this.authName = await this.session.getAccountName();

    storeAppDispatch(setPlayerData({
      name: this.authName,
      isLogged: this.isLogged(),
      balance: this.balance
    }));

    await this.reloadBalances();
    if (this.callbackServerUserData) this.callbackServerUserData();
  }

  // Recarga ambos balances
  async reloadBalances() {
    await this.getBalance();
    await this.getSexyBalance();
    await this.getWaxxxBalance();
  }

  // WAX on‐chain balance
  getBalance() {
    if (!this.authName) return;
    
    return this.rpc.get_account(this.authName)
      .then(accountData => {
        this.balance = accountData.core_liquid_balance || "0.00000000 WAX";
        storeAppDispatch(setPlayerBalance(this.balance));
      })
      .catch(err => {
        console.error("Error al obtener balance de WAX:", err.message);
        this.balance = "0.00000000 WAX";
        storeAppDispatch(setPlayerBalance(this.balance));
      });
  }

  // SEXY token balance
  async getSexyBalance() {
    if (!this.authName) return;
    
    try {
      const result = await this.rpc.get_currency_balance(
        'nightclub.gm',
        this.authName,
        'SEXY'
      );
      this.sexyBalance = result.length > 0 ? result[0] : "0.00000000 SEXY";
      storeAppDispatch(setPlayerSexy(this.sexyBalance));
    } catch (err) {
      console.error("Error al obtener balance de SEXY:", err.message);
      this.sexyBalance = "0.00000000 SEXY";
      storeAppDispatch(setPlayerSexy(this.sexyBalance));
    }
  }

  // WAXXX token balance
  async getWaxxxBalance() {
    if (!this.authName) return;
    
    try {
      const result = await this.rpc.get_currency_balance(
        'nightclub.gm',
        this.authName,
        'WAXXX'
      );
      this.waxxxBalance = result.length > 0 ? result[0] : "0.00000000 WAXXX";
      // Aquí podrías agregar un dispatch para WAXXX si lo necesitas
    } catch (err) {
      console.error("Error al obtener balance de WAXXX:", err.message);
      this.waxxxBalance = "0.00000000 WAXXX";
    }
  }

  // Enviar NFTs al contrato (misiones, stake, etc.)
  async stakeNFTs(asset_ids, memo = "") {
    if (!this.session || !this.authName) throw new Error("No wallet session activa.");
    if (!Array.isArray(asset_ids) || asset_ids.length === 0) throw new Error("No hay NFTs seleccionados.");

    const actions = [{
      account: "atomicassets",
      name: "transfer",
      authorization: [{ actor: this.authName, permission: "active" }],
      data: {
        from: this.authName,
        to: "nightclubapp",
        asset_ids,
        memo
      }
    }];

    return this.session.signTransaction({ actions }, { blocksBehind: 3, expireSeconds: 60 });
  }

  // Obtener historial de recompensas NFT para el usuario
  async getNFTRewardHistory() {
    if (!this.authName) return [];
    try {
      const response = await fetch(`https://wax.greymass.com/v1/chain/get_table_rows`, {
        method: 'POST',
        body: JSON.stringify({
          code: 'nightclubapp',
          scope: 'nightclubapp',
          table: 'nftrewhist',
          limit: 100,
          reverse: true,
          json: true
        }),
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      // Filtrar solo los del usuario actual
      return (data.rows || []).filter(r => r.user === this.authName);
    } catch (err) {
      console.warn('No se pudo obtener el historial de recompensas NFT:', err);
      return [];
    }
  }

  // Reclamar todas las recompensas
  async claimRewards() {
    if (!this.session || !this.authName) throw new Error("No active session");

    // 1. Obtener historial antes del claim
    const prevRewards = await this.getNFTRewardHistory();
    const prevIds = new Set(prevRewards.map(r => r.id));

    // 2. Hacer claim
    const actions = [{
      account: "nightclubapp",
      name: "claimall",
      authorization: [{ actor: this.authName, permission: "active" }],
      data: { user: this.authName }
    }];
    const result = await this.session.signTransaction({ actions }, { blocksBehind: 3, expireSeconds: 60 });

    // 3. Obtener historial después del claim
    const newRewards = await this.getNFTRewardHistory();
    const justWon = newRewards.filter(r => !prevIds.has(r.id));

    // 4. Notificar
    if (justWon.length > 0) {
      window.dispatchEvent(new CustomEvent('nftRewards', { detail: justWon }));
    } else {
      window.dispatchEvent(new CustomEvent('nftRewards', { detail: [{ empty: true }] }));
    }

    return result;
  }

  // Reclamar recompensa de una misión en específico
  async claimMissionRewards(missionId) {
    if (!this.session || !this.authName) throw new Error("No sesión activa");

    // 1. Obtener historial antes del claim
    const prevRewards = await this.getNFTRewardHistory();
    const prevIds = new Set(prevRewards.map(r => r.id));

    // 2. Hacer claim
    const actions = [{
      account: "nightclubapp",
      name: "claimmission",
      authorization: [{ actor: this.authName, permission: "active" }],
      data: {
        user: this.authName,
        mission_id: missionId
      }
    }];
    const result = await this.session.signTransaction({ actions }, { blocksBehind: 3, expireSeconds: 60 });

    // 3. Obtener historial después del claim
    const newRewards = await this.getNFTRewardHistory();
    const justWon = newRewards.filter(r => !prevIds.has(r.id));

    // 4. Notificar
    if (justWon.length > 0) {
      window.dispatchEvent(new CustomEvent('nftRewards', { detail: justWon }));
    } else {
      window.dispatchEvent(new CustomEvent('nftRewards', { detail: [{ empty: true }] }));
    }

    return result;
  }

  // Reclamar recompensa de una o varias misiones usando la acción 'claim'
  async claimMission(asset_ids) {
    if (!this.session || !this.authName) throw new Error("No sesión activa");
    if (!Array.isArray(asset_ids) || asset_ids.length === 0) throw new Error("No hay asset_ids para reclamar");

    // 1. Obtener historial antes del claim
    const prevRewards = await this.getNFTRewardHistory();
    const prevIds = new Set(prevRewards.map(r => r.id));

    // 2. Hacer claim
    const actions = [{
      account: "nightclubapp",
      name: "claim",
      authorization: [{ actor: this.authName, permission: "active" }],
      data: {
        user: this.authName,
        asset_ids: asset_ids
      }
    }];
    const result = await this.session.signTransaction({ actions }, { blocksBehind: 3, expireSeconds: 60 });

    // 3. Obtener historial después del claim
    const newRewards = await this.getNFTRewardHistory();
    const justWon = newRewards.filter(r => !prevIds.has(r.id));

    // 4. Notificar
    if (justWon.length > 0) {
      window.dispatchEvent(new CustomEvent('nftRewards', { detail: justWon }));
    } else {
      window.dispatchEvent(new CustomEvent('nftRewards', { detail: [{ empty: true }] }));
    }

    return result;
  }

  // Obtener misiones activas del usuario
  async getUserActiveMissions() {
    if (!this.authName) return [];
    
    try {
      const response = await this.rpc.get_table_rows({
        code: 'nightclubapp',
        scope: this.authName,
        table: 'activemissions',
        limit: 100
      });
      return response.rows || [];
    } catch (err) {
      console.error("Error al obtener misiones activas:", err);
      return [];
    }
  }

  // Obtener tipos de misiones disponibles
  async getMissionTypes() {
    try {
      const response = await this.rpc.get_table_rows({
        code: 'nightclubapp',
        scope: 'nightclubapp',
        table: 'missiontypes',
        limit: 100
      });
      return response.rows || [];
    } catch (err) {
      console.error("Error al obtener tipos de misiones:", err);
      return [];
    }
  }

  // Obtener misiones del usuario desde la tabla 'missions' (scope global)
  async getUserMissions() {
    if (!this.authName) return [];
    try {
      const response = await this.rpc.get_table_rows({
        code: 'nightclubapp',
        scope: 'nightclubapp',
        table: 'missions',
        limit: 1000
      });
      return response.rows || [];
    } catch (err) {
      console.error("Error al obtener misiones:", err);
      return [];
    }
  }

  // Cancelar una misión específica
  async cancelMission(asset_id) {
    if (!this.session || !this.authName) throw new Error("No sesión activa");

    const actions = [{
      account: "nightclubapp",
      name: "cancelmiss",
      authorization: [{ actor: this.authName, permission: "active" }],
      data: {
        user: this.authName,
        asset_id: asset_id
      }
    }];

    return this.session.signTransaction({ actions }, { blocksBehind: 3, expireSeconds: 60 });
  }

  // Obtener cooldowns de la tabla cooldowns
  async getCooldowns() {
    try {
      const response = await this.rpc.get_table_rows({
        code: 'nightclubapp',
        scope: 'nightclubapp',
        table: 'cooldowns',
        limit: 1000
      });
      return response.rows || [];
    } catch (err) {
      console.error('Error al obtener cooldowns:', err);
      return [];
    }
  }

  // Inicializa UAL
  init() {
    this.ualCallback = this.ualCallback.bind(this);

    const wax = new Wax([this.myChain], { appName: this.appName });
    const anchor = new Anchor([this.myChain], { appName: this.appName });

    const divUal = document.createElement('div');
    divUal.setAttribute('id', 'ual-login');
    document.body.appendChild(divUal);

    const divLoginRoot = document.getElementById('ual-login');
    this.ual = new UALJs(this.ualCallback, [this.myChain], this.appName, [wax, anchor], {
      containerElement: divLoginRoot
    });

    this.ual.init();
  }

  // Singleton
  static new() {
    if (!User.instance) {
      User.instance = new User();
    }
    return User.instance;
  }

  // Explorar todas las tablas ABI del contrato
  async getContractTables() {
    try {
      const { abi } = await this.rpc.get_abi('nightclubapp');
      if (abi && abi.tables) {
        return abi.tables.map(table => ({
          name: table.name,
          type: table.type,
          indexes: table.indexes
        }));
      }
      return [];
    } catch (err) {
      console.error("Error obteniendo tablas del contrato:", err);
      return [];
    }
  }

  // Formatea el balance WAX con 2 decimales y sufijo
  formatWAXBalance() {
    const wax = parseFloat(this.balance);
    return isNaN(wax) ? "0.00 WAX" : `${wax.toFixed(2)} WAX`;
  }

  // Formatea el balance SEXY con 2 decimales y sufijo
  formatSEXYBalance() {
    const sexy = parseFloat(this.sexyBalance);
    return isNaN(sexy) ? "0.00 SEXY" : `${sexy.toFixed(2)} SEXY`;
  }

  // Formatea el balance WAXXX con 2 decimales y sufijo
  formatWAXXXBalance() {
    const waxxx = parseFloat(this.waxxxBalance);
    return isNaN(waxxx) ? "0.00 WAXXX" : `${waxxx.toFixed(2)} WAXXX`;
  }

  // Sólo número WAX (2 decimales, sin sufijo)
  formatWAXOnly() {
    const wax = parseFloat(this.balance);
    return isNaN(wax) ? "0.00" : wax.toFixed(2);
  }

  // Sólo número SEXY (2 decimales, sin sufijo)
  formatSEXYOnly() {
    const sexy = parseFloat(this.sexyBalance);
    return isNaN(sexy) ? "0.00" : sexy.toFixed(2);
  }

  // Sólo número WAXXX (2 decimales, sin sufijo)
  formatWAXXXOnly() {
    const waxxx = parseFloat(this.waxxxBalance);
    return isNaN(waxxx) ? "0.00" : waxxx.toFixed(2);
  }
}

// Exporta la instancia única
export const UserService = User.new();
