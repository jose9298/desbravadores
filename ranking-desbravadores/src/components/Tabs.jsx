const Tabs = ({ setTab }) => {
    return (
      <div className="flex justify-center gap-4 mb-4">
        <button onClick={() => setTab("ranking")} className="btn">Ranking</button>
        <button onClick={() => setTab("desbravadores")} className="btn">Desbravadores</button>
        <button onClick={() => setTab("atividades")} className="btn">Atividades</button>
        <button onClick={() => setTab("participacao")} className="btn">Participação</button>
      </div>
    );
  };
  
  export default Tabs;
  