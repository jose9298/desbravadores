import React, { useState } from "react";
import Tabs from "./components/Tabs";
import Ranking from "./components/Ranking";
import Desbravadores from "./components/Desbravadores";
import Atividades from "./components/Atividades";
import Participacao from "./components/Participacao";

const App = () => {
  const [tab, setTab] = useState("ranking");

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-4">Ranking Desbravadores</h1>
      <Tabs setTab={setTab} />
      {tab === "ranking" && <Ranking />}
      {tab === "desbravadores" && <Desbravadores />}
      {tab === "atividades" && <Atividades />}
      {tab === "participacao" && <Participacao />}
    </div>
  );
};

export default App;