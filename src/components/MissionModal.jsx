import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { UserService } from "../UserService";

const CONTRACT_ACCOUNT = "nightclubapp";
const TABLE_NAME = "missiontypes";

const imageMap = {
  nightclub: "/missions/nightclub.png",
  citystroll: "/missions/city.png",
  luxuryhotel: "/missions/hotel.png",
  beachparty: "/missions/beach.png",
};

export default function MissionModal({ onClose }) {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchMissions = async () => {
      if (!UserService.session) return;
      const result = await UserService.session.rpc.get_table_rows({
        code: CONTRACT_ACCOUNT,
        scope: CONTRACT_ACCOUNT,
        table: TABLE_NAME,
        limit: 1000,
        json: true,
      });
      setMissions(result.rows || []);
      setLoading(false);
    };
    fetchMissions();
  }, []);

  return (
    <Overlay>
      <Modal>
        <CloseBtn onClick={onClose}>×</CloseBtn>
        <Title>MISSION SELECTION</Title>
        {loading ? (
          <Loading>Cargando misiones...</Loading>
        ) : (
          <Grid>
            {missions.map((m) => {
              const bg = imageMap[m.type] || "/missions/default.png";
              const isSel = selected === m.id;
              return (
                <Card
                  key={m.id}
                  bgImage={bg}
                  selected={isSel}
                  onClick={() => setSelected(m.id)}
                >
                  <Info>
                    <MissionName>{m.name}</MissionName>
                    <MissionDesc>{m.description}</MissionDesc>
                  </Info>
                  <Data>
                    <DataRow>⏱ {m.duration}</DataRow>
                    <DataRow>💰 {m.reward}</DataRow>
                    <DataRow>🎁 {m.probability}</DataRow>
                  </Data>
                </Card>
              );
            })}
          </Grid>
        )}
        <Footer>
          <SelectBtn>Seleccionar misión</SelectBtn>
        </Footer>
      </Modal>
    </Overlay>
  );
}

// Styles
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: ${fadeIn} 0.3s ease;
`;

const Modal = styled.div`
  background: #201b2c;
  border-radius: 20px;
  padding: 32px;
  width: 95%;
  max-width: 1100px;
  max-height: 85vh;
  overflow-y: auto;
  position: relative;
  box-sizing: border-box;
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 28px;
  background: none;
  color: #fff;
  border: none;
  cursor: pointer;
`;

const Title = styled.h2`
  color: #fff;
  font-size: 32px;
  text-align: center;
  margin-bottom: 32px;
`;

const Loading = styled.div`
  color: #fff;
  text-align: center;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 28px;
`;

const Card = styled.div`
  position: relative;
  background: url(${(p) => p.bgImage}) no-repeat center/cover;
  border: ${(p) => (p.selected ? "3px solid #ff36ba" : "2px solid #322545")};
  box-shadow: ${(p) =>
    p.selected ? "0 0 18px #ff36ba" : "0 2px 12px rgba(0,0,0,0.7)"};
  border-radius: 18px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 360px;
  transition: all 0.2s ease;
  &:hover {
    transform: translateY(-4px);
  }
`;

const Info = styled.div`
  background: rgba(0, 0, 0, 0.6);
  padding: 12px 8px;
  border-radius: 12px;
  text-align: center;
  margin: 16px;
`;

const MissionName = styled.h3`
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  margin: 0;
`;

const MissionDesc = styled.p`
  color: #ddd;
  font-size: 14px;
  margin: 4px 0 0;
`;

const Data = styled.div`
  background: rgba(0, 0, 0, 0.5);
  margin: 12px 16px 16px;
  padding: 10px 8px;
  border-radius: 12px;
  font-size: 14px;
  display: grid;
  gap: 4px;
`;

const DataRow = styled.div`
  color: #fff;
`;

const Footer = styled.div`
  text-align: center;
  margin-top: 28px;
`;

const SelectBtn = styled.button`
  background: linear-gradient(90deg, #36f 0%, #f3c 100%);
  padding: 12px 32px;
  color: #fff;
  border-radius: 16px;
  font-weight: bold;
  font-size: 18px;
  border: none;
  cursor: pointer;
  box-shadow: 0 0 16px rgba(255, 54, 186, 0.53);
  transition: transform 0.2s ease;
  &:hover {
    transform: translateY(-2px);
  }
`;
