// Dados do sistema
let desbravadores = [];
let atividades = [];
let participacoes = [];

// Função para exibir alerta
function mostrarAlerta(mensagem, tipo = 'sucesso') {
    const alerta = document.getElementById('alertMessage');
    alerta.textContent = mensagem;
    alerta.style.display = 'block';
    
    if (tipo === 'erro') {
        alerta.style.backgroundColor = '#f8d7da';
        alerta.style.color = '#721c24';
    } else {
        alerta.style.backgroundColor = '#d4edda';
        alerta.style.color = '#155724';
    }
    
    setTimeout(() => {
        alerta.style.display = 'none';
    }, 3000);
}
// Função para remover atividade
function removerAtividade(nome) {
    const confirmacao = confirm('Tem certeza que deseja remover esta atividade?');
    if (!confirmacao) return;

    // Remover atividade
    atividades = atividades.filter(a => a.nome !== nome);

    // Remover participações relacionadas à atividade
    participacoes = participacoes.filter(p => p.atividadeNome !== nome);

    // Salvar dados atualizados no localStorage
    salvarDados();

    // Atualizar a interface
    atualizarInterfaceCompleta();

    mostrarAlerta('Atividade removida com sucesso!');
}

// Navegação entre abas
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        
        this.classList.add('active');
        document.getElementById(this.dataset.tab).classList.add('active');
        
        atualizarInterfaceCompleta();
    });
});

// Formulário de desbravadores
document.getElementById('desbravadorForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const id = document.getElementById('desbravadorId').value;
    const nome = document.getElementById('desbravadorNome').value;
    const funcao = document.getElementById('desbravadorFuncao').value;
    const unidade = document.getElementById('desbravadorUnidade').value;
    
    if (desbravadores.some(d => d.id === id)) {
        mostrarAlerta('Já existe um desbravador com este ID!', 'erro');
        return;
    }
    
    desbravadores.push({ id, nome, funcao, unidade, pontos: 0 });
    salvarDados();
    this.reset();
    atualizarTabelaDesbravadores();
    atualizarSelectDesbravadores();
    mostrarAlerta('Desbravador adicionado com sucesso!');
});

// Formulário de atividades
document.getElementById('atividadeForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const nome = document.getElementById('atividadeNome').value;
    const pontos = parseInt(document.getElementById('atividadePontos').value);
    
    if (atividades.some(a => a.nome.toLowerCase() === nome.toLowerCase())) {
        mostrarAlerta('Já existe uma atividade com este nome!', 'erro');
        return;
    }
    
    atividades.push({ nome, pontos });
    salvarDados();
    this.reset();
    atualizarTabelaAtividades();
    atualizarSelectAtividades();
    mostrarAlerta('Atividade adicionada com sucesso!');
});

// Formulário de participação
document.getElementById('participacaoForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const desbravadorId = document.getElementById('participacaoDesbravador').value;
    const atividadeNome = document.getElementById('participacaoAtividade').value;

    const desbravador = desbravadores.find(d => d.id === desbravadorId);
    const atividade = atividades.find(a => a.nome === atividadeNome);

    if (!desbravador || !atividade) {
        mostrarAlerta('Desbravador ou atividade não encontrados!', 'erro');
        return;
    }

    // Registrar participação
    const data = new Date().toLocaleDateString('pt-BR');

    participacoes.push({
        desbravadorId,
        atividadeNome,
        pontos: atividade.pontos,
        data
    });

    // Atualizar pontos do desbravador
    desbravador.pontos += atividade.pontos;

    // Salvar no localStorage
    salvarDados();

    // Limpar formulário
    this.reset();

    // Atualizar tabelas e ranking
    atualizarTabelaParticipacoes();
    atualizarTabelaDesbravadores();
    atualizarRanking();

    mostrarAlerta('Participação registrada com sucesso!');
});
// Função para remover desbravador
function removerDesbravador(id) {
    const confirmacao = confirm('Tem certeza que deseja remover este desbravador?');
    if (!confirmacao) return;

    // Remover desbravador
    desbravadores = desbravadores.filter(d => d.id !== id);

    // Remover participações relacionadas ao desbravador
    participacoes = participacoes.filter(p => p.desbravadorId !== id);

    // Salvar dados atualizados no localStorage
    salvarDados();

    // Atualizar a interface
    atualizarInterfaceCompleta();

    mostrarAlerta('Desbravador removido com sucesso!');
}
// Funções para atualizar tabelas
function atualizarTabelaDesbravadores() {
    const tbody = document.querySelector('#desbravadoresTable tbody');
    tbody.innerHTML = '';
    
    desbravadores.forEach(desbravador => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${desbravador.id}</td>
            <td>${desbravador.nome}</td>
            <td>${desbravador.funcao}</td>
            <td>${desbravador.unidade}</td>
            <td>${desbravador.pontos}</td>
            <td>
                <button class="btn-remover" data-id="${desbravador.id}">Remover</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

// Adicionar evento de clique para os botões de remoção
    document.querySelectorAll('.btn-remover').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            removerDesbravador(id);
        });
    });
}

