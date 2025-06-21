import { SessionKit } from '@wharfkit/session';
import { ContractKit } from '@wharfkit/contract';
import { WebRenderer } from '@wharfkit/web-renderer';
import { WalletPluginCloudWallet } from '@wharfkit/wallet-plugin-cloudwallet';
import { WalletPluginAnchor } from '@wharfkit/wallet-plugin-anchor';
import { WalletPluginWombat } from '@wharfkit/wallet-plugin-wombat';
// import { WalletPluginTokenPocket } from '@wharfkit/wallet-plugin-tokenpocket';
// import { WalletPluginScatter } from '@wharfkit/wallet-plugin-scatter';
import { WalletPluginWebAuth } from '@proton/wharfkit-plugin-webauth';
import { nightclubABI } from './abi'; // Corregimos la ruta de importación a './abi'

// Wharfkit Configuration
const appName = 'Night Club Game';
const chain = {
    id: '1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4',
    url: 'https://wax.eosphere.io'
};

// Main SessionKit for all wallets EXCEPT when we force one
const walletPlugins = [
    new WalletPluginCloudWallet({
        // Forzamos el modo de redirección para mejorar la compatibilidad móvil
        loginPopup: false 
    }),
    new WalletPluginAnchor(),
    new WalletPluginWombat(),
    // Se elimina TokenPocket de la lista de plugins
    // new WalletPluginTokenPocket(),
    // new WalletPluginScatter(),
    new WalletPluginWebAuth()
];

const webRenderer = new WebRenderer({
    // Inyecta estilos CSS para forzar el tema oscuro y personalizarlo
    customStyle: `
        .wharf-kit-dialog-backdrop {
            background-color: rgba(0, 0, 0, 0.7) !important;
        }
        .wharf-kit-dialog {
            background: #1a1a2e !important;
            color: #fff !important;
            border-radius: 20px !important;
            box-shadow: 0 0 30px rgba(255, 0, 255, 0.5) !important;
        }
        .wharf-kit-dialog-header {
            background: transparent !important;
            border-bottom: 1px solid rgba(255, 0, 255, 0.2) !important;
        }
        .wharf-kit-dialog-content .wharf-kit-wallet-list .wharf-kit-wallet-button {
            background: rgba(255, 255, 255, 0.05) !important;
            border: 1px solid rgba(255, 0, 255, 0.2) !important;
        }
        .wharf-kit-dialog-content .wharf-kit-wallet-list .wharf-kit-wallet-button:hover {
            background: rgba(255, 0, 255, 0.15) !important;
            border-color: #ff00ff !important;
        }
        .wharf-kit-dialog-footer button {
            background: linear-gradient(135deg, #ff00ff 0%, #b266ff 100%) !important;
            color: white !important;
            border: none !important;
            border-radius: 12px !important;
            font-weight: bold !important;
        }
    `
});
const sessionKit = new SessionKit({
    appName,
    chains: [chain],
    ui: webRenderer,
    walletPlugins,
});

export class User {
    session = undefined;
    authName = undefined;
    contract = undefined;
    isInitializing = true;

    balance = "0.00000000 WAX";
    sexyBalance = "0.0000 SEXY";
    waxxxBalance = "0.0000 WAXXX";

    async init() {
        try {
            const restored = await sessionKit.restore();
            if (restored) {
                this.session = restored;
                this.authName = restored.actor.toString();
                // Se crea el ContractKit aquí, una vez que tenemos una sesión y un cliente válidos.
                const contractKit = new ContractKit({ client: this.session.client });
                // Se carga el contrato 'nightclubapp' y se le pasa el ABI manualmente.
                this.contract = await contractKit.load('nightclubapp', { abi: nightclubABI });
                await this.reloadBalances();
            }
        } catch (error) {
            console.error("Error restoring session:", error);
        } finally {
            this.isInitializing = false;
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
            // Se crea el ContractKit aquí también, después de un inicio de sesión exitoso.
            const contractKit = new ContractKit({ client: this.session.client });
            // Se carga el contrato 'nightclubapp' y se le pasa el ABI manualmente.
            this.contract = await contractKit.load('nightclubapp', { abi: nightclubABI });
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
            this.contract = undefined; // Limpiamos la instancia del contrato al cerrar sesión
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
        if (!this.session) throw new Error("Not logged in");

        // Corregido: El contrato espera un único campo 'asset_ids' que es un array.
        const action = {
            account: 'nightclubapp',
            name: 'claim',
            authorization: [this.session.permissionLevel],
            data: { 
                user: this.authName,
                asset_ids: asset_ids // Ahora pasamos el array completo.
            },
        };

        return this.session.transact({ action });
    }
    
    async cancelMission(asset_ids) {
        if (!this.session) throw new Error("Not logged in");
    
        // Corregido: El contrato espera un único campo 'asset_ids' que es un array.
        const action = {
            account: 'nightclubapp',
            name: 'cancelmiss',
            authorization: [this.session.permissionLevel],
            data: { 
                user: this.authName,
                asset_ids: asset_ids // Ahora pasamos el array completo.
            },
        };
    
        return this.session.transact({ action });
    }

    async claimAllMissions() {
        if (!this.session) throw new Error("Not logged in");

        // Se construye la acción manualmente.
        const action = {
            account: 'nightclubapp',
            name: 'claimall',
            authorization: [this.session.permissionLevel],
            data: { 
                user: this.authName
            },
        };
        
        return this.session.transact({ action });
    }

    formatWAXOnly() {
        if (!this.balance) return '0.0000';
        const num = parseFloat(this.balance.split(' ')[0]);
        return num.toFixed(4);
    }
    
    formatSEXYOnly() {
        if (!this.sexyBalance) return '0.0000';
        const num = parseFloat(this.sexyBalance.split(' ')[0]);
        return num.toFixed(4);
    }
    
    formatWAXXXOnly() {
        if (!this.waxxxBalance) return '0.0000';
        const num = parseFloat(this.waxxxBalance.split(' ')[0]);
        return num.toFixed(4);
    }
}

export const UserService = new User();
