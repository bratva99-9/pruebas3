import React, { useState, useEffect, useCallback } from "react";
import { UserService } from "../UserService";

const SCHEMAS = [
  { id: "girls", name: "Girls" },
  { id: "photos", name: "Photos" },
  { id: "items", name: "Items" },
  { id: "videos", name: "Videos" },
  { id: "shards", name: "Shards" },
  { id: "packs", name: "Packs" },
];

const COLLECTION = "nightclubnft";
const PAGE_SIZE = 10;

const InventoryModal = ({ onClose }) => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false); // Initially not loading
  const [selectedCategory, setSelectedCategory] = useState("girls");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showPackModal, setShowPackModal] = useState(false);
  const [selectedPack, setSelectedPack] = useState(null);

  const fetchNFTs = useCallback(
    async (category, reset = false) => {
      if (!hasMore && !reset) return;

      setLoading(true);
      const user =
        UserService.authName || (UserService.getName && UserService.getName());
      if (!user) {
        setNfts([]);
        setLoading(false);
        return;
      }

      try {
        const currentPage = reset ? 1 : page;
        const response = await fetch(
          `https://wax.api.atomicassets.io/atomicassets/v1/assets?owner=${user}&collection_name=${COLLECTION}&schema_name=${category}&page=${currentPage}&limit=${PAGE_SIZE}`,
        );
        const result = await response.json();

        if (result.success && result.data) {
          setNfts((prev) => (reset ? result.data : [...prev, ...result.data]));
          setHasMore(result.data.length === PAGE_SIZE);
          setPage(currentPage + 1);
        } else {
          setHasMore(false);
        }
      } catch (error) {
        console.error("Error fetching NFTs:", error);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [page, hasMore],
  );

  useEffect(() => {
    setNfts([]); // Clear previous NFTs
    setPage(1);
    setHasMore(true);
    fetchNFTs(selectedCategory, true); // Fetch new category, resetting previous data
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchNFTs(selectedCategory);
    }
  };

  const PackDetailModal = ({ pack, onClose }) => {
    const modalRef = React.useRef();
    const [feedback, setFeedback] = React.useState({ message: "", type: "" });
    const [opening, setOpening] = React.useState(false);

    // Cerrar modal al hacer clic fuera
    React.useEffect(() => {
      const handleClickOutside = (event) => {
        if (modalRef.current && !modalRef.current.contains(event.target)) {
          onClose();
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    const handleOpenPack = async () => {
      setOpening(true);
      setFeedback({ message: "Opening pack...", type: "info" });

      // Simular apertura de pack (aquí iría la lógica real)
      setTimeout(() => {
        setFeedback({ message: "Pack opened successfully!", type: "success" });
        setTimeout(() => {
          setFeedback({ message: "", type: "" });
          setOpening(false);
        }, 2000);
      }, 2000);
    };

    // Media del pack
    const videoHash =
      pack.data && pack.data.video && pack.data.video.length > 10
        ? pack.data.video
        : null;
    const imgHash =
      pack.data && pack.data.img && pack.data.img.length > 10
        ? pack.data.img
        : null;
    const fileUrl = videoHash
      ? videoHash.startsWith("http")
        ? videoHash
        : `https://ipfs.io/ipfs/${videoHash}`
      : imgHash
        ? imgHash.startsWith("http")
          ? imgHash
          : `https://ipfs.io/ipfs/${imgHash}`
        : "";
    const isVideo = !!videoHash;

    // Datos del pack
    const name = pack.data?.name || pack.name || "Pack NFT";
    const desc =
      pack.data?.desc ||
      pack.data?.description ||
      "Premium pack containing exclusive items";
    const templateId = pack.template_id || pack.template?.template_id;
    const assetId = pack.asset_id;

    return (
      <div className="pack-modal-fullscreen" style={{ zIndex: 10002 }}>
        <div
          className="pack-detail-modal-flex"
          ref={modalRef}
          style={{ position: "relative" }}
        >
          {feedback.message && (
            <div
              className={`pack-feedback-message ${feedback.type} pack-feedback-inside-modal-centered`}
            >
              {feedback.message}
            </div>
          )}
          <div className="pack-detail-media-col">
            {isVideo ? (
              <video
                src={fileUrl}
                autoPlay
                loop
                muted
                playsInline
                className="pack-item-media-modal"
              />
            ) : (
              <img src={fileUrl} alt={name} className="pack-item-media-modal" />
            )}
          </div>
          <div className="pack-detail-info-col">
            <h1
              className="pack-inventory-title"
              style={{ marginBottom: 10, fontSize: 28 }}
            >
              {name}
            </h1>
            <div className="pack-detail-desc" style={{ marginBottom: 18 }}>
              {desc}
            </div>
            <div className="pack-detail-table pack-detail-table-horizontal">
              <div className="pack-detail-row-2col">
                <div className="pack-detail-col-left">
                  <div>
                    <span className="pack-detail-label">Asset ID:</span>{" "}
                    <span>{assetId ?? "—"}</span>
                  </div>
                  <div>
                    <span className="pack-detail-label">Template ID:</span>{" "}
                    <span>{templateId ?? "—"}</span>
                  </div>
                  <div>
                    <span className="pack-detail-label">Type:</span>{" "}
                    <span>Pack</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="pack-detail-btn-row">
              <button
                className="pack-detail-btn pack-same-btn"
                onClick={onClose}
              >
                Close
              </button>
              <button
                className="pack-detail-btn pack-same-btn"
                onClick={handleOpenPack}
                disabled={opening || feedback.message}
              >
                {opening ? "Opening..." : "Open Pack"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="inventory-modal-fullscreen">
      <div className="inventory-modal-content">
        <h1 className="inventory-title">INVENTORY</h1>
        <div className="category-filters">
          {SCHEMAS.map((category) => (
            <button
              key={category.id}
              className={`category-btn ${selectedCategory === category.id ? "active" : ""}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
        <div className="nfts-grid">
          {nfts.length === 0 && !loading ? (
            <div
              style={{
                color: "#fff",
                gridColumn: "1/-1",
                textAlign: "center",
                fontSize: "1.2rem",
                opacity: 0.7,
              }}
            >
              No NFTs in this category.
            </div>
          ) : (
            nfts.map((nft) => {
              const videoHash =
                nft.data && nft.data.video && nft.data.video.length > 10
                  ? nft.data.video
                  : null;
              const imgHash =
                nft.data && nft.data.img && nft.data.img.length > 10
                  ? nft.data.img
                  : null;
              const fileUrl = videoHash
                ? videoHash.startsWith("http")
                  ? videoHash
                  : `https://ipfs.io/ipfs/${videoHash}`
                : imgHash
                  ? imgHash.startsWith("http")
                    ? imgHash
                    : `https://ipfs.io/ipfs/${imgHash}`
                  : "";
              return (
                <div key={nft.asset_id} className="nft-card">
                  <div className="nft-media">
                    {videoHash ? (
                      <video
                        src={fileUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          aspectRatio: "9/16",
                          borderRadius: "18px",
                          background: "#19191d",
                          display: "block",
                          maxHeight: "420px",
                          minHeight: "240px",
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : imgHash ? (
                      <img
                        src={fileUrl}
                        alt="NFT"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          aspectRatio: "9/16",
                          borderRadius: "18px",
                          background: "#19191d",
                          display: "block",
                          maxHeight: "420px",
                          minHeight: "240px",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          background: "#181828",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          aspectRatio: "9/16",
                          borderRadius: "18px",
                        }}
                      >
                        No media
                      </div>
                    )}
                  </div>
                  {selectedCategory === "packs" && (
                    <button
                      className="pack-action-btn"
                      onClick={() => {
                        setSelectedPack(nft);
                        setShowPackModal(true);
                      }}
                    >
                      Open Pack
                    </button>
                  )}
                </div>
              );
            })
          )}
          {loading && (
            <div
              style={{ color: "#fff", gridColumn: "1/-1", textAlign: "center" }}
            >
              Loading...
            </div>
          )}
        </div>
        <div
          className="modal-bottom-bar"
          style={{
            position: "fixed",
            left: "50%",
            bottom: "0",
            transform: "translateX(-50%)",
            width: "100%",
            maxWidth: "1200px",
            margin: "0",
            padding: "0",
            zIndex: 10001,
            background: "transparent",
            pointerEvents: "auto",
          }}
        >
          <button
            className="close-btn"
            onClick={onClose}
            style={{
              position: "absolute",
              left: "50%",
              bottom: "32px",
              transform: "translateX(-50%)",
            }}
          >
            Close
          </button>
          {hasMore && (
            <button
              className="load-more-btn"
              onClick={handleLoadMore}
              disabled={loading}
              style={{ position: "absolute", right: "24px", bottom: "32px" }}
            >
              {loading ? "Loading..." : "Load more"}
            </button>
          )}
        </div>
      </div>
      {showPackModal && selectedPack && (
        <PackDetailModal
          pack={selectedPack}
          onClose={() => {
            setShowPackModal(false);
            setSelectedPack(null);
          }}
        />
      )}
      <style jsx>{`
        .inventory-modal-fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 9999;
          background: hsl(245, 86.7%, 2.9%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          animation: fadeInModal 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }
        .inventory-modal-content {
          width: 100%;
          max-width: 1200px;
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px;
          overflow-y: hidden;
        }
        .inventory-title {
          text-align: center;
          font-size: 38px;
          font-weight: 700;
          color: #ff6fff;
          margin-bottom: 24px;
          text-shadow: 0 0 12px #ff00ff99;
          letter-spacing: 2px;
        }
        .category-filters {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .category-btn {
          padding: 8px 16px;
          border: 2px solid #ff00ff;
          background: rgba(255, 0, 255, 0.1);
          color: #fff;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
          font-weight: 500;
        }
        .category-btn:hover,
        .category-btn.active {
          background: linear-gradient(90deg, #ff6fd8, #f32cfc 80%);
          color: #fff;
          border-color: #ff00ff;
          box-shadow: 0 0 12px #ff00ff44;
        }
        .nfts-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 28.8px;
          width: 100%;
          padding: 0 12px 0 12px;
          margin-bottom: 0;
          scrollbar-width: thin;
          scrollbar-color: #ff00ff #181828;
          flex: 1 1 auto;
          min-height: 0;
          max-height: none;
          position: relative;
        }
        .nfts-grid::-webkit-scrollbar {
          margin-bottom: -12px;
        }
        .nfts-grid::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #ff00ff 0%, #7f36ff 100%);
          border-radius: 8px;
          border: 2px solid #ff6fff;
          min-height: 40px;
        }
        .nfts-grid::-webkit-scrollbar-track {
          background: #181828;
        }
        .nft-card {
          background: none !important;
          border-radius: 16.2px !important;
          overflow: hidden !important;
          box-shadow: none !important;
          padding: 0 !important;
          margin: 0 !important;
          display: flex !important;
          align-items: stretch !important;
          justify-content: center !important;
          min-width: 0 !important;
          height: 244.8px !important;
          aspect-ratio: 9/16 !important;
          position: relative !important;
        }
        .nft-media {
          width: 100%;
          height: 100%;
          aspect-ratio: 9/16;
          border-radius: 16.2px;
          overflow: hidden;
          background: #19191d;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modal-bottom-bar {
          width: 100%;
          max-width: 1200px;
          position: fixed;
          left: 50%;
          bottom: 32px;
          transform: translateX(-50%);
          z-index: 10001;
          padding: 0 80px 0 180px;
          pointer-events: none;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .modal-bottom-bar > * {
          pointer-events: auto;
        }
        .close-btn {
          font-size: 15px;
          font-weight: 500;
          color: #fff;
          background: rgba(0, 255, 255, 0.1);
          border: 2px solid #00ffff;
          border-radius: 14px;
          padding: 8px 32px;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-right: 80px;
          box-shadow: none;
        }
        .close-btn:hover {
          background: rgba(255, 0, 255, 0.13);
          border-color: #ff00ff;
        }
        .pack-action-btn {
          position: absolute;
          bottom: 8px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 12px;
          font-weight: 500;
          color: #fff;
          background: rgba(0, 255, 255, 0.1);
          border: 2px solid #00ffff;
          border-radius: 12px;
          padding: 6px 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: none;
          white-space: nowrap;
          z-index: 10;
        }
        .pack-action-btn:hover {
          background: rgba(255, 0, 255, 0.13);
          border-color: #ff00ff;
          transform: translateX(-50%) scale(1.05);
        }
        .load-more-btn {
          font-size: 15px;
          font-weight: 500;
          color: #fff;
          background: rgba(0, 255, 255, 0.1);
          border: 2px solid #00ffff;
          border-radius: 14px;
          padding: 8px 32px;
          white-space: nowrap;
          width: auto;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-left: auto;
          margin-right: 24px;
          box-shadow: none;
        }
        .load-more-btn:hover {
          background: rgba(255, 0, 255, 0.13);
          border-color: #ff00ff;
        }
        .load-more-btn:disabled {
          cursor: not-allowed;
        }
        @keyframes fadeInModal {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @media (max-width: 900px) and (orientation: landscape) {
          .inventory-modal-fullscreen {
            overflow: hidden !important;
          }
          .inventory-modal-content {
            height: 100% !important;
            padding: 8px 24px 0 24px !important;
            overflow: hidden !important;
          }
          .inventory-title {
            font-size: 22px !important;
            margin-top: 8px !important;
            margin-bottom: 10px !important;
            letter-spacing: 1px !important;
          }
          .category-filters {
            margin-top: 0 !important;
            margin-bottom: 10px !important;
            gap: 6px !important;
          }
          .category-btn {
            font-size: 11px !important;
            padding: 4px 10px !important;
            border-radius: 8px !important;
          }
          .nfts-grid {
            display: flex !important;
            flex-direction: row !important;
            gap: 16.2px !important;
            overflow-x: auto !important;
            overflow-y: hidden !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 10px 0 10px !important;
            margin: 0 !important;
            justify-content: flex-start !important;
            align-items: flex-start !important;
            scrollbar-color: #ff00ff #181828 !important;
            scrollbar-width: thin !important;
            flex: 1 1 auto !important;
          }
          .nfts-grid::-webkit-scrollbar {
            height: 10px;
            background: #181828;
          }
          .nfts-grid::-webkit-scrollbar-thumb {
            background: linear-gradient(90deg, #ff00ff 0%, #b266ff 100%);
            border-radius: 8px;
          }
          .nfts-grid::-webkit-scrollbar-track {
            background: #181828;
          }
          .nft-card {
            min-width: 75.6px !important;
            max-width: 75.6px !important;
            width: 75.6px !important;
            height: 134.1px !important;
            margin: 0 !important;
            padding: 0 !important;
            border-radius: 12.6px !important;
            box-shadow: none !important;
            background: none !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: flex-end !important;
            position: relative !important;
          }
          .nft-media video,
          .nft-media img,
          .nft-media div {
            border-radius: 10.8px !important;
            min-width: 100% !important;
            min-height: 100% !important;
            max-width: 100% !important;
            max-height: 100% !important;
            object-fit: cover !important;
            aspect-ratio: 9/16 !important;
          }
          .nfts-grid > div[style*="No NFTs in this category."] {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            height: 100vh !important;
            width: 100vw !important;
            font-size: 1.2rem !important;
            opacity: 0.7 !important;
            color: #fff !important;
            text-align: center !important;
          }
          .pack-action-btn {
            bottom: 4px !important;
            font-size: 8px !important;
            padding: 3px 8px !important;
            border-radius: 8px !important;
            border-width: 1px !important;
          }
        }
        @media (min-width: 901px) {
          .nfts-grid {
            gap: 28.8px;
            overflow-y: auto;
            max-height: calc(100vh - 200px);
            scrollbar-width: thin;
            scrollbar-color: #ff00ff #181828;
          }
          .nfts-grid::-webkit-scrollbar {
            width: 12px;
            background: #181828;
          }
          .nfts-grid::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #ff00ff 0%, #7f36ff 100%);
            border-radius: 8px;
            border: 2px solid #ff6fff;
          }
          .nfts-grid::-webkit-scrollbar-track {
            background: #181828;
            border-radius: 8px;
          }
          .nft-card {
            height: 220.5px;
            aspect-ratio: 9/16;
            min-width: unset !important;
            max-width: unset !important;
            width: unset !important;
            border-radius: 16.2px;
            position: relative;
          }
          .nft-media {
            border-radius: 16.2px;
          }
        }

        /* Estilos para PackDetailModal */
        .pack-modal-fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 10002;
          background: hsl(245, 86.7%, 2.9%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          animation: fadeInModal 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .pack-detail-modal-flex {
          display: flex;
          flex-direction: row;
          background: rgba(24, 24, 40, 0.98);
          border-radius: 24px;
          box-shadow: 0 0 32px 0 #000a;
          max-width: 820px;
          min-width: 320px;
          width: 90vw;
          min-height: 340px;
          max-height: 90vh;
          overflow: hidden;
          margin: auto;
        }
        .pack-detail-media-col {
          flex: 1.1;
          min-width: 210px;
          max-width: 320px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #181828;
          padding: 32px 18px 32px 32px;
        }
        .pack-item-media-modal {
          width: 100%;
          max-width: 198px;
          height: auto;
          max-height: 306px;
          aspect-ratio: 105/154;
          object-fit: contain;
          border-radius: 18px;
          box-shadow: 0 4px 32px 0 #000a;
          background: #000;
        }
        .pack-detail-info-col {
          flex: 1.5;
          min-width: 220px;
          max-width: 420px;
          padding: 38px 32px 32px 18px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: flex-start;
          color: #fff;
        }
        .pack-inventory-title {
          text-align: left;
          font-size: 28px;
          font-weight: 700;
          color: #ff6fff;
          margin-bottom: 10px;
          text-shadow: 0 0 12px #ff00ff99;
          letter-spacing: 2px;
        }
        .pack-detail-desc {
          font-size: 15px;
          color: #bfc2d1;
          margin-bottom: 0;
          margin-top: 0;
          text-align: left;
          min-height: 32px;
        }
        .pack-detail-table {
          margin: 18px 0 0 0;
          width: 100%;
          font-size: 15px;
          color: #fff;
        }
        .pack-detail-table > div {
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: center;
          margin-bottom: 6px;
        }
        .pack-detail-label {
          min-width: 90px;
          font-weight: 600;
          color: #00ffff;
          margin-right: 6px;
        }
        .pack-detail-table-horizontal {
          width: 100%;
        }
        .pack-detail-row-2col {
          display: flex;
          flex-direction: row;
          gap: 48px;
          width: 100%;
          margin-top: 10px;
          margin-bottom: 0;
          align-items: flex-start;
          justify-content: flex-start;
        }
        .pack-detail-col-left,
        .pack-detail-col-right {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .pack-detail-col-left span,
        .pack-detail-col-right span {
          font-size: 15px;
        }
        .pack-detail-btn-row {
          display: flex;
          flex-direction: row;
          gap: 18px;
          margin-top: 48px;
          width: 100%;
          justify-content: center;
          align-items: flex-end;
        }
        .pack-detail-btn.pack-same-btn {
          min-width: 200px;
          max-width: 200px;
          width: 200px;
          font-size: 16px;
          height: 48px;
          line-height: 48px;
          padding: 0;
          white-space: nowrap;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          text-align: center;
          box-sizing: border-box;
          font-weight: 700;
          border: 2px solid #00ffff;
          background: rgba(0, 255, 255, 0.1);
          color: #fff;
          transition:
            background 0.2s,
            border-color 0.2s,
            color 0.2s;
          box-shadow: none !important;
          cursor: pointer;
        }
        .pack-detail-btn.pack-same-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .pack-detail-btn.pack-same-btn:hover:not(:disabled) {
          background: rgba(255, 0, 255, 0.13);
          border-color: #ff00ff;
          color: #fff;
        }
        .pack-feedback-message.pack-feedback-inside-modal-centered {
          position: absolute;
          top: 4px;
          left: 50%;
          transform: translateX(-50%);
          max-width: 95%;
          width: auto;
          text-align: center;
          font-size: 17px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          background: none;
          border: none;
          color: #fff;
          margin: 0;
          padding: 8px 0 0 0;
          z-index: 10;
        }
        .pack-feedback-message.success {
          color: #00ff00;
        }
        .pack-feedback-message.error {
          color: #ff3366;
        }
        .pack-feedback-message.info {
          color: #00ffff;
        }
        @media (max-width: 900px) and (orientation: landscape) {
          .pack-detail-modal-flex {
            transform: scale(0.8);
            transform-origin: center center;
            margin: auto !important;
            max-width: 90vw !important;
            width: 90vw !important;
          }
          .pack-detail-btn.pack-same-btn {
            min-width: 168px !important;
            max-width: 168px !important;
            width: 168px !important;
            height: 40px !important;
            font-size: 13.65px !important;
            line-height: 40px !important;
            padding: 0 !important;
          }
          .pack-detail-btn-row {
            margin-top: 30px !important;
          }
          .pack-detail-info-col {
            padding-left: 0 !important;
            padding-right: 32px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default InventoryModal;
