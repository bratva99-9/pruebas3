// NightClub Game – Sistema de Tipos de Misión v2.1
// Compilable con CDT 4.0.x  |  Compatible Leap 5.x
// REQUISITOS: colección "nightclubnft", token contract "nightclub.gm" (símbolo SEXY, 8 dec)
// NUEVA FUNCIONALIDAD: NFT Rewards configurables en caliente

#include <eosio/eosio.hpp>
#include <eosio/asset.hpp>
#include <eosio/time.hpp>
#include "atomicassets-interface.hpp"
#include <eosio/crypto.hpp>

using namespace eosio;
using std::vector;
using std::string;

CONTRACT nightclub : public contract {
public:
    using contract::contract;

    // ======================== CONSTANTES GLOBALES ========================
    static constexpr symbol   SEXY_SYMBOL               = symbol("SEXY", 8);
    static constexpr symbol   WAXXX_SYMBOL              = symbol("WAXXX", 8);
    static constexpr symbol   WAX_SYMBOL                = symbol("WAX", 8);
    static inline const asset    BASE_REWARD               = asset(100000000, SEXY_SYMBOL); // 1 SEXY (8 dec)
    static constexpr name     TOKEN_CONTRACT            = name("nightclub.gm");
    static constexpr name     NFT_COLLECTION            = name("nightclubnft");
    
    // ========== CONSTANTES PARA NFT REWARDS (ahora configurables) ==========
    static constexpr uint32_t BASE_NFT_DROP_PERCENT     = 1;  // 1% base

    // ============================== TABLAS ==============================
    
    // NUEVA: Tabla de historial de recompensas NFT
    TABLE nftrewardhistory_s {
        uint64_t id;
        name user;
        uint64_t reward_id;
        uint64_t asset_id;
        string reward_name;
        string schema;
        int32_t template_id;
        uint32_t timestamp;

        uint64_t primary_key() const { return id; }
        uint64_t by_user() const { return user.value; }
        uint64_t by_reward() const { return reward_id; }
    };
    typedef multi_index<"nftrewhist"_n, nftrewardhistory_s,
        indexed_by<"byuser"_n, const_mem_fun<nftrewardhistory_s, uint64_t, &nftrewardhistory_s::by_user>>,
        indexed_by<"byreward"_n, const_mem_fun<nftrewardhistory_s, uint64_t, &nftrewardhistory_s::by_reward>>
    > nftrewardhistory_t;

    // ============================== ACCIONES =============================
    [[eosio::action]]
    void claim(name user, std::vector<uint64_t> asset_ids);

    [[eosio::action]]
    void claimall(name user);

    [[eosio::action]]
    void emergstop(bool stop);

    // Gestión de templates (legacy - mantener compatibilidad)
    [[eosio::action]]
    void settempl(int32_t template_id, double reward_mult, double dur_mult, 
                  double cool_mult, double drop_mult);

    [[eosio::action]]
    void rmtempl(int32_t template_id);

    // ========== ACCIONES PARA TIPOS DE MISIÓN ==========
    [[eosio::action]]
    void setmission(uint64_t id, string name, string description,
                    uint32_t duration_minutes, double reward_multiplier,
                    double nft_drop_multiplier, bool is_active);

    [[eosio::action]]
    void rmmission(uint64_t id);

    [[eosio::action]]
    void togglmission(uint64_t id, bool active);

    [[eosio::action]]
    void initmissions();

    // ========== NUEVAS ACCIONES PARA NFT REWARDS CONFIGURABLES ==========
    [[eosio::action]]
    void setnftrew(uint64_t id, name schema, int32_t template_id, 
                   uint32_t weight, uint32_t max_mints, bool is_active,
                   string reward_name, string description);

    [[eosio::action]]
    void rmnftrew(uint64_t id);

    [[eosio::action]]
    void togglnftrew(uint64_t id, bool active);

    [[eosio::action]]
    void updatenftrew(uint64_t id, uint32_t weight, uint32_t max_mints);

    [[eosio::action]]
    void initnftrew();

    [[eosio::action]]
    void resetmints(uint64_t reward_id);

    // ========== ACCIONES PARA LA TIENDA ==========
    [[eosio::action]]
    void additem(uint64_t item_id, string title, string description, int32_t template_id,
                 asset price_wax, asset price_sexy, asset price_waxxx, uint32_t stock);

    [[eosio::action]]
    void rmvitem(uint64_t item_id);

    [[eosio::action]]
    void updprice(uint64_t item_id, asset price_wax, asset price_sexy, asset price_waxxx);

    [[eosio::action]]
    void addstock(uint64_t item_id, uint32_t quantity);

    // ========== NUEVAS ACCIONES PARA UPGRADES ==========
    // Estructura para los ingredientes de una receta
    struct ingredient {
        int32_t  template_id;
        uint32_t quantity;
    };

    [[eosio::action]]
    void addupgrade(uint64_t upgrade_id, string title, int32_t result_template_id,
                    vector<ingredient> ingredients, asset cost_sexy, asset cost_waxxx,
                    bool is_active);

    [[eosio::action]]
    void rmvupgrade(uint64_t upgrade_id);

    [[eosio::action]]
    void toggleupgr(uint64_t upgrade_id, bool is_active);

    [[eosio::action]]
    void cancelupgr(name user);

    // ========== NUEVAS ACCIONES PARA SISTEMA DE PACKS ==========
    struct pack_content {
        int32_t  template_id;
        uint32_t weight;
        uint32_t min_quantity;
        uint32_t max_quantity;
    };

    [[eosio::action]]
    void setpack(uint64_t pack_id, string name, string description, 
                 vector<pack_content> contents, uint32_t total_drops);

    [[eosio::action]]
    void rmpack(uint64_t pack_id);

    [[eosio::action]]
    void openpack(name user, uint64_t pack_asset_id);

    // Utilidades
    [[eosio::action]]
    void cleancool();

    [[eosio::action]]
    void logmission(name user, uint64_t asset_id, uint64_t mission_id, std::string status);

    [[eosio::action]]
    void lognftmint(name user, uint64_t reward_id, uint64_t asset_id, std::string result);

    // Handler de transfer de AtomicAssets
    [[eosio::on_notify("atomicassets::transfer")]]
    void on_nft_transfer(name from, name to, vector<uint64_t> asset_ids, std::string memo);

    [[eosio::action]]
    void forcecool();

    [[eosio::action]]
    void cancelmiss(name user, uint64_t asset_id);

    // NUEVA ACCIÓN PARA LIMPIAR HISTORIAL DE NFT REWARDS
    [[eosio::action]]
    void cleannfthist();

    // NUEVAS ACCIONES PARA CONSULTAR RECOMPENSAS NFT
    [[eosio::action]]
    void getrewards(name user);

    [[eosio::action]]
    void getall();

    [[eosio::action]]
    void logreward(name user, std::vector<nftrewardhistory_s> rewards);

    [[eosio::action]]
    void logall(std::vector<nftrewardhistory_s> rewards);

    // NUEVO: Handlers para pagos de la tienda
    [[eosio::on_notify("eosio.token::transfer")]]
    void on_wax_transfer(name from, name to, asset quantity, std::string memo);

    [[eosio::on_notify("nightclub.gm::transfer")]]
    void on_token_transfer(name from, name to, asset quantity, std::string memo);

    [[eosio::on_notify("atomicassets::burnasset")]]
    void on_burn_asset(name asset_owner, uint64_t asset_id);

private:
    // ============================== TABLAS ==============================
    
    // Tipos de misión configurables
    TABLE missiontype_s {
        uint64_t id;
        string name;                    // "Quick Recon", "VIP Operation"
        string description;             // Descripción para UI
        uint32_t duration_minutes;      // Duración en minutos
        double reward_multiplier;       // Multiplicador sobre BASE_REWARD
        double nft_drop_multiplier;     // Multiplicador sobre BASE_NFT_DROP_PERCENT
        bool is_active;                 // Si está disponible
        uint32_t created_at;            // Timestamp de creación

        uint64_t primary_key() const { return id; }
        uint64_t by_name() const { return std::hash<string>{}(name); }
    };
    typedef multi_index<"missiontypes"_n, missiontype_s,
        indexed_by<"byname"_n, const_mem_fun<missiontype_s, uint64_t, &missiontype_s::by_name>>
    > missiontypes_t;

    // NUEVA: NFT Rewards configurables
    TABLE nftreward_s {
        uint64_t id;
        name schema;                    // Schema del NFT (ej: "items", "characters")
        int32_t template_id;            // Template ID específico
        uint32_t weight;                // Peso para sistema de probabilidad (1-1000)
        uint32_t max_mints;             // Límite máximo de mints (0 = ilimitado)
        uint32_t current_mints;         // Counter actual de mints
        bool is_active;                 // Si está disponible para mint
        string reward_name;                    // Nombre del reward para UI
        string description;             // Descripción del reward
        uint32_t created_at;            // Timestamp de creación

        uint64_t primary_key() const { return id; }
        uint64_t by_template() const { return static_cast<uint64_t>(template_id); }
        uint64_t by_schema() const { return schema.value; }
        uint64_t by_weight() const { return weight; }
    };
    typedef multi_index<"nftrewards"_n, nftreward_s,
        indexed_by<"bytemplate"_n, const_mem_fun<nftreward_s, uint64_t, &nftreward_s::by_template>>,
        indexed_by<"byschema"_n, const_mem_fun<nftreward_s, uint64_t, &nftreward_s::by_schema>>,
        indexed_by<"byweight"_n, const_mem_fun<nftreward_s, uint64_t, &nftreward_s::by_weight>>
    > nftrewards_t;

    // NUEVA: Tabla para la Tienda de NFTs
    TABLE storeitem_s {
        uint64_t item_id;            // ID único del item que tú defines
        string   title;              // Título para mostrar en la tienda
        string   description;        // Descripción para mostrar
        int32_t  template_id;        // Template del NFT a la venta
        asset    price_wax;          // Precio en WAX
        asset    price_sexy;         // Precio en SEXY
        asset    price_waxxx;        // Precio en WAXXX
        uint32_t stock;              // Cuántos se pueden mintear/vender
        uint32_t sold_count;         // Cuántos se han vendido

        uint64_t primary_key() const { return item_id; }
        uint64_t by_template() const { return static_cast<uint64_t>(template_id); }
    };
    typedef multi_index<"storeitems"_n, storeitem_s,
        indexed_by<"bytemplate"_n, const_mem_fun<storeitem_s, uint64_t, &storeitem_s::by_template>>
    > storeitems_t;

    // =================  NUEVAS TABLAS PARA UPGRADES =================

    // Tabla para las recetas de upgrade
    TABLE upgraderec_s {
        uint64_t                upgrade_id;
        string                  title;
        int32_t                 result_template_id;
        vector<ingredient>      ingredients;
        asset                   cost_sexy;
        asset                   cost_waxxx;
        bool                    is_active;

        uint64_t primary_key() const { return upgrade_id; }
    };
    typedef multi_index<"upgraderecs"_n, upgraderec_s> upgraderecs_t;
    
    // NUEVA TABLA: Upgrades pendientes (actúa como escrow)
    TABLE pendingupgr_s {
        name                    user;
        uint64_t                upgrade_id;
        vector<uint64_t>        asset_ids;
        
        uint64_t primary_key() const { return user.value; }
    };
    typedef multi_index<"pendingupgrs"_n, pendingupgr_s> pendingupgrs_t;

    // Tabla para el historial de upgrades
    TABLE upgradehist_s {
        uint64_t    id;
        name        user;
        uint64_t    upgrade_id;
        uint64_t    new_asset_id; // Se podría popular con un log posterior
        uint32_t    timestamp;

        uint64_t primary_key() const { return id; }
        uint64_t by_user() const { return user.value; }
    };
    typedef multi_index<"upgradehist"_n, upgradehist_s,
        indexed_by<"byuser"_n, const_mem_fun<upgradehist_s, uint64_t, &upgradehist_s::by_user>>
    > upgradehist_t;

    // Misiones activas (actualizada)
    TABLE missions_s {
        uint64_t id;
        name     user;
        uint64_t asset_id;
        int32_t  template_id;
        uint64_t mission_type_id;       // referencia al tipo de misión
        uint32_t start_time;
        uint32_t end_time;
        asset    reward;
        double   nft_drop_chance;       // chance específica de esta misión

        uint64_t primary_key() const { return id; }
        uint64_t by_asset()   const { return asset_id; }
        uint64_t by_user()    const { return user.value; }
    };
    typedef multi_index<"missions"_n, missions_s,
        indexed_by<"byasset"_n, const_mem_fun<missions_s,uint64_t,&missions_s::by_asset>>,
        indexed_by<"byuser"_n,  const_mem_fun<missions_s,uint64_t,&missions_s::by_user>>
    > missions_t;

    // Cooldowns (sin cambios)
    TABLE cooldown_s {
        uint64_t asset_id;
        uint32_t last_claim_time;
        uint64_t primary_key() const { return asset_id; }
    };
    typedef multi_index<"cooldowns"_n, cooldown_s> cooldowns_t;

    // Multiplicadores por template (legacy - mantener)
    TABLE templerew_s {
        int32_t template_id;
        double  reward_mult   = 1.0;
        double  dur_mult      = 1.0;
        double  cool_mult     = 1.0;
        double  drop_mult     = 1.0;
        uint64_t primary_key() const { return static_cast<uint64_t>(template_id); }
    };
    typedef multi_index<"templerew"_n, templerew_s> templerew_t;

    // =================  NUEVAS TABLAS PARA SISTEMA DE PACKS =================
    // NOTA: Si el compilador da un error sobre que estas tablas no son accesibles,
    // deberán moverse a la sección 'public:' del contrato.
    TABLE pack_s {
        uint64_t pack_id;
        string name;
        string description;
        vector<pack_content> contents;
        uint32_t total_drops;

        uint64_t primary_key() const { return pack_id; }
    };
    typedef multi_index<"packs"_n, pack_s> packs_t;

    TABLE packhistory_s {
        uint64_t id;
        name user;
        uint64_t pack_id;
        uint64_t pack_asset_id;
        vector<int32_t> obtained_templates;
        uint32_t timestamp;

        uint64_t primary_key() const { return id; }
        uint64_t by_user() const { return user.value; }
    };
    typedef multi_index<"packhistory"_n, packhistory_s,
        indexed_by<"byuser"_n, const_mem_fun<packhistory_s, uint64_t, &packhistory_s::by_user>>
    > packhistory_t;

    // Helpers
    void start_mission(name user, uint64_t asset_id, int32_t template_id, uint64_t mission_type_id);
    uint64_t parse_mission_type_from_memo(const string& memo);
    uint64_t get_default_mission_type();
    void transfer_nft_back(name to, uint64_t asset_id);
    void send_reward(name to, const asset& quantity);
    uint64_t select_nft_reward(); // Nueva función para seleccionar NFT reward
    void mint_selected_nft(name to, uint64_t reward_id);
    bool is_mission_ready(const missions_s& m) const {
        return current_time_point().sec_since_epoch() >= m.end_time;
    }

    // --- Lógica de Upgrade ---
    void process_upgrade_payment(name from, asset quantity);

    // --- Logica de Compra ---
    void handle_payment(name from, asset quantity, string memo);

    // --- Lógica de Packs ---
    void process_pack_opening(name user, uint64_t pack_asset_id);
    vector<int32_t> select_pack_contents(const pack_s& pack);
    void mint_pack_rewards(name to, const vector<int32_t>& templates);
    int32_t get_pack_template_id(uint64_t pack_asset_id);
};

