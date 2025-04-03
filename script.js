// Dados do sistema
let desbravadores = [];
let atividades = [];
let participacoes = [];

// Sistema de autenticação
let usuarios = [
    { username: 'admin', password: 'admin123', isAdmin: true },
    { username: 'conselheiro', password: 'clube123', isAdmin: true },
    { username: 'visitante', password: 'visitante123', isAdmin: false }
];

let usuarioLogado = null;
// Inicializar o próximoId
let proximoId = 1;

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

// Funções de autenticação
function fazerLogin(username, password) {
    const usuario = usuarios.find(u => u.username === username && u.password === password);
    if (usuario) {
        usuarioLogado = usuario;
        localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
        mostrarAlerta('Login realizado com sucesso!');
        atualizarInterfaceAutenticada();
        return true;
    }
    mostrarAlerta('Usuário ou senha incorretos!', 'erro');
    return false;
}

function fazerLogout() {
    usuarioLogado = null;
    localStorage.removeItem('usuarioLogado');
    mostrarAlerta('Logout realizado com sucesso!');
    atualizarInterfaceAutenticada();
}

function verificarAutenticacao() {
    const usuarioData = localStorage.getItem('usuarioLogado');
    if (usuarioData) {
        usuarioLogado = JSON.parse(usuarioData);
        atualizarInterfaceAutenticada();
    }
}

function atualizarInterfaceAutenticada() {
    const userInfo = document.getElementById('userInfo');
    const usernameDisplay = document.getElementById('usernameDisplay');
    const loginTab = document.getElementById('loginTab');
    const adminTabs = document.querySelectorAll('.hidden-tab');
    
    if (usuarioLogado) {
        userInfo.style.display = 'flex';
        usernameDisplay.textContent = usuarioLogado.username;
        loginTab.style.display = 'none';
        
        if (usuarioLogado.isAdmin) {
            adminTabs.forEach(tab => tab.classList.add('show-tab'));
        }
        
        if (document.querySelector('.tab[data-tab="login"]').classList.contains('active')) {
            document.querySelector('.tab[data-tab="ranking"]').click();
        }
    } else {
        userInfo.style.display = 'none';
        loginTab.style.display = 'block';
        adminTabs.forEach(tab => tab.classList.remove('show-tab'));
    }
}

// Gerador de ID automático
function gerarNovoId() {
    // Verificar se há um valor salvo no localStorage
    const ultimoIdSalvo = localStorage.getItem('ultimoIdDesbravador');
    if (ultimoIdSalvo) {
        proximoId = parseInt(ultimoIdSalvo) + 1;
    } else {
        // Se não houver valor salvo e existirem desbravadores, encontre o maior ID
        if (desbravadores.length > 0) {
            const idsNumericos = desbravadores
                .map(d => parseInt(d.id.replace('DB', '')))
                .filter(id => !isNaN(id));
            
            if (idsNumericos.length > 0) {
                proximoId = Math.max(...idsNumericos) + 1;
            }
        }
    }
    
    const idFormatado = `DB${proximoId.toString().padStart(3, '0')}`;
    // Salvar no localStorage para manter o controle
    localStorage.setItem('ultimoIdDesbravador', proximoId.toString());
    proximoId++;
    return idFormatado;
}

// Função para remover atividade
function removerAtividade(nome) {
    if (!usuarioLogado || !usuarioLogado.isAdmin) {
        mostrarAlerta('Apenas administradores podem remover atividades!', 'erro');
        return;
    }

    const confirmacao = confirm('Tem certeza que deseja remover esta atividade?');
    if (!confirmacao) return;

    atividades = atividades.filter(a => a.nome !== nome);
    participacoes = participacoes.filter(p => p.atividadeNome !== nome);
    salvarDados();
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

// Formulário de desbravadores - Modificado para usar ID automático
document.getElementById('desbravadorForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!usuarioLogado || !usuarioLogado.isAdmin) {
        mostrarAlerta('Apenas administradores podem adicionar desbravadores!', 'erro');
        return;
    }
    
    const nome = document.getElementById('desbravadorNome').value;
    const funcao = document.getElementById('desbravadorFuncao').value;
    const unidade = document.getElementById('desbravadorUnidade').value;
    
    // Gerar ID automaticamente
    const id = gerarNovoId();
    
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
    
    if (!usuarioLogado || !usuarioLogado.isAdmin) {
        mostrarAlerta('Apenas administradores podem adicionar atividades!', 'erro');
        return;
    }
    
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

    if (!usuarioLogado || !usuarioLogado.isAdmin) {
        mostrarAlerta('Apenas administradores podem registrar participações!', 'erro');
        return;
    }

    const desbravadorId = document.getElementById('participacaoDesbravador').value;
    const atividadeNome = document.getElementById('participacaoAtividade').value;

    const desbravador = desbravadores.find(d => d.id === desbravadorId);
    const atividade = atividades.find(a => a.nome === atividadeNome);

    if (!desbravador || !atividade) {
        mostrarAlerta('Desbravador ou atividade não encontrados!', 'erro');
        return;
    }

    const data = new Date().toLocaleDateString('pt-BR');

    participacoes.push({
        desbravadorId,
        atividadeNome,
        pontos: atividade.pontos,
        data
    });

    desbravador.pontos += atividade.pontos;

    salvarDados();
    this.reset();
    atualizarTabelaParticipacoes();
    atualizarTabelaDesbravadores();
    atualizarRanking();
    atualizarRankingUnidades(); // Atualizar o ranking por unidade

    mostrarAlerta('Participação registrada com sucesso!');
});