function atualizarTabelaAtividades() {
    const tbody = document.querySelector('#atividadesTable tbody');
    tbody.innerHTML = '';

    atividades.forEach(atividade => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${atividade.nome}</td>
            <td>${atividade.pontos}</td>
            <td>
                <button class="btn-remover-atividade" data-nome="${atividade.nome}">Remover</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Adicionar evento de clique para os botões de remoção
    document.querySelectorAll('.btn-remover-atividade').forEach(btn => {
        btn.addEventListener('click', function() {
            const nome = this.getAttribute('data-nome');
            removerAtividade(nome);
        });
    });
}

function atualizarTabelaParticipacoes() {
    const tbody = document.querySelector('#participacoesTable tbody');
    tbody.innerHTML = '';
    
    participacoes.forEach(participacao => {
        const desbravador = desbravadores.find(d => d.id === participacao.desbravadorId);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${desbravador ? desbravador.nome : 'Desconhecido'}</td>
            <td>${participacao.atividadeNome}</td>
            <td>${participacao.pontos}</td>
            <td>${participacao.data}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Atualizar selects
function atualizarSelectDesbravadores() {
    const select = document.getElementById('participacaoDesbravador');
    select.innerHTML = '<option value="">Selecione um desbravador</option>';
    
    desbravadores.forEach(desbravador => {
        const option = document.createElement('option');
        option.value = desbravador.id;
        option.textContent = `${desbravador.nome} (${desbravador.id})`;
        select.appendChild(option);
    });
}

function atualizarSelectAtividades() {
    const select = document.getElementById('participacaoAtividade');
    select.innerHTML = '<option value="">Selecione uma atividade</option>';
    
    atividades.forEach(atividade => {
        const option = document.createElement('option');
        option.value = atividade.nome;
        option.textContent = `${atividade.nome} (${atividade.pontos} pontos)`;
        select.appendChild(option);
    });
}

// Atualizar ranking
function atualizarRanking() {
    const rankingDesbravadores = [...desbravadores].sort((a, b) => b.pontos - a.pontos);
    const top3Container = document.getElementById('top3Container');
    top3Container.innerHTML = '';
    
    if (rankingDesbravadores.length > 0) {
        const podioClasses = ['first', 'second', 'third'];
        const podioNumeros = ['1', '2', '3'];
        
        for (let i = 0; i < Math.min(3, rankingDesbravadores.length); i++) {
            const desbravador = rankingDesbravadores[i];
            const podio = document.createElement('div');
            podio.className = `podium ${podioClasses[i]}`;
            podio.innerHTML = `
                <div class="podium-position">${podioNumeros[i]}</div>
                <div class="podium-name">${desbravador.nome}</div>
                <div class="podium-details">${desbravador.unidade} · ${desbravador.funcao}</div>
                <div class="podium-points">${desbravador.pontos} pontos</div>
            `;
            top3Container.appendChild(podio);
        }
    }
    
    const rankingList = document.getElementById('rankingList');
    rankingList.innerHTML = '';
    
    rankingDesbravadores.forEach((desbravador, index) => {
        if (index < 3) return;
        
        const card = document.createElement('div');
        card.className = 'ranking-card';
        card.innerHTML = `
            <div class="ranking-position">${index + 1}</div>
            <div class="ranking-info">
                <div class="ranking-name">${desbravador.nome}</div>
                <div class="ranking-details">${desbravador.unidade} · ${desbravador.funcao}</div>
            </div>
            <div class="ranking-points">${desbravador.pontos} pts</div>
        `;
        rankingList.appendChild(card);
    });
}

// Salvar e carregar dados do localStorage
function salvarDados() {
    localStorage.setItem('desbravadores', JSON.stringify(desbravadores));
    localStorage.setItem('atividades', JSON.stringify(atividades));
    localStorage.setItem('participacoes', JSON.stringify(participacoes));
}

function carregarDados() {
    const desbravadoresData = localStorage.getItem('desbravadores');
    const atividadesData = localStorage.getItem('atividades');
    const participacoesData = localStorage.getItem('participacoes');
    
    if (desbravadoresData) desbravadores = JSON.parse(desbravadoresData);
    if (atividadesData) atividades = JSON.parse(atividadesData);
    if (participacoesData) participacoes = JSON.parse(participacoesData);
}

function atualizarInterfaceCompleta() {
    atualizarTabelaDesbravadores();
    atualizarTabelaAtividades();
    atualizarTabelaParticipacoes();
    atualizarSelectDesbravadores();
    atualizarSelectAtividades();
    atualizarRanking();
}

// Carregar dados e inicializar interface
window.addEventListener('DOMContentLoaded', () => {
    carregarDados();
    atualizarInterfaceCompleta();
});