// ===================== IMPLEMENTACIÓN DE ACCIONES ======================

void nightclub::on_nft_transfer(name from, name to, vector<uint64_t> asset_ids, std::string memo) {
    // Solo procesar NFTs que llegan al contrato y no son del contrato mismo
    if (to != get_self() || from == get_self()) return;

    if (memo == "unbox") {
        check(asset_ids.size() == 1, "Solo puedes abrir un pack a la vez.");
        process_pack_opening(from, asset_ids[0]);
        return;
    }

    // Lógica para iniciar un upgrade
    const string prefix = "upgrade:";
    if (memo.rfind(prefix, 0) == 0) {
        string id_str = memo.substr(prefix.size());
        uint64_t upgrade_id = std::stoull(id_str);

        upgraderecs_t upgrades(get_self(), get_self().value);
        auto recipe_it = upgrades.find(upgrade_id);
        check(recipe_it != upgrades.end(), "La receta de upgrade no existe.");
        check(recipe_it->is_active, "Esta receta de upgrade está desactivada.");

        // Verificar que los assets depositados coinciden con la receta
        std::map<int32_t, uint32_t> provided_templates;
        auto assets_tbl = atomicassets::get_assets(get_self());
        for(const auto& asset_id : asset_ids) {
            auto asset_it = assets_tbl.find(asset_id);
            check(asset_it != assets_tbl.end(), "Asset " + to_string(asset_id) + " no encontrado en la cuenta del contrato (esto no debería pasar).");
            provided_templates[asset_it->template_id]++;
        }
        
        check(provided_templates.size() == recipe_it->ingredients.size(), "La cantidad de tipos de templates no coincide con la receta.");
        for (const auto& required : recipe_it->ingredients) {
            check(provided_templates.count(required.template_id), "Falta el template ID requerido: " + to_string(required.template_id));
            check(provided_templates.at(required.template_id) == required.quantity, "La cantidad para el template ID " + to_string(required.template_id) + " no es correcta.");
        }

        // Crear el registro del upgrade pendiente
        pendingupgrs_t pending_tbl(get_self(), get_self().value);
        auto pending_it = pending_tbl.find(from.value);
        check(pending_it == pending_tbl.end(), "Ya tienes un upgrade pendiente. Cancélalo o complétalo primero.");
        
        pending_tbl.emplace(get_self(), [&](auto& p) {
            p.user = from;
            p.upgrade_id = upgrade_id;
            p.asset_ids = asset_ids;
        });
        
        print(">> Ingredientes para upgrade ", upgrade_id, " recibidos. Esperando pago.\n");
        return; // Termina la ejecución aquí para no interferir con la lógica de misiones.
    }

    // Si el memo no es para un upgrade, se asume que es para una misión.
    print("NFT transfer para misión recibido de: ", from, " con memo: '", memo, "'\n");

    // Lógica de Misiones (la original)
    uint64_t mission_type_id = parse_mission_type_from_memo(memo);
    for (uint64_t asset_id : asset_ids) {
        auto assets_tbl = atomicassets::get_assets(get_self());
        auto ait = assets_tbl.find(asset_id);
        check(ait != assets_tbl.end(), "NFT no encontrado tras transferir");
        check(ait->collection_name == NFT_COLLECTION, "Solo se aceptan NFTs de nightclubnft");
        print("Iniciando misión tipo ", mission_type_id, " para NFT ID: ", asset_id, "\n");
        start_mission(from, asset_id, ait->template_id, mission_type_id);
    }
}

