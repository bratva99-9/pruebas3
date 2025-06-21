import { SessionKit } from '@wharfkit/session';
import { WebRenderer } from '@wharfkit/web-renderer';
import { WalletPluginAnchor } from '@wharfkit/wallet-plugin-anchor';
import { WalletPluginCloudWallet } from '@wharfkit/wallet-plugin-cloudwallet';

// Wharfkit Configuration
const appName = 'ual_template';
const chain = {
    id: '1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4',
    url: 'https://wax.eosphere.io'
};
const walletPlugins = [
    new WalletPluginAnchor(),
    new WalletPluginCloudWallet()
];
const webRenderer = new WebRenderer();
const sessionKit = new SessionKit({
    appName,
    chains: [chain],
    ui: webRenderer,
    walletPlugins,
});

export class User {
    session = undefined;
    authName = undefined;

    balance = "0.00000000 WAX";
    sexyBalance = "0.0000 SEXY";
    waxxxBalance = "0.0000 WAXXX";

    async init() {
        try {
            const restored = await sessionKit.restore();
            if (restored) {
                this.session = restored;
                this.authName = restored.actor.toString();
                await this.reloadBalances();
            }
        } catch (error) {
            console.error("Error restoring session:", error);
        }
    }

    getName() {
        return this.authName;
    }

