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
  appName = 'ual_template';

  myChain = {
    chainId: '1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4',
    rpcEndpoints: [{
      protocol: 'https',
      host: 'wax.greymass.com',
      port: ''
    }]
  };

  // Instancia global de JsonRpc
  rpc = new JsonRpc('https://wax.greymass.com');

  ual;
  authName = undefined;
  serviceLoginName = undefined;
  session = undefined;

  balance = "0.00000000 WAX";
  sexyBalance = "0.00000000 SEXY";

  callbackServerUserData = undefined;

  getName() {
    return this.authName;
  }

  login(callback) {
    const ualButton = document.querySelector(".ual-button-gen");
    if (ualButton) ualButton.click();
    this.callbackServerUserData = callback;
  }

  isLogged() {
    return !isEmpty(this.authName) && !isEmpty(this.session);
  }

  logout() {
    this.authName = undefined;
    this.session = undefined;
    this.ual.logoutUser();
    storeAppDispatch(setPlayerLogout());
    if (this.callbackServerUserData) this.callbackServerUserData();
  }

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

  async reloadBalances() {
    await this.getBalance();
    await this.getSexyBalance();
  }

  getBalance() {
    if (!this.authName) return;
    
    return this.rpc.get_account(this.authName).then(accountData => {
      this.balance = accountData.core_liquid_balance || "0.00000000 WAX";
      storeAppDispatch(setPlayerBalance(this.balance));
    }).catch(err => {
      console.error("Error al obtener balance de WAX:", err.message);
      this.balance = "0.00000000 WAX";
      storeAppDispatch(setPlayerBalance(this.balance));
    });
  }

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

  async stakeNFTs(asset_ids, memo = "") {
    if (!this.session || !this.authName) throw new Error("No wallet session activa.");
    if (!Array.isArray(asset_ids) || asset_ids.length === 0) throw new Error("No hay NFTs seleccionados.");

    // Directamente enviar los NFTs sin verificar registro
    // El contrato manejará la lógica necesaria al recibir los NFTs con el memo de misión
    const actions = [{
      account: "atomicassets",
      name: "transfer",
      authorization: [{ actor: this.authName, permission: "active" }],
      data: {
        from: this.authName,
        to: "nightclubapp",
        asset_ids: asset_ids,
        memo: memo
      }
    }];

    return this.session.signTransaction({ actions }, { blocksBehind: 3, expireSeconds: 60 });
  }

  async unstakeNFTs(asset_ids) {
    if (!this.session || !this.authName) throw new Error("No sesión activa");
    if (!Array.isArray(asset_ids) || asset_ids.length === 0) throw new Error("Debes seleccionar NFTs");

    const actions = [{
      account: "nightclubapp",
      name: "unstake",
      authorization: [{ actor: this.authName, permission: "active" }],
      data: { user: this.authName, asset_ids }
    }];

    return this.session.signTransaction({ actions }, { blocksBehind: 3, expireSeconds: 60 });
  }

  async claimRewards(collection = "nightclubnft") {
    if (!this.session || !this.authName) throw new Error("No sesión activa");

    const actions = [{
      account: "nightclubapp",
      name: "claim",
      authorization: [{ actor: this.authName, permission: "active" }],
      data: { user: this.authName, collection }
    }];

    return this.session.signTransaction({ actions }, { blocksBehind: 3, expireSeconds: 60 });
  }

  // Nuevo método para obtener misiones activas del usuario
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

  // Nuevo método para obtener tipos de misiones disponibles
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

  // Nuevo método para reclamar recompensas de misión
  async claimMissionRewards(missionId) {
    if (!this.session || !this.authName) throw new Error("No sesión activa");

    const actions = [{
      account: "nightclubapp",
      name: "claimmission",
      authorization: [{ actor: this.authName, permission: "active" }],
      data: { 
        user: this.authName, 
        mission_id: missionId 
      }
    }];

    return this.session.signTransaction({ actions }, { blocksBehind: 3, expireSeconds: 60 });
  }

  formatWAXBalance() {
    const wax = parseFloat(this.balance);
    return isNaN(wax) ? "0.00 WAX" : `${wax.toFixed(2)} WAX`;
  }

  formatSEXYBalance() {
    const sexy = parseFloat(this.sexyBalance);
    return isNaN(sexy) ? "0.00 SEXY" : `${sexy.toFixed(2)} SEXY`;
  }

  formatWAXOnly() {
    const wax = parseFloat(this.balance);
    return isNaN(wax) ? "0.00" : wax.toFixed(2);
  }

  formatSEXYOnly() {
    const sexy = parseFloat(this.sexyBalance);
    return isNaN(sexy) ? "0.00" : sexy.toFixed(2);
  }

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

  static new() {
    if (!User.instance) {
      User.instance = new User();
    }
    return User.instance;
  }
}

export const UserService = User.new();