void nightclub::start_mission(name user, uint64_t asset_id, int32_t template_id, uint64_t mission_type_id) {
    missions_t missions(get_self(), get_self().value);
    auto byasset = missions.get_index<"byasset"_n>();
    check(byasset.find(asset_id) == byasset.end(), "Este NFT ya está en misión");

    // Obtener configuración del tipo de misión
    missiontypes_t mtypes(get_self(), get_self().value);
    auto mtype_it = mtypes.find(mission_type_id);
    check(mtype_it != mtypes.end(), "Tipo de misión no existe");
    check(mtype_it->is_active, "Tipo de misión desactivado");

    // Verificar cooldown
    cooldowns_t cds(get_self(), get_self().value);
    auto cd_it = cds.find(asset_id);
    
    if (cd_it != cds.end()) {
        check(current_time_point().sec_since_epoch() >= cd_it->last_claim_time,
              "NFT aún en cooldown");
    }

    // Obtener multiplicadores del template
    templerew_t trew(get_self(), get_self().value);
    auto trew_it = trew.find(template_id);
    double reward_mult = trew_it != trew.end() ? trew_it->reward_mult : 1.0;
    double dur_mult = trew_it != trew.end() ? trew_it->dur_mult : 1.0;
    double drop_mult = trew_it != trew.end() ? trew_it->drop_mult : 1.0;

    // Validar multiplicadores
    if (reward_mult <= 0.0) reward_mult = 1.0;
    if (dur_mult <= 0.0) dur_mult = 1.0;
    if (drop_mult <= 0.0) drop_mult = 1.0;

    uint32_t now = current_time_point().sec_since_epoch();
    uint32_t duration_sec = static_cast<uint32_t>(mtype_it->duration_minutes * 60 * dur_mult);
    uint32_t end_time = now + duration_sec;

    // Calcular recompensa efectiva (aplicando multiplicadores de template y tipo de misión)
    asset eff_reward = BASE_REWARD;
    eff_reward.amount = static_cast<int64_t>(BASE_REWARD.amount * mtype_it->reward_multiplier * reward_mult);

    // Crear misión
    uint64_t mid = missions.available_primary_key();
    missions.emplace(get_self(), [&](auto& m){
        m.id = mid == 0 ? 1 : mid;
        m.user = user;
        m.asset_id = asset_id;
        m.template_id = template_id;
        m.mission_type_id = mission_type_id;
        m.start_time = now;
        m.end_time = end_time;
        m.reward = eff_reward;
        m.nft_drop_chance = BASE_NFT_DROP_PERCENT * mtype_it->nft_drop_multiplier * drop_mult;
    });

    print("Misión '", mtype_it->name, "' creada para ", user, " - Duración: ", 
          mtype_it->duration_minutes * dur_mult, " min, Recompensa: ", eff_reward, "\n");

    // Log de misión iniciada
    action(permission_level{get_self(), "active"_n},
           get_self(), "logmission"_n,
           std::make_tuple(user, asset_id, mid, std::string("started")))
    .send();
}

void nightclub::claim(name user, std::vector<uint64_t> asset_ids) {
    require_auth(user);
    check(!asset_ids.empty(), "Debes enviar al menos un asset_id");
    check(asset_ids.size() <= 10, "Máximo 10 NFTs por transacción");

    missions_t missions(get_self(), get_self().value);
    cooldowns_t cds(get_self(), get_self().value);
    templerew_t trew(get_self(), get_self().value);

    asset total_reward(0, SEXY_SYMBOL);

    for (uint64_t aid : asset_ids) {
        // Validaciones
        auto byasset = missions.get_index<"byasset"_n>();
        auto mit = byasset.find(aid);
        check(mit != byasset.end(), "No hay misión para ese NFT");
        check(mit->user == user, "No eres dueño de la misión");
        check(is_mission_ready(*mit), "La misión aún no ha terminado");

        uint32_t now = current_time_point().sec_since_epoch();
        // Obtener multiplicador de cooldown del template
        auto trew_it = trew.find(mit->template_id);
        double cool_mult = trew_it != trew.end() ? trew_it->cool_mult : 1.0;
        if (cool_mult <= 0.0) {
            cool_mult = 1.0;
        }
        double base_cooldown_sec = 3600.0; // 1 hora
        double eff_cool = base_cooldown_sec * cool_mult;
        uint32_t cooldown_end = now + static_cast<uint32_t>(eff_cool);
        // Actualizar cooldown
        auto cd_it = cds.find(aid);
        if (cd_it == cds.end()) {
            cds.emplace(get_self(), [&](auto& c){
                c.asset_id = aid;
                c.last_claim_time = cooldown_end;
            });
        } else {
            cds.modify(cd_it, get_self(), [&](auto& c){
                c.last_claim_time = cooldown_end;
            });
        }
        // Acumular reward y devolver NFT
        total_reward += mit->reward;
        transfer_nft_back(user, aid);
        // Probabilidad de NFT drop usando la chance específica de la misión
        uint32_t eff_pct = std::min<uint32_t>(static_cast<uint32_t>(mit->nft_drop_chance), 100);
        struct Entropy { uint32_t t; uint64_t id; };
        Entropy e{ now, aid };
        checksum256 seed = sha256(reinterpret_cast<char*>(&e), sizeof(e));
        auto arr = seed.extract_as_byte_array();
        uint8_t roll = arr[0] % 100;
        
        // Log detallado del roll
        print("NFT ID ", aid, " - Roll: ", (int)roll, " vs Chance: ", eff_pct, "%\n");
        
        if (roll < eff_pct) {
            uint64_t selected_reward_id = select_nft_reward();
            if (selected_reward_id > 0) {
                // Obtener información del reward antes de mintear
                nftrewards_t nftrew(get_self(), get_self().value);
                auto reward_it = nftrew.find(selected_reward_id);
                if (reward_it != nftrew.end()) {
                    print("¡FELICIDADES! Has ganado un NFT: ", reward_it->reward_name, 
                          " (ID: ", selected_reward_id, ")\n");
                }
                
                mint_selected_nft(user, selected_reward_id);
                action(permission_level{get_self(), "active"_n},
                       get_self(), "lognftmint"_n,
                       std::make_tuple(user, selected_reward_id, aid, 
                                     std::string("success - Roll: ") + std::to_string(roll) + 
                                     " vs Chance: " + std::to_string(eff_pct)))
                .send();
            } else {
                print("No hay recompensas NFT disponibles en este momento\n");
                action(permission_level{get_self(), "active"_n},
                       get_self(), "lognftmint"_n,
                       std::make_tuple(user, uint64_t(0), aid, 
                                     std::string("no_rewards_available - Roll: ") + std::to_string(roll) + 
                                     " vs Chance: " + std::to_string(eff_pct)))
                .send();
            }
        } else {
            print("No ganaste un NFT esta vez (Roll: ", (int)roll, " vs Chance: ", eff_pct, "%)\n");
            action(permission_level{get_self(), "active"_n},
                   get_self(), "lognftmint"_n,
                   std::make_tuple(user, uint64_t(0), aid, 
                                 std::string("no_win - Roll: ") + std::to_string(roll) + 
                                 " vs Chance: " + std::to_string(eff_pct)))
            .send();
        }
        byasset.erase(mit);
        action(permission_level{get_self(), "active"_n},
               get_self(), "logmission"_n,
               std::make_tuple(user, aid, uint64_t(0), std::string("completed")))
        .send();
    }
    if (total_reward.amount > 0) {
        send_reward(user, total_reward);
    }
}

