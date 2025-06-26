# Guía de Integración del Frontend para Abrir Packs

Aquí tienes las instrucciones detalladas para que el frontend pueda interactuar con el smart contract de NightClub, permitir a los usuarios abrir packs y mostrar los NFTs que han ganado.

## Flujo General

1.  **Iniciar Transacción**: El usuario hace clic en un botón "Abrir Pack" en el frontend.
2.  **Firmar Transacción**: El frontend prepara una transacción para transferir el NFT del pack al contrato y pide al usuario que la firme con su wallet.
3.  **Obtener Resultado**: Una vez que la transacción se completa, el frontend obtiene el ID de la transacción.
4.  **Consultar Acciones**: El frontend usa el ID de la transacción para consultar una API de historial (AtomicAssets API es la mejor opción) y ver qué NFTs se crearon.
5.  **Mostrar Recompensas**: Con la información de los nuevos NFTs, el frontend muestra los premios al usuario, idealmente con una animación.

---

## Paso 1: Dependencias y Configuración

Necesitarás una librería para comunicarte con la blockchain de WAX. La más recomendada y moderna es **Wharfkit**.

```javascript
// Ejemplo de instalación
// npm install @wharfkit/session @wharfkit/wallet-plugin-cloud-wallet @wharfkit/transact-plugin-resource-provider
```

## Paso 2: Función para Abrir el Pack

Esta función se encargará de todo el proceso.

```javascript
import { Session } from "@wharfkit/session"
import { TransactPluginResourceProvider } from "@wharfkit/transact-plugin-resource-provider"
import { WalletPluginCloudWallet } from "@wharfkit/wallet-plugin-cloud-wallet"

// Configura tu sesión de Wharfkit
const session = new Session({
    chain: {
        id: "1064487b3cd1a897ce03ae5b6a865651747e106c58a6b6b4ba176ce441a46e11", // WAX Mainnet
        url: "https://wax.greymass.com",
    },
    transactPlugins: [new TransactPluginResourceProvider()],
    walletPlugins: [new WalletPluginCloudWallet()], // O el wallet que prefieras
});

/**
 * Inicia el proceso para abrir un pack de NFTs.
 * @param {string} packAssetId - El ID del asset del NFT que representa el pack.
 * @returns {Promise<Array<object>>} - Una promesa que resuelve a una lista de los assets obtenidos.
 */
async function openPackAndGetRewards(packAssetId) {
    try {
        // 1. Iniciar sesión y obtener la sesión del usuario
        const userSession = await session.restore() || await session.login();

        // 2. Definir la acción de transferencia
        const transferAction = {
            account: "atomicassets",
            name: "transfer",
            authorization: [userSession.permissionLevel],
            data: {
                from: userSession.actor,
                to: "nightclubapp", // <-- IMPORTANTE: Reemplazar con la cuenta del contrato
                asset_ids: [packAssetId],
                memo: "unbox",
            },
        };

        // 3. El usuario firma la transacción
        const result = await userSession.transact({ action: transferAction });
        const txid = result.response.transaction_id;
        console.log(`Transacción exitosa: ${txid}`);

        // 4. Esperar un momento para que la API de historial se actualice
        await new Promise(resolve => setTimeout(resolve, 3000));

        // 5. Consultar la API de AtomicAssets para obtener los resultados
        const rewards = await getMintedAssetsFromTx(txid);
        console.log("Recompensas obtenidas:", rewards);

        // 6. Devolver los datos de los nuevos NFTs para la animación
        return rewards;

    } catch (error) {
        console.error("Error al abrir el pack:", error);
        // Devuelve un array vacío o maneja el error como prefieras
        return [];
    }
}

/**
 * Consulta una transacción por su ID para encontrar los NFTs minteados.
 * @param {string} txid - El ID de la transacción.
 * @returns {Promise<Array<object>>} - Una lista de los assets minteados en esa transacción.
 */
async function getMintedAssetsFromTx(txid) {
    try {
        // Usamos la API pública de AtomicAssets
        const response = await fetch(`https://wax.api.atomicassets.io/atomicassets/v1/accounts?tx_id=${txid}`);
        const data = await response.json();

        if (data.success && data.data.length > 0) {
            // La API devuelve una lista de cuentas modificadas en la tx.
            // Los assets recién minteados estarán en la primera cuenta (la del usuario).
            // Filtramos los assets para encontrar los que se crearon en esta transacción.
            const userAssets = data.data[0].assets;
            const newAssets = userAssets.filter(asset => asset.txid_created === txid);
            return newAssets;
        }
        return [];
    } catch (error) {
        console.error("Error consultando la API de AtomicAssets:", error);
        return [];
    }
}

// --- EJEMPLO DE USO ---
// const assetIdToOpen = "1099511627776"; // Reemplazar con el ID real del pack
// openPackAndGetRewards(assetIdToOpen).then(rewards => {
//     if (rewards.length > 0) {
//         // Aquí tienes la lista de los NFTs ganados.
//         // Llama a tu función de animación pasándole `rewards`.
//         // ej: showUnboxingAnimation(rewards);
//     } else {
//         // Hubo un error o no se obtuvieron recompensas
//         console.log("No se obtuvieron recompensas.");
//     }
// });

```

## Resumen para la IA del Frontend

-   **Objetivo**: Implementar la función `openPackAndGetRewards(packAssetId)`.
-   **Input**: El `asset_id` del NFT que el usuario quiere abrir.
-   **Proceso**:
    1.  Usar `wharfkit` para pedir al usuario que firme una transacción `atomicassets::transfer`.
    2.  Los datos de la transferencia deben ser: `from: user`, `to: nightclubapp`, `asset_ids: [packAssetId]`, `memo: unbox`.
    3.  Si la transacción es exitosa, se obtiene un `transaction_id`.
    4.  Llamar a la función `getMintedAssetsFromTx(transaction_id)`.
    5.  Esta función consulta la URL `https://wax.api.atomicassets.io/atomicassets/v1/accounts?tx_id=TRANSACTION_ID`.
    6.  Analiza el JSON de respuesta para extraer los assets cuyo `txid_created` coincida con el ID de la transacción.
-   **Output**: La función debe devolver un array de objetos, donde cada objeto contiene la información de un NFT ganado (template, nombre, imagen, etc.). Este array es el que se usará para la animación. 