    async login() {
        try {
            const response = await sessionKit.login();
            this.session = response.session;
            this.authName = response.session.actor.toString();
            await this.reloadBalances();
            return this.session;
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    }

    isLogged() {
        return !!this.session;
    }

    async logout() {
        try {
            await sessionKit.logout();
            this.session = undefined;
            this.authName = undefined;
        } catch (error) {
            console.error("Logout error:", error);
            throw error;
        }
    }

    async transact(actions) {
        if (!this.session) {
            throw new Error('Not logged in to transact.');
        }
        // Note: The `broadcast: true` option is default, so it's not strictly necessary
        return this.session.transact({ actions });
    }

    async reloadBalances() {
        if (!this.authName || !this.session) return;
        
        const rpc = this.session.client.v1.chain;

        try {
            const accountData = await rpc.get_account(this.authName);
            this.balance = accountData.core_liquid_balance ? accountData.core_liquid_balance.toString() : "0.00000000 WAX";
            
            const sexyResult = await rpc.get_currency_balance('nightclub.gm', this.authName, 'SEXY');
            this.sexyBalance = sexyResult.length > 0 ? sexyResult[0].toString() : "0.0000 SEXY";

            const waxxxResult = await rpc.get_currency_balance('nightclub.gm', this.authName, 'WAXXX');
            this.waxxxBalance = waxxxResult.length > 0 ? waxxxResult[0].toString() : "0.0000 WAXXX";

        } catch (err) {
            console.error("Error reloading balances:", err);
        }
    }

    getBalanceBySymbol(symbol) {
        let balanceString = "0.0";
        switch(symbol) {
          case 'WAX':
            balanceString = this.balance;
            break;
          case 'SEXY':
            balanceString = this.sexyBalance;
            break;
          case 'WAXXX':
            balanceString = this.waxxxBalance;
            break;
          default:
            balanceString = "0.0";
        }
        return parseFloat(balanceString) || 0;
    }

    async getCooldowns() {
        if (!this.session) return [];
        try {
            const result = await this.session.client.v1.chain.get_table_rows({
                json: true,
                code: 'nightclubapp',
                scope: 'nightclubapp',
                table: 'cooldowns',
                limit: 1000,
            });
            return result.rows;
        } catch (error) {
            console.error('Error fetching cooldowns:', error);
            return [];
        }
    }

    async stakeNFTs(asset_ids, memo) {
        if (!this.session) throw new Error("Not logged in");
        const actions = [{
            account: 'atomicassets',
            name: 'transfer',
            authorization: [{ actor: this.authName, permission: 'active' }],
            data: {
                from: this.authName,
                to: 'nightclubapp',
                asset_ids: asset_ids,
                memo: memo,
            },
        }];
        return this.transact(actions);
    }

    async getAvailableMissions() {
        if (!this.session) return [];
        try {
            const result = await this.session.client.v1.chain.get_table_rows({
                json: true,
                code: 'nightclubapp',
                scope: 'nightclubapp',
                table: 'missiontempl', // Cargar las plantillas de misiones, no las activas
                limit: 100,
            });
            return result.rows;
        } catch (error) {
            console.error('Error fetching available mission templates:', error);
            throw error;
        }
    }

    async getMissionsWithDetails() {
        if (!this.authName) {
            return [];
        }

        try {
            const missions = await this.getActiveMissions();

            if (missions.length === 0) {
                return [];
            }

            const missionAssetIds = missions.map(m => m.asset_id);
            const idsParam = missionAssetIds.join(',');
            const assetsUrl = `https://wax.api.atomicassets.io/atomicassets/v1/assets?ids=${idsParam}`;
            
            const assetsResponse = await fetch(assetsUrl);
            const assetsData = await assetsResponse.json();

            if (!assetsData.success || !assetsData.data) {
                console.error("Error fetching staked asset details. Returning missions without video.");
                return missions.map(m => ({ ...m, video_url: null }));
            }

            const videoMap = new Map(
                assetsData.data
                    .filter(nft => nft.asset_id && nft.data && nft.data.video)
                    .map(nft => [String(nft.asset_id), `https://ipfs.io/ipfs/${nft.data.video}`])
            );

            const missionsWithVideos = missions.map(mission => {
                const missionAssetId = String(mission.asset_id);
                const videoUrl = videoMap.get(missionAssetId);
                return { ...mission, video_url: videoUrl || null };
            });
            
            return missionsWithVideos;

        } catch (error) {
            console.error("Error in getMissionsWithDetails:", error);
            return [];
        }
    }

    async getActiveMissions() {
        if (!this.session) return [];
        try {
            const result = await this.session.client.v1.chain.get_table_rows({
                json: true,
                code: 'nightclubapp',
                scope: 'nightclubapp',
                table: 'missions',
                limit: 200,
            });
            
            if (result.rows && result.rows.length > 0) {
                const userMissions = result.rows.filter(row => row.user === this.authName);
                return userMissions;
            }
            return [];
        } catch (error) {
            console.error('Error fetching active missions:', error);
            throw error;
        }
    }

    async claimMission(asset_ids) {
        const actions = [{
            account: 'nightclubapp',
            name: 'claim',
            authorization: [{ actor: this.authName, permission: 'active' }],
            data: {
                user: this.authName,
                asset_ids: asset_ids,
            },
        }];
        return this.transact(actions);
    }
    
    async cancelMission(asset_ids) {
        const actions = asset_ids.map(id => ({
            account: 'nightclubapp',
            name: 'cancelmiss',
            authorization: [{ actor: this.authName, permission: 'active' }],
            data: {
                user: this.authName,
                asset_id: id,
            },
        }));
        return this.transact(actions);
    }

    async claimAllMissions() {
        const actions = [{
            account: 'nightclubapp',
            name: 'claimall',
            authorization: [{ actor: this.authName, permission: 'active' }],
            data: {
                user: this.authName,
            },
        }];
        return this.transact(actions);
    }

    // Formatting functions remain the same
    formatWAXOnly() {
        const wax = parseFloat(this.balance);
        return isNaN(wax) ? "0.0000" : wax.toFixed(4);
    }

    formatSEXYOnly() {
        const sexy = parseFloat(this.sexyBalance);
        return isNaN(sexy) ? "0.0000" : sexy.toFixed(4);
    }
    
    formatWAXXXOnly() {
        const waxxx = parseFloat(this.waxxxBalance);
        return isNaN(waxxx) ? "0.00" : waxxx.toFixed(2);
    }
}

export const UserService = new User();