void nightclub::claimall(name user) {
    require_auth(user);
    missions_t missions(get_self(), get_self().value);
    auto byuser = missions.get_index<"byuser"_n>();

    vector<uint64_t> assets;
    uint32_t count = 0;
    for (auto it = byuser.lower_bound(user.value); it != byuser.upper_bound(user.value) && count < 10; ++it) {
        if (is_mission_ready(*it)) {
            assets.push_back(it->asset_id);
            count++;
        }
    }
    check(!assets.empty(), "No hay misiones completadas para reclamar");
    
    claim(user, assets);
}

// ========== NUEVAS ACCIONES PARA NFT REWARDS CONFIGURABLES ==========

void nightclub::setnftrew(uint64_t id,
                          name     schema,
                          int32_t  template_id,
                          uint32_t weight,
                          uint32_t max_mints,
                          bool     is_active,
                          string   reward_name,    // <-- renombrado
                          string   description) {
    require_auth(get_self());

    check(template_id > 0, "Template ID debe ser positivo");
    check(weight > 0 && weight <= 1000, "Peso debe estar entre 1 y 1000");
    check(reward_name.length() > 0 && reward_name.length() <= 32,
          "Nombre debe tener 1-32 caracteres");  // usa reward_name
    check(description.length() <= 128, "Descripción máximo 128 caracteres");

    nftrewards_t nftrew(get_self(), get_self().value);
    auto it = nftrew.find(id);

    if (it == nftrew.end()) {
        nftrew.emplace(get_self(), [&](auto& nr) {
            nr.id            = id;
            nr.schema        = schema;
            nr.template_id   = template_id;
            nr.weight        = weight;
            nr.max_mints     = max_mints;
            nr.current_mints = 0;
            nr.is_active     = is_active;
            nr.reward_name   = reward_name;  // asigna reward_name
            nr.description   = description;
            nr.created_at    = current_time_point().sec_since_epoch();
        });
        print("NFT Reward '", reward_name, "' creado con ID ", id, "\n");
    } else {
        nftrew.modify(it, get_self(), [&](auto& nr) {
            nr.schema      = schema;
            nr.template_id = template_id;
            nr.weight      = weight;
            nr.max_mints   = max_mints;
            nr.is_active   = is_active;
            nr.reward_name = reward_name;    // y aquí
            nr.description = description;
        });
        print("NFT Reward ID ", id, " actualizado\n");
    }
}


void nightclub::rmnftrew(uint64_t id) {
    require_auth(get_self());
    
    nftrewards_t nftrew(get_self(), get_self().value);
    auto it = nftrew.find(id);
    check(it != nftrew.end(), "NFT Reward no encontrado");
    
    nftrew.erase(it);
    print("NFT Reward ID ", id, " eliminado\n");
}

void nightclub::togglnftrew(uint64_t id, bool active) {
    require_auth(get_self());
    
    nftrewards_t nftrew(get_self(), get_self().value);
    auto it = nftrew.find(id);
    check(it != nftrew.end(), "NFT Reward no encontrado");
    
    nftrew.modify(it, get_self(), [&](auto& nr) {
        nr.is_active = active;
    });
    
    print("NFT Reward ID ", id, active ? " activado" : " desactivado", "\n");
}

void nightclub::updatenftrew(uint64_t id, uint32_t weight, uint32_t max_mints) {
    require_auth(get_self());
    
    check(weight > 0 && weight <= 1000, "Peso debe estar entre 1 y 1000");
    
    nftrewards_t nftrew(get_self(), get_self().value);
    auto it = nftrew.find(id);
    check(it != nftrew.end(), "NFT Reward no encontrado");
    
    nftrew.modify(it, get_self(), [&](auto& nr) {
        nr.weight = weight;
        nr.max_mints = max_mints;
    });
    
    print("NFT Reward ID ", id, " - peso: ", weight, ", max_mints: ", max_mints, "\n");
}

void nightclub::initnftrew() {
    require_auth(get_self());
    
    // Crear NFT rewards por defecto si no existen
    nftrewards_t nftrew(get_self(), get_self().value);
    
    if (nftrew.find(1) == nftrew.end()) {
        setnftrew(1, name("items"), 822311, 500, 0, true,
                  "Common Item", "Basic reward item");
    }
    
    if (nftrew.find(2) == nftrew.end()) {
        setnftrew(2, name("items"), 822312, 300, 1000, true,
                  "Rare Item", "Limited rare reward");
    }
    
    if (nftrew.find(3) == nftrew.end()) {
        setnftrew(3, name("characters"), 822313, 150, 500, true,
                  "Epic Character", "Epic character reward");
    }
    
    if (nftrew.find(4) == nftrew.end()) {
        setnftrew(4, name("items"), 822314, 50, 100, true,
                  "Legendary Item", "Ultra rare legendary item");
    }
    
    print("NFT Rewards por defecto inicializados\n");
}

void nightclub::resetmints(uint64_t reward_id) {
    require_auth(get_self());
    
    nftrewards_t nftrew(get_self(), get_self().value);
    auto it = nftrew.find(reward_id);
    check(it != nftrew.end(), "NFT Reward no encontrado");
    
    nftrew.modify(it, get_self(), [&](auto& nr) {
        nr.current_mints = 0;
    });
    
    print("Contador de mints reseteado para reward ID ", reward_id, "\n");
}

// ========== ACCIONES PARA TIPOS DE MISIÓN ==========

void nightclub::setmission(uint64_t id, string name, string description,
                           uint32_t duration_minutes, double reward_multiplier,
                           double nft_drop_multiplier, bool is_active) {
    require_auth(get_self());
    
    check(duration_minutes > 0 && duration_minutes <= 10080, "Duración debe ser 1-10080 minutos (1 semana max)");
    check(reward_multiplier > 0 && reward_multiplier <= 100, "Multiplicador de recompensa debe ser 0.1-100");
    check(nft_drop_multiplier >= 0 && nft_drop_multiplier <= 50, "Multiplicador de drop debe ser 0-50");
    check(name.length() > 0 && name.length() <= 32, "Nombre debe tener 1-32 caracteres");
    check(description.length() <= 128, "Descripción máximo 128 caracteres");

    missiontypes_t mtypes(get_self(), get_self().value);
    auto it = mtypes.find(id);

    if (it == mtypes.end()) {
        mtypes.emplace(get_self(), [&](auto& mt) {
            mt.id = id;
            mt.name = name;
            mt.description = description;
            mt.duration_minutes = duration_minutes;
            mt.reward_multiplier = reward_multiplier;
            mt.nft_drop_multiplier = nft_drop_multiplier;
            mt.is_active = is_active;
            mt.created_at = current_time_point().sec_since_epoch();
        });
        print("Tipo de misión '", name, "' creado con ID ", id, "\n");
    } else {
        mtypes.modify(it, get_self(), [&](auto& mt) {
            mt.name = name;
            mt.description = description;
            mt.duration_minutes = duration_minutes;
            mt.reward_multiplier = reward_multiplier;
            mt.nft_drop_multiplier = nft_drop_multiplier;
            mt.is_active = is_active;
        });
        print("Tipo de misión ID ", id, " actualizado\n");
    }
}

void nightclub::rmmission(uint64_t id) {
    require_auth(get_self());
    
    missiontypes_t mtypes(get_self(), get_self().value);
    auto it = mtypes.find(id);
    check(it != mtypes.end(), "Tipo de misión no encontrado");
    
    // Verificar que no hay misiones activas de este tipo
    missions_t missions(get_self(), get_self().value);
    auto m_it = missions.begin();
    while (m_it != missions.end()) {
        check(m_it->mission_type_id != id, "No se puede eliminar: hay misiones activas de este tipo");
        ++m_it;
    }
    
    mtypes.erase(it);
    print("Tipo de misión ID ", id, " eliminado\n");
}

void nightclub::togglmission(uint64_t id, bool active) {
    require_auth(get_self());
    
    missiontypes_t mtypes(get_self(), get_self().value);
    auto it = mtypes.find(id);
    check(it != mtypes.end(), "Tipo de misión no encontrado");
    
    mtypes.modify(it, get_self(), [&](auto& mt) {
        mt.is_active = active;
    });
    
    print("Tipo de misión ID ", id, active ? " activado" : " desactivado", "\n");
}

void nightclub::initmissions() {
    require_auth(get_self());
    
    // Crear misiones por defecto si no existen
    missiontypes_t mtypes(get_self(), get_self().value);
    
    if (mtypes.find(1) == mtypes.end()) {
        setmission(1, "Quick Recon", "Fast mission with basic rewards", 
                   15, 0.5, 0.5, true);
    }
    
    if (mtypes.find(2) == mtypes.end()) {
        setmission(2, "Standard Op", "Balanced mission for regular play", 
                   60, 1.0, 1.0, true);
    }
    
    if (mtypes.find(3) == mtypes.end()) {
        setmission(3, "Deep Cover", "Long mission with high rewards", 
                   240, 3.0, 2.0, true);
    }
    
    if (mtypes.find(4) == mtypes.end()) {
        setmission(4, "VIP Operation", "Premium mission with maximum rewards", 
                   480, 6.0, 4.0, true);
    }
    
    print("Misiones por defecto inicializadas\n");
}

