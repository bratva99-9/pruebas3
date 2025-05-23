import React from "react";
import StakingModal from "../components/StakingModal";
import UnstakeModal from "../components/UnstakeModal";
import ClaimRewardsCard from "../components/ClaimRewardsCard";
import ClaimRewardsCard from "../components/ClaimActionButton";
import ClaimActionButton from "../components/ClaimActionButton";

export default function Home() {
  return (
    <div className="gigaland-home-container flex flex-col items-center min-h-screen">
      <h1 className="gigaland-title text-center mb-8 mt-12 text-3xl font-bold text-white">
        Night Club Game
      </h1>
      <StakingModal />
      <ClaimActionButton/>
      <UnstakeModal />
      <div className="mt-12">
        <ClaimRewardsCard />
      </div>
    </div>
  );
}