// Função para remover desbravador
function removerDesbravador(id) {
    if (!usuarioLogado || !usuarioLogado.isAdmin) {
        mostrarAlerta('Apenas administradores podem remover desbravadores!', 'erro');
        return;
    }

    const confirmacao = confirm('Tem certeza que deseja remover este desbravador?');
    if (!confirmacao) return;

    desbravadores = desbravadores.filter(d => d.id !== id);
    participacoes = participacoes.filter(p => p.desbravadorId !== id);
    salvarDados();
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

// Atualizar ranking por desbravador
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

// Nova função para ranking por unidade
function atualizarRankingUnidades() {
    // Agrupar desbravadores por unidade e somar pontos
    const unidades = {};
    desbravadores.forEach(desbravador => {
        if (!unidades[desbravador.unidade]) {
            unidades[desbravador.unidade] = {
                nome: desbravador.unidade,
                pontos: 0,
                membros: 0
            };
        }
        unidades[desbravador.unidade].pontos += desbravador.pontos;
        unidades[desbravador.unidade].membros += 1;
    });
    
    // Converter para array e ordenar por pontos
    const rankingUnidades = Object.values(unidades).sort((a, b) => b.pontos - a.pontos);
    
    const rankingUnidadesContainer = document.getElementById('rankingUnidadesContainer');
    rankingUnidadesContainer.innerHTML = '';
    
    // Exibir unidades no pódio
    if (rankingUnidades.length > 0) {
        const podioClasses = ['first', 'second', 'third'];
        const podioNumeros = ['1', '2', '3'];
        
        for (let i = 0; i < Math.min(3, rankingUnidades.length); i++) {
            const unidade = rankingUnidades[i];
            const podio = document.createElement('div');
            podio.className = `podium ${podioClasses[i]}`;
            podio.innerHTML = `
                <div class="podium-position">${podioNumeros[i]}</div>
                <div class="podium-name">${unidade.nome}</div>
                <div class="podium-details">${unidade.membros} membros</div>
                <div class="podium-points">${unidade.pontos} pontos</div>
            `;
            rankingUnidadesContainer.appendChild(podio);
        }
    }
    
    // Listar demais unidades
    const listaUnidades = document.getElementById('rankingUnidadesList');
    listaUnidades.innerHTML = '';
    
    rankingUnidades.forEach((unidade, index) => {
        if (index < 3) return;
        
        const card = document.createElement('div');
        card.className = 'ranking-card';
        card.innerHTML = `
            <div class="ranking-position">${index + 1}</div>
            <div class="ranking-info">
                <div class="ranking-name">${unidade.nome}</div>
                <div class="ranking-details">${unidade.membros} membros</div>
            </div>
            <div class="ranking-points">${unidade.pontos} pts</div>
        `;
        listaUnidades.appendChild(card);
    });
}

// Alternar entre ranking de desbravadores e unidades
document.addEventListener('DOMContentLoaded', function() {
    const tipoRankingSelect = document.getElementById('tipoRanking');
    const rankingDesbravadoresSection = document.getElementById('rankingDesbravadoresSection');
    const rankingUnidadesSection = document.getElementById('rankingUnidadesSection');
    
    tipoRankingSelect.addEventListener('change', function() {
        if (this.value === 'desbravadores') {
            rankingDesbravadoresSection.style.display = 'block';
            rankingUnidadesSection.style.display = 'none';
        } else {
            rankingDesbravadoresSection.style.display = 'none';
            rankingUnidadesSection.style.display = 'block';
        }
    });
});

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
    
    verificarAutenticacao();
}

function atualizarInterfaceCompleta() {
    atualizarTabelaDesbravadores();
    atualizarTabelaAtividades();
    atualizarTabelaParticipacoes();
    atualizarSelectDesbravadores();
    atualizarSelectAtividades();
    atualizarRanking();
    atualizarRankingUnidades(); // Atualizar também o ranking por unidade
}

// Event listeners para autenticação
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    fazerLogin(username, password);
    this.reset();
});

document.getElementById('logoutBtn').addEventListener('click', fazerLogout);

// Carregar dados e inicializar interface
window.addEventListener('DOMContentLoaded', () => {
    carregarDados();
    atualizarInterfaceCompleta();
    
    // Verificar se está em dispositivo móvel para ajuste da interface
    if (window.innerWidth <= 768) {
        document.querySelector('.container').classList.add('mobile-view');
    }
    
    // Tornar o menu hamburguer funcional em telas pequenas
    document.getElementById('mobileMenuToggle').addEventListener('click', function() {
        document.querySelector('.tabs').classList.toggle('show-mobile-menu');
    });
});