// ========== NUEVAS FUNCIONES HELPER PARA NFT REWARDS ==========

uint64_t nightclub::select_nft_reward() {
    nftrewards_t nftrew(get_self(), get_self().value);
    
    // Filtrar rewards activos y disponibles
    vector<uint64_t> available_rewards;
    uint32_t total_weight = 0;
    
    for (auto it = nftrew.begin(); it != nftrew.end(); ++it) {
        if (it->is_active && (it->max_mints == 0 || it->current_mints < it->max_mints)) {
            available_rewards.push_back(it->id);
            total_weight += it->weight;
        }
    }
    
    if (available_rewards.empty() || total_weight == 0) {
        return 0; // No hay rewards disponibles
    }
    
    // Generar número aleatorio basado en timestamp y datos del contrato
    uint32_t now = current_time_point().sec_since_epoch();
    uint64_t contract_value = get_self().value;
    struct RandomSeed { uint32_t t; uint64_t cv; uint32_t tw; };
    RandomSeed rs{ now, contract_value, total_weight };
    checksum256 seed = sha256(reinterpret_cast<char*>(&rs), sizeof(rs));
    auto arr = seed.extract_as_byte_array();
    
    // Convertir bytes a número random
    uint32_t random_num = 0;
    for (int i = 0; i < 4; i++) {
        random_num = (random_num << 8) | arr[i];
    }
    uint32_t roll = random_num % total_weight;
    
    // Seleccionar reward basado en peso
    uint32_t cumulative_weight = 0;
    for (uint64_t reward_id : available_rewards) {
        auto reward_it = nftrew.find(reward_id);
        cumulative_weight += reward_it->weight;
        if (roll < cumulative_weight) {
            return reward_id;
        }
    }
    
    // Fallback (no debería llegar aquí)
    return available_rewards[0];
}

void nightclub::mint_selected_nft(name to, uint64_t reward_id) {
    nftrewards_t nftrew(get_self(), get_self().value);
    auto reward_it = nftrew.find(reward_id);
    check(reward_it != nftrew.end(), "NFT Reward no encontrado");
    check(reward_it->is_active, "NFT Reward no está activo");
    check(reward_it->max_mints == 0 || reward_it->current_mints < reward_it->max_mints,
          "Límite de mints alcanzado");

    print("Iniciando mint de NFT Reward ID: ", reward_id, "\n");
    print("Detalles del NFT:\n");
    print("- Nombre: ", reward_it->reward_name, "\n");
    print("- Schema: ", reward_it->schema, "\n");
    print("- Template ID: ", reward_it->template_id, "\n");
    print("- Mints actuales: ", reward_it->current_mints);
    if (reward_it->max_mints > 0) {
        print(" de ", reward_it->max_mints, "\n");
    } else {
        print(" (sin límite)\n");
    }

    // Incrementar contador de mints
    nftrew.modify(reward_it, get_self(), [&](auto& nr) {
        nr.current_mints++;
    });

    print("Mintando NFT para usuario: ", to, "\n");

    // Obtener el schema_name del template
    auto templates = atomicassets::get_templates(NFT_COLLECTION);
    auto template_itr = templates.find(reward_it->template_id);
    check(template_itr != templates.end(), "Template ID no encontrado en la colección");
    name schema_name = template_itr->schema_name;

    // Mintear el NFT
    action(
        permission_level{get_self(), "active"_n},
        "atomicassets"_n, "mintasset"_n,
        std::make_tuple(
            get_self(), NFT_COLLECTION, schema_name, reward_it->template_id, to,
            vector<atomicassets::ATTRIBUTE_MAP>{},
            vector<atomicassets::ATTRIBUTE_MAP>{},
            vector<atomicassets::ATTRIBUTE_MAP>{}
        )
    ).send();

    print("NFT minteado exitosamente\n");

    // Guardar en el historial
    nftrewardhistory_t history(get_self(), get_self().value);
    history.emplace(get_self(), [&](auto& h) {
        h.id = history.available_primary_key();
        h.user = to;
        h.reward_id = reward_id;
        h.asset_id = 0; // Se actualizará después
        h.reward_name = reward_it->reward_name;
        h.schema = reward_it->schema.to_string();
        h.template_id = reward_it->template_id;
        h.timestamp = current_time_point().sec_since_epoch();
    });

    print("Historial actualizado\n");

    // Notificar al frontend
    action(
        permission_level{get_self(), "active"_n},
        get_self(),
        "logreward"_n,
        std::make_tuple(to, vector<nftrewardhistory_s>{*history.rbegin()})
    ).send();

    print("Notificación enviada al frontend\n");
    print("NFT '", reward_it->reward_name, "' minteado para ", to,
          " (Mint #", reward_it->current_mints, ")\n");
}


// ========== FUNCIONES HELPER EXISTENTES ==========

uint64_t nightclub::parse_mission_type_from_memo(const string& memo) {
    // Si viene vacío, uso por defecto
    if (memo.empty()) return get_default_mission_type();

    // Busco el prefijo "mission:"
    const string prefix = "mission:";
    if (memo.size() > prefix.size() && memo.rfind(prefix, 0) == 0) {
        string id_str = memo.substr(prefix.size());
        // Conversión manual sin try/catch
        bool is_number = true;
        uint64_t mtid = 0;
        for (char c : id_str) {
            if (c >= '0' && c <= '9') {
                mtid = mtid * 10 + (c - '0');
            } else {
                is_number = false;
                break;
            }
        }
        if (is_number) {
            // Compruebo que exista y esté activo
            missiontypes_t mtypes(get_self(), get_self().value);
            auto it = mtypes.find(mtid);
            if (it != mtypes.end() && it->is_active) {
                return mtid;
            }
        }
    }

    // Si llego aquí, uso el default
    return get_default_mission_type();
}


uint64_t nightclub::get_default_mission_type() {
    missiontypes_t mtypes(get_self(), get_self().value);
    
    // Buscar primera misión activa
    for (auto it = mtypes.begin(); it != mtypes.end(); ++it) {
        if (it->is_active) {
            return it->id;
        }
    }
    
    // Si no hay misiones activas, retornar ID 2 (Standard Op) como fallback
    return 2;
}

void nightclub::transfer_nft_back(name to, uint64_t asset_id) {
    vector<uint64_t> asset_ids = { asset_id };
    
    action(
        permission_level{get_self(), "active"_n},
        "atomicassets"_n,
        "transfer"_n,
        std::make_tuple(get_self(), to, asset_ids, string("Mission completed"))
    ).send();
    
    print("NFT ID ", asset_id, " devuelto a ", to, "\n");
}

void nightclub::send_reward(name to, const asset& quantity) {
    check(quantity.amount > 0, "La cantidad debe ser positiva");
    check(quantity.symbol == SEXY_SYMBOL, "Símbolo de token incorrecto");
    
    action(
        permission_level{get_self(), "active"_n},
        TOKEN_CONTRACT,
        "transfer"_n,
        std::make_tuple(get_self(), to, quantity, string("Mission reward"))
    ).send();
    
    print("Enviado ", quantity, " a ", to, "\n");
}

// ========== ACCIONES LEGACY Y UTILIDADES ==========

void nightclub::settempl(int32_t template_id, double reward_mult, double dur_mult, 
                         double cool_mult, double drop_mult) {
    require_auth(get_self());
    
    check(template_id > 0, "Template ID debe ser positivo");
    check(reward_mult > 0 && reward_mult <= 100, "Multiplicador de recompensa: 0.1-100");
    check(dur_mult > 0 && dur_mult <= 50, "Multiplicador de duración: 0.1-50");
    check(cool_mult > 0 && cool_mult <= 50, "Multiplicador de cooldown: 0.1-50");
    check(drop_mult >= 0 && drop_mult <= 50, "Multiplicador de drop: 0-50");

    templerew_t trew(get_self(), get_self().value);
    auto it = trew.find(template_id);

    if (it == trew.end()) {
        trew.emplace(get_self(), [&](auto& t) {
            t.template_id = template_id;
            t.reward_mult = reward_mult;
            t.dur_mult = dur_mult;
            t.cool_mult = cool_mult;
            t.drop_mult = drop_mult;
        });
        print("Template ", template_id, " configurado\n");
    } else {
        trew.modify(it, get_self(), [&](auto& t) {
            t.reward_mult = reward_mult;
            t.dur_mult = dur_mult;
            t.cool_mult = cool_mult;
            t.drop_mult = drop_mult;
        });
        print("Template ", template_id, " actualizado\n");
    }
}

