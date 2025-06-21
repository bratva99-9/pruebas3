export const nightclubABI = {
    "____comment": "This ABI is manually added to prevent dynamic loading issues.",
    "version": "eosio::abi/1.1",
    "structs": [
        {
            "name": "cancelmiss",
            "base": "",
            "fields": [
                {
                    "name": "user",
                    "type": "name"
                },
                {
                    "name": "asset_id",
                    "type": "uint64"
                }
            ]
        },
        {
            "name": "claim",
            "base": "",
            "fields": [
                {
                    "name": "user",
                    "type": "name"
                },
                {
                    "name": "asset_id",
                    "type": "uint64"
                }
            ]
        },
        {
            "name": "claimall",
            "base": "",
            "fields": [
                {
                    "name": "user",
                    "type": "name"
                }
            ]
        },
        {
            "name": "cleancool",
            "base": "",
            "fields": [
                {
                    "name": "user",
                    "type": "name"
                }
            ]
        },
        {
            "name": "cooldowns",
            "base": "",
            "fields": [
                {
                    "name": "user",
                    "type": "name"
                },
                {
                    "name": "last_claim",
                    "type": "time_point_sec"
                }
            ]
        },
        {
            "name": "emergstop",
            "base": "",
            "fields": [
                {
                    "name": "stop",
                    "type": "bool"
                }
            ]
        },
        {
            "name": "forcecool",
            "base": "",
            "fields": [
                {
                    "name": "user",
                    "type": "name"
                },
                {
                    "name": "cooldown",
                    "type": "uint64"
                }
            ]
        },
        {
            "name": "getall",
            "base": "",
            "fields": [
                {
                    "name": "user",
                    "type": "name"
                }
            ]
        },
        {
            "name": "getrewards",
            "base": "",
            "fields": [
                {
                    "name": "user",
                    "type": "name"
                },
                {
                    "name": "amount",
                    "type": "asset"
                }
            ]
        },
        {
            "name": "initmissions",
            "base": "",
            "fields": []
        },
        {
            "name": "initnftrew",
            "base": "",
            "fields": []
        },
        {
            "name": "legal",
            "base": "",
            "fields": [
                {
                    "name": "legality",
                    "type": "string"
                }
            ]
        },
        {
            "name": "logall",
            "base": "",
            "fields": []
        },
        {
            "name": "logmission",
            "base": "",
            "fields": [
                {
                    "name": "user",
                    "type": "name"
                },
                {
                    "name": "asset_id",
                    "type": "uint64"
                },
                {
                    "name": "mission_id",
                    "type": "uint64"
                },
                {
                    "name": "end_time",
                    "type": "time_point_sec"
                }
            ]
        },
        {
            "name": "lognftmint",
            "base": "",
            "fields": [
                {
                    "name": "minter",
                    "type": "name"
                },
                {
                    "name": "tier",
                    "type": "uint64"
                }
            ]
        },
        {
            "name": "logreward",
            "base": "",
            "fields": [
                {
                    "name": "user",
                    "type": "name"
                },
                {
                    "name": "amount",
                    "type": "asset"
                }
            ]
        },
        {
            "name": "missions",
            "base": "",
            "fields": [
                {
                    "name": "mission_id",
                    "type": "uint64"
                },
                {
                    "name": "user",
                    "type": "name"
                },
                {
                    "name": "asset_id",
                    "type": "uint64"
                },
                {
                    "name": "end_time",
                    "type": "time_point_sec"
                },
                {
                    "name": "tier",
                    "type": "uint64"
                }
            ]
        },
        {
            "name": "nftrewards",
            "base": "",
            "fields": [
                {
                    "name": "tier",
                    "type": "uint64"
                },
                {
                    "name": "reward_per_hour",
                    "type": "asset"
                }
            ]
        },
        {
            "name": "resetmints",
            "base": "",
            "fields": []
        },
        {
            "name": "rmmission",
            "base": "",
            "fields": [
                {
                    "name": "mission_id",
                    "type": "uint64"
                }
            ]
        },
        {
            "name": "rmnftrew",
            "base": "",
            "fields": [
                {
                    "name": "tier",
                    "type": "uint64"
                }
            ]
        },
        {
            "name": "rmtempl",
            "base": "",
            "fields": [
                {
                    "name": "template_id",
                    "type": "uint64"
                }
            ]
        },
        {
            "name": "setmission",
            "base": "",
            "fields": [
                {
                    "name": "template_id",
                    "type": "uint64"
                },
                {
                    "name": "duration_hours",
                    "type": "uint64"
                }
            ]
        },
        {
            "name": "setnftrew",
            "base": "",
            "fields": [
                {
                    "name": "tier",
                    "type": "uint64"
                },
                {
                    "name": "reward_per_hour",
                    "type": "asset"
                }
            ]
        },
        {
            "name": "settempl",
            "base": "",
            "fields": [
                {
                    "name": "template_id",
                    "type": "uint64"
                }
            ]
        },
        {
            "name": "tiercooldown",
            "base": "",
            "fields": [
                {
                    "name": "tier",
                    "type": "uint64"
                },
                {
                    "name": "cooldown_hours",
                    "type": "uint64"
                }
            ]
        },
        {
            "name": "tierlimits",
            "base": "",
            "fields": [
                {
                    "name": "tier",
                    "type": "uint64"
                },
                {
                    "name": "max_mints",
                    "type": "uint64"
                }
            ]
        },
        {
            "name": "tiermints",
            "base": "",
            "fields": [
                {
                    "name": "tier",
                    "type": "uint64"
                },
                {
                    "name": "mints",
                    "type": "uint64"
                }
            ]
        },
        {
            "name": "togglmission",
            "base": "",
            "fields": [
                {
                    "name": "is_active",
                    "type": "bool"
                }
            ]
        },
        {
            "name": "togglnftrew",
            "base": "",
            "fields": [
                {
                    "name": "is_active",
                    "type": "bool"
                }
            ]
        },
        {
            "name": "transfer",
            "base": "",
            "fields": [
                {
                    "name": "from",
                    "type": "name"
                },
                {
                    "name": "to",
                    "type": "name"
                },
                {
                    "name": "asset_ids",
                    "type": "uint64[]"
                },
                {
                    "name": "memo",
                    "type": "string"
                }
            ]
        },
        {
            "name": "updatenftrew",
            "base": "",
            "fields": [
                {
                    "name": "tier",
                    "type": "uint64"
                },
                {
                    "name": "new_reward_per_hour",
                    "type": "asset"
                }
            ]
        }
    ],
    "actions": [
        {
            "name": "cancelmiss",
            "type": "cancelmiss",
            "ricardian_contract": ""
        },
        {
            "name": "claim",
            "type": "claim",
            "ricardian_contract": ""
        },
        {
            "name": "claimall",
            "type": "claimall",
            "ricardian_contract": ""
        },
        {
            "name": "cleancool",
            "type": "cleancool",
            "ricardian_contract": ""
        },
        {
            "name": "emergstop",
            "type": "emergstop",
            "ricardian_contract": ""
        },
        {
            "name": "forcecool",
            "type": "forcecool",
            "ricardian_contract": ""
        },
        {
            "name": "getall",
            "type": "getall",
            "ricardian_contract": ""
        },
        {
            "name": "getrewards",
            "type": "getrewards",
            "ricardian_contract": ""
        },
        {
            "name": "initmissions",
            "type": "initmissions",
            "ricardian_contract": ""
        },
        {
            "name": "initnftrew",
            "type": "initnftrew",
            "ricardian_contract": ""
        },
        {
            "name": "legal",
            "type": "legal",
            "ricardian_contract": ""
        },
        {
            "name": "logall",
            "type": "logall",
            "ricardian_contract": ""
        },
        {
            "name": "logmission",
            "type": "logmission",
            "ricardian_contract": ""
        },
        {
            "name": "lognftmint",
            "type": "lognftmint",
            "ricardian_contract": ""
        },
        {
            "name": "logreward",
            "type": "logreward",
            "ricardian_contract": ""
        },
        {
            "name": "resetmints",
            "type": "resetmints",
            "ricardian_contract": ""
        },
        {
            "name": "rmmission",
            "type": "rmmission",
            "ricardian_contract": ""
        },
        {
            "name": "rmnftrew",
            "type": "rmnftrew",
            "ricardian_contract": ""
        },
        {
            "name": "rmtempl",
            "type": "rmtempl",
            "ricardian_contract": ""
        },
        {
            "name": "setmission",
            "type": "setmission",
            "ricardian_contract": ""
        },
        {
            "name": "setnftrew",
            "type": "setnftrew",
            "ricardian_contract": ""
        },
        {
            "name": "settempl",
            "type": "settempl",
            "ricardian_contract": ""
        },
        {
            "name": "togglmission",
            "type": "togglmission",
            "ricardian_contract": ""
        },
        {
            "name": "togglnftrew",
            "type": "togglnftrew",
            "ricardian_contract": ""
        },
        {
            "name": "transfer",
            "type": "transfer",
            "ricardian_contract": ""
        },
        {
            "name": "updatenftrew",
            "type": "updatenftrew",
            "ricardian_contract": ""
        }
    ],
    "tables": [
        {
            "name": "cooldowns",
            "type": "cooldowns",
            "index_type": "i64",
            "key_names": [],
            "key_types": []
        },
        {
            "name": "missions",
            "type": "missions",
            "index_type": "i64",
            "key_names": [],
            "key_types": []
        },
        {
            "name": "missiontempl",
            "type": "setmission",
            "index_type": "i64",
            "key_names": [],
            "key_types": []
        },
        {
            "name": "nftrewards",
            "type": "nftrewards",
            "index_type": "i64",
            "key_names": [],
            "key_types": []
        },
        {
            "name": "tiercooldown",
            "type": "tiercooldown",
            "index_type": "i64",
            "key_names": [],
            "key_types": []
        },
        {
            "name": "tierlimits",
            "type": "tierlimits",
            "index_type": "i64",
            "key_names": [],
            "key_types": []
        },
        {
            "name": "tiermints",
            "type": "tiermints",
            "index_type": "i64",
            "key_names": [],
            "key_types": []
        }
    ],
    "ricardian_clauses": [],
    "error_messages": [],
    "abi_extensions": [],
    "variants": []
}; 