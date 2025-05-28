import React, { useState, useEffect } from 'react';

const MissionModal = ({ isOpen, onClose }) => {
  const [missions, setMissions] = useState([]);
  const [selectedMission, setSelectedMission] = useState(null);
  const [userNFTs, setUserNFTs] = useState([]);
  const [selectedNFTs, setSelectedNFTs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNFTSelection, setShowNFTSelection] = useState(false);

  // Cargar misiones del contrato
  useEffect(() => {
    if (isOpen) {
      loadMissions();
    }
  }, [isOpen]);

  const loadMissions = async () => {
    try {
      setLoading(true);
      // const missionTypes = await UserService.getMissionTypes();
      // Mapear datos de ejemplo basados en las imágenes
      const formattedMissions = [
        {
          id: 1,
          name: "Night Club",
          description: "Complete a mission in the night club",
          duration: 30,
          reward: "10 SEXXY",
          probability: 2,
          image: "🍸"
        },
        {
          id: 2,
          name: "City Stroll", 
          description: "Go for a stroll in the city",
          duration: 60,
          reward: "15 SEXXY",
          probability: 5,
          image: "🌃"
        },
        {
          id: 3,
          name: "Luxury Hotel",
          description: "Complete a mission at the hotel", 
          duration: 120,
          reward: "25 SEXXY",
          probability: 10,
          image: "🏨"
        },
        {
          id: 4,
          name: "Beach Party",
          description: "Join a party at the beach",
          duration: 45,
          reward: "12 SEXXY", 
          probability: 3,
          image: "🏖️"
        }
      ];
      setMissions(formattedMissions);
    } catch (error) {
      console.error("Error loading missions:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserNFTs = async () => {
    try {
      setLoading(true);
      // Aquí necesitarías la API de AtomicAssets
      // const response = await fetch(`https://wax.api.atomicassets.io/atomicassets/v1/assets?owner=${userName}&collection_name=nightclubnft&schema_name=girls&limit=50`);
      
      // Datos de ejemplo basados en la imagen
      const mockNFTs = [
        { asset_id: "1", name: "Girl #1", image: "👦", rarity: "common", boost_time: -15, boost_reward: -15 },
        { asset_id: "2", name: "Girl #2", image: "🐊", rarity: "rare", boost_time: 20, boost_gems: 1 },
        { asset_id: "3", name: "Girl #3", image: "👩", rarity: "rare", boost_time: 20, boost_cooldown: 15 },
        { asset_id: "4", name: "Girl #4", image: "👤", rarity: "epic", boost_reward: 1 },
        { asset_id: "5", name: "Girl #5", image: "👮", rarity: "common" },
        { asset_id: "6", name: "Girl #6", image: "🦊", rarity: "common" },
        { asset_id: "7", name: "Girl #7", image: "👤", rarity: "common" },
        { asset_id: "8", name: "Girl #8", image: "👩", rarity: "common" },
        { asset_id: "9", name: "Girl #9", image: "💀", rarity: "rare" },
        { asset_id: "10", name: "Girl #10", image: "👤", rarity: "common" },
        { asset_id: "11", name: "Girl #11", image: "👤", rarity: "common" },
        { asset_id: "12", name: "Girl #12", image: "👦", rarity: "common" },
      ];
      
      setUserNFTs(mockNFTs);
    } catch (error) {
      console.error("Error loading NFTs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMissionSelect = (mission) => {
    setSelectedMission(mission);
    setShowNFTSelection(true);
    loadUserNFTs();
  };

  const handleNFTSelect = (nft) => {
    if (selectedNFTs.find(n => n.asset_id === nft.asset_id)) {
      setSelectedNFTs(selectedNFTs.filter(n => n.asset_id !== nft.asset_id));
    } else if (selectedNFTs.length < 10) {
      setSelectedNFTs([...selectedNFTs, nft]);
    }
  };

  const handleSendNFTs = async () => {
    if (!selectedMission || selectedNFTs.length === 0) return;
    
    try {
      setLoading(true);
      const assetIds = selectedNFTs.map(nft => nft.asset_id);
      const memo = `mission:${selectedMission.id}`;
      
      // await UserService.stakeNFTs(assetIds, memo);
      console.log('Sending NFTs:', assetIds, 'with memo:', memo);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Reset state
      setSelectedMission(null);
      setSelectedNFTs([]);
      setShowNFTSelection(false);
      onClose();
      
      alert("¡NFTs enviados a la misión exitosamente!");
    } catch (error) {
      console.error("Error sending NFTs:", error);
      alert("Error al enviar NFTs: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes} minutos`;
    return `${Math.floor(minutes / 60)} hora${minutes >= 120 ? 's' : ''}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gradient-to-b from-purple-900 to-blue-900 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        
        {!showNFTSelection ? (
          // Mission Selection Screen
          <div className="text-center">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300"
            >
              ×
            </button>
            
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-8">
              MISSION SELECTION
            </h1>
            
            <div className="bg-blue-900 bg-opacity-50 rounded-lg p-4 mb-8">
              <p className="text-cyan-400 text-lg">Success! Mission completed.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {missions.map((mission) => (
                <div 
                  key={mission.id}
                  onClick={() => handleMissionSelect(mission)}
                  className="bg-gray-900 bg-opacity-50 border border-purple-500 rounded-lg p-6 cursor-pointer hover:border-pink-500 transition-all transform hover:scale-105"
                >
                  <h3 className="text-xl font-bold text-pink-400 mb-2">{mission.name}</h3>
                  <p className="text-gray-300 text-sm mb-4">{mission.description}</p>
                  
                  <div className="text-4xl mb-4">{mission.image}</div>
                  
                  <div className="space-y-2 text-left">
                    <div className="flex items-center text-white">
                      <span className="mr-2">⏱️</span>
                      <span>{formatDuration(mission.duration)}</span>
                    </div>
                    <div className="flex items-center text-yellow-400">
                      <span className="mr-2">💰</span>
                      <span>{mission.reward}</span>
                    </div>
                    <div className="flex items-center text-pink-400">
                      <span className="mr-2">🎁</span>
                      <span>{mission.probability}% probabilidad</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button 
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all"
              onClick={() => setShowNFTSelection(true)}
              disabled={!selectedMission}
            >
              Seleccionar misión
            </button>
          </div>
        ) : (
          // NFT Selection Screen
          <div>
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300"
            >
              ×
            </button>

            <h1 className="text-2xl font-bold text-white mb-2">Enviar NFTs a la misión</h1>
            <p className="text-cyan-400 mb-6">
              {selectedMission.name} - {selectedMission.description}
            </p>

            <div className="grid grid-cols-3 gap-4 mb-6 text-white">
              <div>
                <p className="text-gray-400">Duración Base</p>
                <p className="text-xl">{formatDuration(selectedMission.duration)}</p>
              </div>
              <div>
                <p className="text-gray-400">Recompensa Base</p>
                <p className="text-xl">{selectedMission.reward}</p>
              </div>
              <div>
                <p className="text-gray-400">Cooldown</p>
                <p className="text-xl">{formatDuration(selectedMission.duration)}</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-white text-lg mb-4">
                Selecciona hasta 10 NFTs <span className="text-gray-400">({selectedNFTs.length}/10 seleccionados)</span>
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {userNFTs.map((nft) => {
                  const isSelected = selectedNFTs.find(n => n.asset_id === nft.asset_id);
                  return (
                    <div 
                      key={nft.asset_id}
                      onClick={() => handleNFTSelect(nft)}
                      className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-cyan-400 bg-cyan-900 bg-opacity-30' 
                          : 'border-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-4xl text-center mb-2">{nft.image}</div>
                      
                      {/* Boost indicators */}
                      <div className="space-y-1 text-xs">
                        {nft.boost_time && (
                          <div className={`flex items-center ${nft.boost_time > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            <span className="mr-1">⏱️</span>
                            <span>{nft.boost_time > 0 ? '+' : ''}{nft.boost_time}%</span>
                          </div>
                        )}
                        {nft.boost_reward && (
                          <div className={`flex items-center ${nft.boost_reward > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            <span className="mr-1">💰</span>
                            <span>{nft.boost_reward > 0 ? '+' : ''}{nft.boost_reward}%</span>
                          </div>
                        )}
                        {nft.boost_gems && (
                          <div className="flex items-center text-blue-400">
                            <span className="mr-1">💎</span>
                            <span>{nft.boost_gems}%</span>
                          </div>
                        )}
                        {nft.boost_cooldown && (
                          <div className="flex items-center text-cyan-400">
                            <span className="mr-1">❄️</span>
                            <span>{nft.boost_cooldown}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between">
              <button 
                onClick={() => setShowNFTSelection(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              
              <button 
                onClick={handleSendNFTs}
                disabled={selectedNFTs.length === 0 || loading}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <span className="mr-2">🚀</span>
                {loading ? 'Enviando...' : 'Enviar a misión'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MissionModal;