void nightclub::rmtempl(int32_t template_id) {
    require_auth(get_self());
    
    templerew_t trew(get_self(), get_self().value);
    auto it = trew.find(template_id);
    check(it != trew.end(), "Template no encontrado");
    
    trew.erase(it);
    print("Template ", template_id, " eliminado\n");
}

void nightclub::emergstop(bool stop) {
    require_auth(get_self());
    
    // Esta función puede implementarse según necesidades específicas
    // Por ejemplo, desactivar todas las misiones o pausar el contrato
    if (stop) {
        missiontypes_t mtypes(get_self(), get_self().value);
        for (auto it = mtypes.begin(); it != mtypes.end(); ++it) {
            mtypes.modify(it, get_self(), [&](auto& mt) {
                mt.is_active = false;
            });
        }
        print("EMERGENCIA: Todas las misiones desactivadas\n");
    } else {
        print("Sistema reanudado - reactivar misiones manualmente\n");
    }
}

void nightclub::cleancool() {
    require_auth(get_self());
    
    cooldowns_t cds(get_self(), get_self().value);
    uint32_t now = current_time_point().sec_since_epoch();
    uint32_t cleaned = 0;
    
    auto it = cds.begin();
    while (it != cds.end()) {
        // Si el cooldown ya terminó, eliminar el registro
        if (now >= it->last_claim_time) {
            it = cds.erase(it);
            cleaned++;
        } else {
            ++it;
        }
    }
    
    print("Limpiados ", cleaned, " cooldowns terminados\n");
}

void nightclub::logmission(name user, uint64_t asset_id, uint64_t mission_id, std::string status) {
    require_auth(get_self());
    // Esta acción solo registra logs - no necesita lógica adicional
    print("LOG: Usuario ", user, " - NFT ", asset_id, " - Misión ", mission_id, " - Estado: ", status, "\n");
}

void nightclub::lognftmint(name user, uint64_t reward_id, uint64_t asset_id, std::string result) {
    require_auth(get_self());
    // Esta acción solo registra logs de mints de NFT
    print("LOG NFT: Usuario ", user, " - Reward ", reward_id, " - NFT ", asset_id, " - Resultado: ", result, "\n");
}

void nightclub::forcecool() {
    require_auth(get_self());
    cooldowns_t cds(get_self(), get_self().value);
    uint32_t cleaned = 0;
    auto it = cds.begin();
    while (it != cds.end()) {
        it = cds.erase(it);
        cleaned++;
    }
    print("Eliminados ", cleaned, " cooldowns (forzado)\n");
}

void nightclub::cancelmiss(name user, uint64_t asset_id) {
    require_auth(user);
    missions_t missions(get_self(), get_self().value);
    auto byasset = missions.get_index<"byasset"_n>();
    auto mit = byasset.find(asset_id);
    check(mit != byasset.end(), "No hay misión activa para ese NFT");
    check(mit->user == user, "No eres dueño de la misión");
    // Eliminar misión y devolver NFT
    transfer_nft_back(user, asset_id);
    byasset.erase(mit);
    print("Misión cancelada y NFT devuelto");
}

// NUEVAS ACCIONES PARA CONSULTAR RECOMPENSAS NFT

void nightclub::getrewards(name user) {
    require_auth(user);
    
    // Asegurar que el nombre está normalizado
    check(user.value != 0, "Nombre de usuario inválido");
    check(user.length() <= 12, "Nombre de usuario demasiado largo");
    
    nftrewardhistory_t history(get_self(), get_self().value);
    auto byuser = history.get_index<"byuser"_n>();
    vector<nftrewardhistory_s> rewards;
    
    for (auto it = byuser.lower_bound(user.value); it != byuser.upper_bound(user.value); ++it) {
        rewards.push_back(*it);
    }
    
    action(
        permission_level{get_self(), "active"_n},
        get_self(),
        "logreward"_n,
        std::make_tuple(user, rewards)
    ).send();
}

void nightclub::getall() {
    require_auth(get_self());
    
    nftrewardhistory_t history(get_self(), get_self().value);
    auto byuser = history.get_index<"byuser"_n>();
    vector<nftrewardhistory_s> rewards;
    
    for (auto it = byuser.begin(); it != byuser.end(); ++it) {
        rewards.push_back(*it);
    }
    
    action(
        permission_level{get_self(), "active"_n},
        get_self(),
        "logall"_n,
        std::make_tuple(rewards)
    ).send();
}

void nightclub::logreward(name user, std::vector<nftrewardhistory_s> rewards) {
    require_auth(get_self());
    for (const auto& reward : rewards) {
        print("LOG: Usuario ", user, " - Reward ", reward.reward_id, " - NFT ", reward.asset_id, " - Nombre: ", reward.reward_name, "\n");
    }
}

void nightclub::logall(std::vector<nftrewardhistory_s> rewards) {
    require_auth(get_self());
    for (const auto& reward : rewards) {
        print("LOG: Usuario ", reward.user, " - Reward ", reward.reward_id, " - NFT ", reward.asset_id, " - Nombre: ", reward.reward_name, "\n");
    }
}

// NUEVA ACCIÓN PARA LIMPIAR HISTORIAL DE NFT REWARDS
void nightclub::cleannfthist() {
    require_auth(get_self());
    
    nftrewardhistory_t history(get_self(), get_self().value);
    auto byuser = history.get_index<"byuser"_n>();
    uint32_t cleaned = 0;
    
    // Agrupar registros por usuario
    name current_user = name(0);
    vector<uint64_t> user_records;
    
    for (auto it = byuser.begin(); it != byuser.end(); ++it) {
        if (it->user != current_user) {
            // Procesar registros del usuario anterior
            if (user_records.size() > 3) {
                // Ordenar por timestamp (más reciente primero)
                sort(user_records.begin(), user_records.end(), 
                     [&history](uint64_t a, uint64_t b) {
                         auto rec_a = history.find(a);
                         auto rec_b = history.find(b);
                         return rec_a->timestamp > rec_b->timestamp;
                     });
                
                // Eliminar registros antiguos (mantener solo los 3 más recientes)
                for (size_t i = 3; i < user_records.size(); ++i) {
                    auto rec_to_delete = history.find(user_records[i]);
                    if (rec_to_delete != history.end()) {
                        history.erase(rec_to_delete);
                        cleaned++;
                    }
                }
            }
            
            // Iniciar nuevo usuario
            current_user = it->user;
            user_records.clear();
        }
        user_records.push_back(it->id);
    }
    
    // Procesar el último usuario
    if (user_records.size() > 3) {
        sort(user_records.begin(), user_records.end(), 
             [&history](uint64_t a, uint64_t b) {
                 auto rec_a = history.find(a);
                 auto rec_b = history.find(b);
                 return rec_a->timestamp > rec_b->timestamp;
             });
        
        for (size_t i = 3; i < user_records.size(); ++i) {
            auto rec_to_delete = history.find(user_records[i]);
            if (rec_to_delete != history.end()) {
                history.erase(rec_to_delete);
                cleaned++;
            }
        }
    }
    
    print("Limpiados ", cleaned, " registros de historial de NFT Rewards (máximo 3 por usuario)\n");
}

// ========== ACCIONES PARA LA TIENDA ==========

void nightclub::additem(uint64_t item_id, string title, string description, int32_t template_id,
                         asset price_wax, asset price_sexy, asset price_waxxx, uint32_t stock) {
    require_auth(get_self());
    
    check(title.length() > 0 && title.length() <= 64, "El título debe tener entre 1 y 64 caracteres");
    check(description.length() > 0 && description.length() <= 256, "La descripción debe tener entre 1 y 256 caracteres");
    check(price_wax.symbol == WAX_SYMBOL, "Precio WAX usa el símbolo incorrecto");
    check(price_sexy.symbol == SEXY_SYMBOL, "Precio SEXY usa el símbolo incorrecto");
    check(price_waxxx.symbol == WAXXX_SYMBOL, "Precio WAXXX usa el símbolo incorrecto");
    check(stock > 0, "El stock debe ser mayor a 0");

    storeitems_t items(get_self(), get_self().value);
    auto it = items.find(item_id);
    check(it == items.end(), "Ya existe un item con ese ID");

    items.emplace(get_self(), [&](auto& i) {
        i.item_id = item_id;
        i.title = title;
        i.description = description;
        i.template_id = template_id;
        i.price_wax = price_wax;
        i.price_sexy = price_sexy;
        i.price_waxxx = price_waxxx;
        i.stock = stock;
        i.sold_count = 0;
    });

    print(">> Item '", title, "' agregado a la tienda con ID ", item_id, "\n");
}

void nightclub::rmvitem(uint64_t item_id) {
    require_auth(get_self());
    storeitems_t items(get_self(), get_self().value);
    auto it = items.find(item_id);
    check(it != items.end(), "No se encontró el item");
    items.erase(it);
    print("Item ID ", item_id, " eliminado de la tienda\n");
}

