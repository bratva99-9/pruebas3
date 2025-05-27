import { UALJs } from 'ual-plainjs-renderer';
import { Wax } from '@eosdacio/ual-wax';
import { isEmpty } from 'lodash';
import { Anchor } from 'ual-anchor';

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

  ual;
  authName = undefined;
  session = undefined;

  balance = '0.00000000 WAX';
  sexyBalance = '0.00000000 SEXY';
  callbackServerUserData = undefined;

  getName() {
    return this.authName;
  }

  login(callback) {
    const ualButton = document.querySelector('.ual-button-gen');
    if (ualButton) ualButton.click();
    this.callbackServerUserData = callback;
  }

  isLogged() {
    return !isEmpty(this.authName) && !!this.session;
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
    if (!this.session || !this.session.rpc || !this.authName) return;
    return this.session.rpc.get_account(this.authName)
      .then(acc => {
        this.balance = acc.core_liquid_balance || this.balance;
        storeAppDispatch(setPlayerBalance(this.balance));
      })
      .catch(() => {
        this.balance = '0.00000000 WAX';
        storeAppDispatch(setPlayerBalance(this.balance));
      });
  }

  async getSexyBalance() {
    if (!this.session || !this.session.rpc || !this.authName) return;
    try {
      const result = await this.session.rpc.get_currency_balance(
        'nightclub.gm', this.authName, 'SEXY'
      );
      this.sexyBalance = result[0] || this.sexyBalance;
      storeAppDispatch(setPlayerSexy(this.sexyBalance));
    } catch {
      this.sexyBalance = '0.00000000 SEXY';
      storeAppDispatch(setPlayerSexy(this.sexyBalance));
    }
  }

  // Envía transacción de staking sin lecturas de tabla
  async stakeNFTs(asset_ids, memo = '') {
    if (!this.session || !this.authName) throw new Error('No wallet session activa.');
    if (!Array.isArray(asset_ids) || asset_ids.length === 0) throw new Error('No hay NFTs seleccionados.');

    const actions = asset_ids.map(id => ({
      account: 'atomicassets',
      name:    'transfer',
      authorization: [{ actor: this.authName, permission: 'active' }],
      data: { from: this.authName, to: 'nightclubapp', asset_ids: [id], memo }
    }));

    return this.session.signTransaction(
      { actions },
      { blocksBehind: 3, expireSeconds: 60 }
    );
  }

  async unstakeNFTs(asset_ids) {
    if (!this.session || !this.authName) throw new Error('No sesión activa');
    if (!Array.isArray(asset_ids) || asset_ids.length === 0) throw new Error('Debes seleccionar NFTs');

    const actions = [{
      account: 'nightclubapp',
      name:    'unstake',
      authorization: [{ actor: this.authName, permission: 'active' }],
      data: { user: this.authName, asset_ids }
    }];

    return this.session.signTransaction(
      { actions },
      { blocksBehind: 3, expireSeconds: 60 }
    );
  }

  async claimRewards(collection = 'nightclubnft') {
    if (!this.session || !this.authName) throw new Error('No sesión activa');

    const actions = [{
      account: 'nightclubapp',
      name:    'claim',
      authorization: [{ actor: this.authName, permission: 'active' }],
      data: { user: this.authName, collection }
    }];

    return this.session.signTransaction(
      { actions },
      { blocksBehind: 3, expireSeconds: 60 }
    );
  }

  init() {
    this.ualCallback = this.ualCallback.bind(this);
    const wax = new Wax([this.myChain], { appName: this.appName });
    const anchor = new Anchor([this.myChain], { appName: this.appName });
    const div = document.createElement('div');
    div.id = 'ual-login'; document.body.appendChild(div);
    this.ual = new UALJs(
      this.ualCallback, [this.myChain], this.appName, [wax, anchor], { containerElement: div }
    );
    this.ual.init();
  }

  static new() {
    if (!User.instance) User.instance = new User();
    return User.instance;
  }
}

export const UserService = User.new();
