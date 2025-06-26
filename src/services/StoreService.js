import { UserService } from '../UserService';

const CONTRACT_NAME = 'nightclubapp';

export const StoreService = {
  getStoreItems: async () => {
    try {
      if (!UserService.session) {
        throw new Error("User session not available (Wharfkit)");
      }
      
      const res = await UserService.session.client.v1.chain.get_table_rows({
        json: true,
        code: CONTRACT_NAME,
        scope: CONTRACT_NAME,
        table: 'storeitems',
        limit: 100,
      });

      console.log('Store items response:', res);

      if (res.rows) {
        return res.rows.map(item => ({
          ...item,
          prices: {
            WAX: item.price_wax,
            SEXY: item.price_sexy,
            WAXXX: item.price_waxxx,
          },
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting store items:', error);
      return [];
    }
  },

  purchaseItem: async (actor, itemId, currency, priceString) => {
    try {
        const [amount, symbol] = priceString.split(' ');
        
        let tokenContract;
        const memo = `buy-item:${itemId}`;
        let precision;

        switch(symbol) {
            case 'WAX':
                tokenContract = 'eosio.token';
                precision = 8;
                break;
            case 'SEXY':
            case 'WAXXX':
                tokenContract = 'nightclub.gm';
                precision = 8;
                break;
            default:
                throw new Error(`Unsupported currency symbol: ${symbol}`);
        }

        const quantity = `${parseFloat(amount).toFixed(precision)} ${symbol}`;

        const action = {
            account: tokenContract,
            name: 'transfer',
            authorization: [{
                actor: actor,
                permission: 'active',
            }],
            data: {
                from: actor,
                to: CONTRACT_NAME,
                quantity: quantity,
                memo: memo,
            },
        };

      await UserService.transact([action]);
    } catch (e) {
      console.error('Error in purchaseItem:', e);
      throw e;
    }
  },
};