void nightclub::updprice(uint64_t item_id, asset price_wax, asset price_sexy, asset price_waxxx) {
    require_auth(get_self());
    check(price_wax.symbol == WAX_SYMBOL, "Precio WAX usa el símbolo incorrecto");
    check(price_sexy.symbol == SEXY_SYMBOL, "Precio SEXY usa el símbolo incorrecto");
    check(price_waxxx.symbol == WAXXX_SYMBOL, "Precio WAXXX usa el símbolo incorrecto");

    storeitems_t items(get_self(), get_self().value);
    auto it = items.find(item_id);
    check(it != items.end(), "No se encontró el item");

    items.modify(it, get_self(), [&](auto& i) {
        i.price_wax = price_wax;
        i.price_sexy = price_sexy;
        i.price_waxxx = price_waxxx;
    });
    print("Precios actualizados para el item ID ", item_id, "\n");
}

void nightclub::addstock(uint64_t item_id, uint32_t quantity) {
    require_auth(get_self());
    check(quantity > 0, "La cantidad debe ser mayor a 0");
    storeitems_t items(get_self(), get_self().value);
    auto it = items.find(item_id);
    check(it != items.end(), "No se encontró el item");

    items.modify(it, get_self(), [&](auto& i) {
        i.stock += quantity;
    });
    print("Stock agregado al item ID ", item_id, "\n");
}

// ========== NUEVAS ACCIONES PARA UPGRADES ==========
void nightclub::addupgrade(uint64_t upgrade_id, string title, int32_t result_template_id,
                          vector<ingredient> ingredients, asset cost_sexy, asset cost_waxxx,
                          bool is_active) {
    require_auth(get_self());
    check(upgrade_id > 0, "Upgrade ID debe ser positivo");
    check(title.length() > 0 && title.length() <= 64, "El título debe tener entre 1 y 64 caracteres");
    check(result_template_id > 0, "Template ID de resultado debe ser positivo");
    check(cost_sexy.amount >= 0 && cost_sexy.symbol == SEXY_SYMBOL, "Costo SEXY debe ser 0 o positivo y usar el símbolo correcto");
    check(cost_waxxx.amount >= 0 && cost_waxxx.symbol == WAXXX_SYMBOL, "Costo WAXXX debe ser 0 o positivo y usar el símbolo correcto");

    upgraderecs_t upgrades(get_self(), get_self().value);
    auto it = upgrades.find(upgrade_id);
    if (it == upgrades.end()) {
        upgrades.emplace(get_self(), [&](auto& u) {
            u.upgrade_id = upgrade_id;
            u.title = title;
            u.result_template_id = result_template_id;
            u.ingredients = ingredients;
            u.cost_sexy = cost_sexy;
            u.cost_waxxx = cost_waxxx;
            u.is_active = is_active;
        });
        print("Upgrade '", title, "' creado con ID ", upgrade_id, "\n");
    } else {
        upgrades.modify(it, get_self(), [&](auto& u) {
            u.title = title;
            u.result_template_id = result_template_id;
            u.ingredients = ingredients;
            u.cost_sexy = cost_sexy;
            u.cost_waxxx = cost_waxxx;
            u.is_active = is_active;
        });
        print("Upgrade ID ", upgrade_id, " actualizado\n");
    }
}

void nightclub::rmvupgrade(uint64_t upgrade_id) {
    require_auth(get_self());
    
    upgraderecs_t upgrades(get_self(), get_self().value);
    auto it = upgrades.find(upgrade_id);
    check(it != upgrades.end(), "Upgrade no encontrado");
    
    upgrades.erase(it);
    print("Upgrade ID ", upgrade_id, " eliminado\n");
}

void nightclub::toggleupgr(uint64_t upgrade_id, bool is_active) {
    require_auth(get_self());
    
    upgraderecs_t upgrades(get_self(), get_self().value);
    auto it = upgrades.find(upgrade_id);
    check(it != upgrades.end(), "Upgrade no encontrado");
    
    upgrades.modify(it, get_self(), [&](auto& u) {
        u.is_active = is_active;
    });
    
    print("Upgrade ID ", upgrade_id, is_active ? " activado" : " desactivado", "\n");
}

void nightclub::cancelupgr(name user) {
    require_auth(user);

    pendingupgrs_t pending_tbl(get_self(), get_self().value);
    auto pending_it = pending_tbl.find(user.value);
    check(pending_it != pending_tbl.end(), "No tienes ningún upgrade pendiente que cancelar.");

    // Devolver los NFTs
    action(
        permission_level{get_self(), "active"_n},
        "atomicassets"_n, "transfer"_n,
        std::make_tuple(get_self(), user, pending_it->asset_ids, string("Upgrade cancelado"))
    ).send();

    // Eliminar el registro
    pending_tbl.erase(pending_it);
    print(">> Upgrade cancelado. Tus NFTs han sido devueltos.\n");
}

// --- Lógica de Upgrade ---
void nightclub::process_upgrade_payment(name from, asset quantity) {
    pendingupgrs_t pending_tbl(get_self(), get_self().value);
    auto pending_it = pending_tbl.find(from.value);
    check(pending_it != pending_tbl.end(), "No tienes un upgrade pendiente de pago.");

    upgraderecs_t upgrades(get_self(), get_self().value);
    auto recipe_it = upgrades.find(pending_it->upgrade_id);
    check(recipe_it != upgrades.end(), "La receta para este upgrade ya no existe.");

    // Verificar pago
    asset expected_cost;
    if (quantity.symbol == SEXY_SYMBOL) expected_cost = recipe_it->cost_sexy;
    else if (quantity.symbol == WAXXX_SYMBOL) expected_cost = recipe_it->cost_waxxx;
    else check(false, "Token de pago para upgrade no soportado.");

    check(quantity.amount == expected_cost.amount, "La cantidad enviada no coincide con el costo del upgrade.");

    // Quemar los NFTs (el contrato es el dueño)
    for (const auto& asset_id : pending_it->asset_ids) {
        action(permission_level{get_self(), "active"_n}, "atomicassets"_n, "burnasset"_n, std::make_tuple(get_self(), asset_id)).send();
    }

    // Mintear el nuevo NFT
    auto templates = atomicassets::get_templates(NFT_COLLECTION);
    auto template_itr = templates.find(recipe_it->result_template_id);
    check(template_itr != templates.end(), "Template de resultado no encontrado.");

    action(
        permission_level{get_self(), "active"_n}, "atomicassets"_n, "mintasset"_n,
        std::make_tuple(
            get_self(), NFT_COLLECTION, template_itr->schema_name, recipe_it->result_template_id, from,
            vector<atomicassets::ATTRIBUTE_MAP>{},
            vector<atomicassets::ATTRIBUTE_MAP>{},
            vector<atomicassets::ATTRIBUTE_MAP>{}
        )
    ).send();
    
    // Registrar en historial
    upgradehist_t history(get_self(), get_self().value);
    history.emplace(get_self(), [&](auto& h) {
        h.id = history.available_primary_key();
        h.user = from;
        h.upgrade_id = pending_it->upgrade_id;
        h.new_asset_id = 0; 
        h.timestamp = current_time_point().sec_since_epoch();
    });

    // Limpiar
    pending_tbl.erase(pending_it);
    print(">> Upgrade completado! NFT minteado.\n");
}

void nightclub::on_wax_transfer(name from, name to, asset quantity, std::string memo) {
    if (to != get_self()) return;
    check(quantity.symbol == WAX_SYMBOL, "Solo se acepta WAX en este handler");

    if (memo.rfind("buy-item:", 0) == 0) {
        handle_payment(from, quantity, memo);
    }
}

void nightclub::on_token_transfer(name from, name to, asset quantity, std::string memo) {
    if (to != get_self()) return;

    if (memo.rfind("pay_upgrade", 0) == 0) {
        process_upgrade_payment(from, quantity);
        return;
    }
    
    // Lógica de compra de la tienda
    check(quantity.symbol == SEXY_SYMBOL || quantity.symbol == WAXXX_SYMBOL, "Solo se aceptan SEXY o WAXXX en este handler para compras.");
    if (memo.rfind("buy-item:", 0) == 0) {
        handle_payment(from, quantity, memo);
    }
}

// ========== IMPLEMENTACIÓN DE LÓGICA FALTANTE ==========

void nightclub::on_burn_asset(name asset_owner, uint64_t asset_id) {
    // Esta notificación se puede usar para logging futuro.
    // Por ahora, solo imprime un mensaje para confirmar que se activó.
    print("LOG BURN: Asset ", asset_id, " fue quemado por ", asset_owner, "\n");
}

void nightclub::handle_payment(name from, asset quantity, string memo) {
    // Extraer el ID del item del memo (ej: "buy-item:123")
    const string prefix = "buy-item:";
    check(memo.rfind(prefix, 0) == 0, "Memo para compra inválido. Debe ser 'buy-item:<item_id>'.");
    string id_str = memo.substr(prefix.size());
    check(!id_str.empty(), "El ID del item no puede estar vacío en el memo.");
    uint64_t item_id = std::stoull(id_str);

    // Buscar el item en la tabla de la tienda
    storeitems_t items(get_self(), get_self().value);
    auto item_it = items.find(item_id);
    check(item_it != items.end(), "El item con ID " + id_str + " no existe en la tienda.");

    // Verificar si hay stock
    check(item_it->stock > 0, "El item '" + item_it->title + "' está agotado.");

    // Verificar que la cantidad pagada es la correcta
    asset expected_price;
    if (quantity.symbol == WAX_SYMBOL) {
        expected_price = item_it->price_wax;
    } else if (quantity.symbol == SEXY_SYMBOL) {
        expected_price = item_it->price_sexy;
    } else if (quantity.symbol == WAXXX_SYMBOL) {
        expected_price = item_it->price_waxxx;
    } else {
        check(false, "Token de pago no soportado para la tienda.");
    }
    
    check(expected_price.amount > 0, "Este item no se puede comprar con este token (precio es cero).");
    check(quantity == expected_price, 
        "La cantidad pagada (" + quantity.to_string() + ") no coincide con el precio del item (" + expected_price.to_string() + ").");

    // Mintear el NFT para el comprador
    auto templates = atomicassets::get_templates(NFT_COLLECTION);
    auto template_itr = templates.find(item_it->template_id);
    check(template_itr != templates.end(), "El template ID " + to_string(item_it->template_id) + " no fue encontrado en la colección " + NFT_COLLECTION.to_string());

    action(
        permission_level{get_self(), "active"_n},
        "atomicassets"_n, "mintasset"_n,
        std::make_tuple(
            get_self(), NFT_COLLECTION, template_itr->schema_name, item_it->template_id, from,
            vector<atomicassets::ATTRIBUTE_MAP>{},
            vector<atomicassets::ATTRIBUTE_MAP>{},
            vector<atomicassets::ATTRIBUTE_MAP>{}
        )
    ).send();

    // Actualizar el stock del item
    items.modify(item_it, get_self(), [&](auto& i) {
        i.stock--;
        i.sold_count++;
    });

    print(">> Venta exitosa! Usuario ", from, " compró '", item_it->title, "'. Stock restante: ", item_it->stock, "\n");
}

// ========== NUEVAS ACCIONES PARA SISTEMA DE PACKS ==========

void nightclub::setpack(uint64_t pack_id, string name, string description, 
                         vector<pack_content> contents, uint32_t total_drops) {
    require_auth(get_self());
    check(pack_id > 0, "Pack ID debe ser positivo");
    check(!name.empty() && name.length() <= 64, "El nombre debe tener entre 1 y 64 caracteres");
    check(description.length() <= 256, "La descripción debe tener hasta 256 caracteres");
    check(total_drops > 0, "El total de drops debe ser mayor a 0");
    check(!contents.empty(), "El pack debe tener al menos un contenido posible.");

    packs_t packs(get_self(), get_self().value);
    auto it = packs.find(pack_id);
    if (it == packs.end()) {
        packs.emplace(get_self(), [&](auto& p) {
            p.pack_id = pack_id;
            p.name = name;
            p.description = description;
            p.contents = contents;
            p.total_drops = total_drops;
        });
        print("Pack '", name, "' creado con ID (template) ", pack_id, "\n");
    } else {
        packs.modify(it, get_self(), [&](auto& p) {
            p.name = name;
            p.description = description;
            p.contents = contents;
            p.total_drops = total_drops;
        });
        print("Pack ID ", pack_id, " actualizado\n");
    }
}

void nightclub::rmpack(uint64_t pack_id) {
    require_auth(get_self());
    
    packs_t packs(get_self(), get_self().value);
    auto it = packs.find(pack_id);
    check(it != packs.end(), "Pack no encontrado");
    
    packs.erase(it);
    print("Pack ID ", pack_id, " eliminado\n");
}

void nightclub::openpack(name user, uint64_t pack_asset_id) {
    require_auth(user);
    process_pack_opening(user, pack_asset_id);
}

void nightclub::process_pack_opening(name user, uint64_t pack_asset_id) {
    // Obtener template ID del asset (este es el ID del pack)
    int32_t pack_template_id = get_pack_template_id(pack_asset_id);
    
    // Buscar configuración del pack
    packs_t packs(get_self(), get_self().value);
    auto pack_it = packs.find(pack_template_id);
    check(pack_it != packs.end(), "Configuracion de pack no encontrada para template ID: " + to_string(pack_template_id));
    
    print(">> Abriendo pack '", pack_it->name, "' para el usuario ", user, "\n");
    
    // Seleccionar contenidos
    vector<int32_t> selected_templates = select_pack_contents(*pack_it);
    check(!selected_templates.empty(), "Error: no se pudo seleccionar contenido del pack.");
    
    // Quemar el pack NFT
    action(
        permission_level{get_self(), "active"_n},
        "atomicassets"_n, "burnasset"_n,
        std::make_tuple(get_self(), pack_asset_id)
    ).send();
    
    print(">> Pack NFT ", pack_asset_id, " quemado.\n");
    
    // Mintear las recompensas
    mint_pack_rewards(user, selected_templates);
    
    // Registrar en historial
    packhistory_t history(get_self(), get_self().value);
    history.emplace(get_self(), [&](auto& h) {
        h.id = history.available_primary_key();
        h.user = user;
        h.pack_id = pack_template_id;
        h.pack_asset_id = pack_asset_id;
        h.obtained_templates = selected_templates;
        h.timestamp = current_time_point().sec_since_epoch();
    });
    
    print(">> Pack abierto. Recompensas minteadas.\n");
}

vector<int32_t> nightclub::select_pack_contents(const pack_s& pack) {
    vector<int32_t> selected_templates;
    
    uint32_t total_weight = 0;
    for (const auto& content : pack.contents) {
        total_weight += content.weight;
    }
    check(total_weight > 0, "El pack no tiene contenidos con peso valido.");

    // Usar una semilla aleatoria más robusta
    uint64_t seed_value = current_time_point().sec_since_epoch() + pack.pack_id + get_self().value;
    checksum256 seed = sha256(reinterpret_cast<char*>(&seed_value), sizeof(seed_value));
    auto arr = seed.extract_as_byte_array();

    for (uint32_t drop = 0; drop < pack.total_drops; ++drop) {
        uint32_t random_num = 0;
        // Tomar diferentes bytes de la semilla para cada drop
        for (int i = 0; i < 4; i++) {
            random_num = (random_num << 8) | arr[(drop * 4 + i) % 32];
        }
        uint32_t roll = random_num % total_weight;
        
        uint32_t cumulative_weight = 0;
        for (const auto& content : pack.contents) {
            cumulative_weight += content.weight;
            if (roll < cumulative_weight) {
                uint32_t quantity = content.min_quantity;
                if (content.max_quantity > content.min_quantity) {
                    uint32_t range = content.max_quantity - content.min_quantity + 1;
                    // Usar otros bytes para la cantidad
                    uint32_t quantity_roll = (arr[(drop * 4 + 2) % 32] << 8 | arr[(drop * 4 + 3) % 32]) % range;
                    quantity = content.min_quantity + quantity_roll;
                }
                
                for (uint32_t q = 0; q < quantity; ++q) {
                    selected_templates.push_back(content.template_id);
                }
                break;
            }
        }
    }
    
    return selected_templates;
}

void nightclub::mint_pack_rewards(name to, const vector<int32_t>& templates) {
    if (templates.empty()) return;
    
    auto templates_tbl = atomicassets::get_templates(NFT_COLLECTION);
    
    for (int32_t template_id : templates) {
        auto template_it = templates_tbl.find(template_id);
        check(template_it != templates_tbl.end(), "Template ID " + to_string(template_id) + " no encontrado para mintear.");
        
        action(
            permission_level{get_self(), "active"_n},
            "atomicassets"_n, "mintasset"_n,
            std::make_tuple(
                get_self(), NFT_COLLECTION, template_it->schema_name, template_id, to,
                vector<atomicassets::ATTRIBUTE_MAP>{},
                vector<atomicassets::ATTRIBUTE_MAP>{},
                vector<atomicassets::ATTRIBUTE_MAP>{}
            )
        ).send();
        
        print(">> NFT minteado: Template ID ", template_id, " para ", to, "\n");
    }
}

int32_t nightclub::get_pack_template_id(uint64_t pack_asset_id) {
    auto assets_tbl = atomicassets::get_assets(get_self());
    auto asset_it = assets_tbl.find(pack_asset_id);
    check(asset_it != assets_tbl.end(), "Pack asset ID no encontrado en la cuenta del contrato.");
    return asset_it->template_id;
}