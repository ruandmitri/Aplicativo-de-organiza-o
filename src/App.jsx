import React, { useState, useEffect } from 'react';

export default function App() {
  // --- ESTADOS NATIVOS DA APLICAÇÃO ---
  const [tab, setTab] = useState('dashboard');
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('userEmail') || '');
  const [emailInput, setEmailInput] = useState('');
  
  // Saldo do Restaurante Universitário
  const [saldoRU, setSaldoRU] = useState(() => {
    const saved = localStorage.getItem('saldoRU');
    return saved !== null ? Number(saved) : 15;
  });
  const [historicoRU, setHistoricoRU] = useState(() => {
    const saved = localStorage.getItem('historicoRU');
    return saved ? JSON.parse(saved) : [];
  });

  // Compromissos (Provas, Trabalhos, Aulas)
  const [compromissos, setCompromissos] = useState(() => {
    const saved = localStorage.getItem('compromissos');
    return saved ? JSON.parse(saved) : [];
  });
  const [novoCompromisso, setNovoCompromisso] = useState({
    titulo: '',
    materia: '',
    tipo: 'PROVA',
    dataRaw: '', // Formato DDMMAA
    obs: ''
  });

  // Anotações
  const [notas, setNotas] = useState(() => {
    const saved = localStorage.getItem('notas');
    return saved ? JSON.parse(saved) : [];
  });
  const [novaNota, setNovaNota] = useState({ titulo: '', materia: '', conteudo: '' });

  // Hobbies e Hábitos
  const [livros, setLivros] = useState(() => {
    const saved = localStorage.getItem('livros');
    return saved ? JSON.parse(saved) : [
      { id: '1', titulo: 'Dom Casmurro', paginaAtual: 45, totalPaginas: 208 }
    ];
  });
  const [novoLivro, setNovoLivro] = useState({ titulo: '', paginaAtual: '', totalPaginas: '' });

  const [habitos, setHabitos] = useState(() => {
    const saved = localStorage.getItem('habitos');
    return saved ? JSON.parse(saved) : [
      { id: '1', nome: 'Estudar Gramática de Inglês', sequencia: 3, ultimaData: '' }
    ];
  });
  const [novoHabito, setNovoHabito] = useState('');

  // --- PERSISTÊNCIA EM LOCALSTORAGE ---
  useEffect(() => { localStorage.setItem('saldoRU', saldoRU.toString()); }, [saldoRU]);
  useEffect(() => { localStorage.setItem('historicoRU', JSON.stringify(historicoRU)); }, [historicoRU]);
  useEffect(() => { localStorage.setItem('compromissos', JSON.stringify(compromissos)); }, [compromissos]);
  useEffect(() => { localStorage.setItem('notas', JSON.stringify(notas)); }, [notas]);
  useEffect(() => { localStorage.setItem('livros', JSON.stringify(livros)); }, [livros]);
  useEffect(() => { localStorage.setItem('habitos', JSON.stringify(habitos)); }, [habitos]);

  // --- FUNÇÃO PARA CONVERTER DATA DDMMAA ---
  const formatarDataDDMMAA = (input) => {
    const limpo = input.replace(/\D/g, '');
    if (limpo.length === 6) {
      const dia = limpo.substring(0, 2);
      const mes = limpo.substring(2, 4);
      const ano = '20' + limpo.substring(4, 6);
      return `${dia}/${mes}/${ano}`;
    }
    return input;
  };

  // --- AÇÕES DO RU ---
  const debitarRU = (tipo) => {
    if (saldoRU <= 0) return alert('Saldo insuficiente de tickets!');
    const novoSaldo = saldoRU - 1;
    setSaldoRU(novoSaldo);
    const reg = {
      id: Date.now().toString(),
      tipo,
      dataHora: new Date().toLocaleString('pt-BR')
    };
    setHistoricoRU([reg, ...historicoRU]);
  };

  const recarregarRU = (qtd) => {
    const valor = Number(qtd);
    if (isNaN(valor) || valor <= 0) return;
    setSaldoRU(saldoRU + valor);
    const reg = {
      id: Date.now().toString(),
      tipo: 'RECARGA',
      quantidade: valor,
      dataHora: new Date().toLocaleString('pt-BR')
    };
    setHistoricoRU([reg, ...historicoRU]);
  };

  // --- AÇÕES DE COMPROMISSOS ---
  const adicionarCompromisso = (e) => {
    e.preventDefault();
    if (!novoCompromisso.titulo || !novoCompromisso.dataRaw) return;

    const dataFormatada = formatarDataDDMMAA(novoCompromisso.dataRaw);
    const item = {
      id: Date.now().toString(),
      ...novoCompromisso,
      dataFormatada
    };
    setCompromissos([...compromissos, item]);
    setNovoCompromisso({ titulo: '', materia: '', tipo: 'PROVA', dataRaw: '', obs: '' });
  };

  const removerCompromisso = (id) => {
    setCompromissos(compromissos.filter(c => c.id !== id));
  };

  // --- AÇÕES DE HOBBIES ---
  const adicionarLivro = (e) => {
    e.preventDefault();
    if (!novoLivro.titulo || !novoLivro.totalPaginas) return;
    const item = {
      id: Date.now().toString(),
      titulo: novoLivro.titulo,
      paginaAtual: Number(novoLivro.paginaAtual) || 0,
      totalPaginas: Number(novoLivro.totalPaginas)
    };
    setLivros([...livros, item]);
    setNovoLivro({ titulo: '', paginaAtual: '', totalPaginas: '' });
  };

  const atualizarPaginasLivro = (id, paginasLidas) => {
    setLivros(livros.map(l => {
      if (l.id === id) {
        const novaPagina = Math.min(l.paginaAtual + Number(paginasLidas), l.totalPaginas);
        return { ...l, paginaAtual: novaPagina };
      }
      return l;
    }));
  };

  const adicionarHabito = (e) => {
    e.preventDefault();
    if (!novoHabito) return;
    setHabitos([...habitos, { id: Date.now().toString(), nome: novoHabito, sequencia: 0, ultimaData: '' }]);
    setNovoHabito('');
  };

  const registrarHabitoHoje = (id) => {
    const hoje = new Date().toLocaleDateString('pt-BR');
    setHabitos(habitos.map(h => {
      if (h.id === id) {
        if (h.ultimaData === hoje) return h;
        return { ...h, sequencia: h.sequencia + 1, ultimaData: hoje };
      }
      return h;
    }));
  };

  // --- AUTENTICAÇÃO POR E-MAIL ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (!emailInput) return;
    setUserEmail(emailInput);
    localStorage.setItem('userEmail', emailInput);
    setEmailInput('');
  };

  return (
    <div style={styles.container}>
      {/* CABEÇALHO */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.appTitle}>🎓 Organizador Acadêmico</h1>
          <p style={styles.subTitle}>Sincronizado por E-mail & Controle Automático</p>
        </div>
        <div style={styles.userSection}>
          {userEmail ? (
            <div style={styles.userInfo}>
              <span>👤 <strong>{userEmail}</strong></span>
              <button style={styles.btnLink} onClick={() => { localStorage.removeItem('userEmail'); setUserEmail(''); }}>Sair</button>
            </div>
          ) : (
            <form onSubmit={handleLogin} style={styles.loginForm}>
              <input
                type="email"
                placeholder="Seu e-mail..."
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                style={styles.inputSmall}
              />
              <button type="submit" style={styles.btnPrimary}>Conectar</button>
            </form>
          )}
        </div>
      </header>

      {/* BARRA DE NAVEGAÇÃO */}
      <nav style={styles.nav}>
        {[
          { id: 'dashboard', label: '📊 Painel RU' },
          { id: 'agenda', label: '📅 Provas & Aulas' },
          { id: 'hobbies', label: '📚 Hobbies & Leitura' },
          { id: 'notas', label: '📝 Anotações' },
          { id: 'sync', label: '⚡ Sincronizar E-mail' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{ ...styles.navButton, ...(tab === t.id ? styles.navButtonActive : {}) }}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* PAINEL RU */}
      {tab === 'dashboard' && (
        <main style={styles.content}>
          <div style={styles.cardRU}>
            <h2>Restaurante Universitário</h2>
            <div style={styles.saldoDisplay}>
              <span style={styles.saldoNumero}>{saldoRU}</span>
              <span style={styles.saldoRotulo}>tickets restantes</span>
            </div>
            <div style={styles.ruButtonsGroup}>
              <button onClick={() => debitarRU('ALMOÇO')} style={{ ...styles.btnRU, backgroundColor: '#e74c3c' }}>-1 Almoço</button>
              <button onClick={() => debitarRU('JANTAR')} style={{ ...styles.btnRU, backgroundColor: '#e67e22' }}>-1 Jantar</button>
              <button onClick={() => recarregarRU(10)} style={{ ...styles.btnRU, backgroundColor: '#2ecc71' }}>+10 Recarga</button>
            </div>
          </div>

          <div style={styles.card}>
            <h3>Histórico de Uso do RU</h3>
            {historicoRU.length === 0 ? <p style={styles.empty}>Nenhum registro recente.</p> : (
              <ul style={styles.list}>
                {historicoRU.map(h => (
                  <li key={h.id} style={styles.listItem}>
                    <span>{h.tipo === 'RECARGA' ? `➕ Recarga (+${h.quantidade})` : `🍽️ ${h.tipo}`}</span>
                    <small style={styles.dateText}>{h.dataHora}</small>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>
      )}

      {/* PROVAS & AULAS (COM FORMATO DDMMAA) */}
      {tab === 'agenda' && (
        <main style={styles.content}>
          <div style={styles.card}>
            <h3>Adicionar Prova, Trabalho ou Aula</h3>
            <form onSubmit={adicionarCompromisso} style={styles.formGrid}>
              <input
                type="text"
                placeholder="Título (ex: Prova de Cálculo II)"
                value={novoCompromisso.titulo}
                onChange={e => setNovoCompromisso({ ...novoCompromisso, titulo: e.target.value })}
                style={styles.input}
              />
              <input
                type="text"
                placeholder="Matéria (ex: Matemática)"
                value={novoCompromisso.materia}
                onChange={e => setNovoCompromisso({ ...novoCompromisso, materia: e.target.value })}
                style={styles.input}
              />
              <select
                value={novoCompromisso.tipo}
                onChange={e => setNovoCompromisso({ ...novoCompromisso, tipo: e.target.value })}
                style={styles.input}
              >
                <option value="PROVA">Prova</option>
                <option value="TRABALHO">Trabalho</option>
                <option value="AULA">Aula</option>
              </select>
              <input
                type="text"
                maxLength={6}
                placeholder="Data no formato DDMMAA (ex: 251226)"
                value={novoCompromisso.dataRaw}
                onChange={e => setNovoCompromisso({ ...novoCompromisso, dataRaw: e.target.value })}
                style={styles.input}
              />
              <button type="submit" style={styles.btnPrimary}>Salvar na Agenda</button>
            </form>
          </div>

          <div style={styles.card}>
            <h3>Seus Compromissos Agendados</h3>
            {compromissos.length === 0 ? <p style={styles.empty}>Nenhuma prova ou trabalho agendado.</p> : (
              <div style={styles.gridList}>
                {compromissos.map(c => (
                  <div key={c.id} style={styles.itemCard}>
                    <div style={styles.itemBadge}>{c.tipo}</div>
                    <h4>{c.titulo}</h4>
                    <p><strong>Matéria:</strong> {c.materia || 'Geral'}</p>
                    <p style={styles.dateTag}>📅 {c.dataFormatada}</p>
                    <button onClick={() => removerCompromisso(c.id)} style={styles.btnDelete}>Concluir / Remover</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      )}

      {/* HOBBIES & HÁBITOS */}
      {tab === 'hobbies' && (
        <main style={styles.content}>
          {/* LEITURA DE LIVROS */}
          <div style={styles.card}>
            <h3>📖 Leitura de Livros</h3>
            <form onSubmit={adicionarLivro} style={styles.formGridRow}>
              <input
                type="text"
                placeholder="Nome do livro"
                value={novoLivro.titulo}
                onChange={e => setNovoLivro({ ...novoLivro, titulo: e.target.value })}
                style={styles.input}
              />
              <input
                type="number"
                placeholder="Pág. Atual"
                value={novoLivro.paginaAtual}
                onChange={e => setNovoLivro({ ...novoLivro, paginaAtual: e.target.value })}
                style={styles.inputShort}
              />
              <input
                type="number"
                placeholder="Total Págs."
                value={novoLivro.totalPaginas}
                onChange={e => setNovoLivro({ ...novoLivro, totalPaginas: e.target.value })}
                style={styles.inputShort}
              />
              <button type="submit" style={styles.btnPrimary}>+ Adicionar Livro</button>
            </form>

            <div style={{ marginTop: '20px' }}>
              {livros.map(l => {
                const pct = Math.round((l.paginaAtual / l.totalPaginas) * 100) || 0;
                return (
                  <div key={l.id} style={styles.bookItem}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>{l.titulo}</strong>
                      <span>{l.paginaAtual} / {l.totalPaginas} págs. ({pct}%)</span>
                    </div>
                    <div style={styles.progressBarBg}>
                      <div style={{ ...styles.progressBarFill, width: `${pct}%` }}></div>
                    </div>
                    <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                      <button onClick={() => atualizarPaginasLivro(l.id, 10)} style={styles.btnSmall}>+10 Págs</button>
                      <button onClick={() => atualizarPaginasLivro(l.id, 20)} style={styles.btnSmall}>+20 Págs</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* HÁBITOS (EX: INGLÊS) */}
          <div style={styles.card}>
            <h3>🔥 Sequência de Hábitos (Estudos, Exercícios)</h3>
            <form onSubmit={adicionarHabito} style={styles.formGridRow}>
              <input
                type="text"
                placeholder="Novo hábito (ex: Estudar Gramática de Inglês)"
                value={novoHabito}
                onChange={e => setNovoHabito(e.target.value)}
                style={styles.input}
              />
              <button type="submit" style={styles.btnPrimary}>+ Criar Hábito</button>
            </form>

            <div style={{ marginTop: '20px' }}>
              {habitos.map(h => (
                <div key={h.id} style={styles.habitItem}>
                  <div>
                    <strong>{h.nome}</strong>
                    <div style={styles.streakTag}>🔥 Sequência: {h.sequencia} dias</div>
                  </div>
                  <button onClick={() => registrarHabitoHoje(h.id)} style={styles.btnSuccess}>
                    {h.ultimaData === new Date().toLocaleDateString('pt-BR') ? '✅ Feito Hoje' : 'Marcar como Feito Hoje'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* ANOTAÇÕES */}
      {tab === 'notas' && (
        <main style={styles.content}>
          <div style={styles.card}>
            <h3>Criar Nova Anotação / Ideia</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!novaNota.titulo) return;
              setNotas([{ id: Date.now().toString(), ...novaNota }, ...notas]);
              setNovaNota({ titulo: '', materia: '', conteudo: '' });
            }} style={styles.formGrid}>
              <input
                type="text"
                placeholder="Título da anotação"
                value={novaNota.titulo}
                onChange={e => setNovaNota({ ...novaNota, titulo: e.target.value })}
                style={styles.input}
              />
              <textarea
                placeholder="Escreva suas ideias ou resumos aqui..."
                value={novaNota.conteudo}
                onChange={e => setNovaNota({ ...novaNota, conteudo: e.target.value })}
                style={{ ...styles.input, height: '100px' }}
              />
              <button type="submit" style={styles.btnPrimary}>Salvar Nota</button>
            </form>
          </div>

          <div style={styles.gridList}>
            {notas.map(n => (
              <div key={n.id} style={styles.itemCard}>
                <h4>{n.titulo}</h4>
                <p>{n.conteudo}</p>
                <button onClick={() => setNotas(notas.filter(x => x.id !== n.id))} style={styles.btnDelete}>Excluir</button>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* AUTOMAÇÃO POR E-MAIL */}
      {tab === 'sync' && (
        <main style={styles.content}>
          <div style={styles.card}>
            <h3>⚡ Configuração de Automação do RU por E-mail</h3>
            <p>Sempre que o Restaurante Universitário enviar um e-mail com o seu novo saldo de tickets, o serviço do <strong>Make.com</strong> lê o valor e atualiza este aplicativo sozinho.</p>
            
            <div style={styles.codeBox}>
              <strong>Webhook URL para a integração:</strong><br/>
              <code>https://api.organizador.estudos/webhook/ru-sync</code>
            </div>

            <ol style={styles.instructionsList}>
              <li>Crie uma conta no Make.com ou Zapier.</li>
              <li>Defina o gatilho: <em>"Novo e-mail do Restaurante Universitário"</em>.</li>
              <li>Defina a ação: <em>"Enviar requisição HTTP para o aplicativo com o número de tickets"</em>.</li>
            </ol>
          </div>
        </main>
      )}
    </div>
  );
}

// ESTILOS VISUAIS (DESIGN RESPONSIVO & MODERNO)
const styles = {
  container: { fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#f4f6f8', minHeight: '100vh', paddingBottom: '40px' },
  header: { backgroundColor: '#1e293b', color: '#fff', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' },
  appTitle: { margin: 0, fontSize: '24px' },
  subTitle: { margin: '5px 0 0 0', fontSize: '13px', color: '#94a3b8' },
  userSection: { display: 'flex', alignItems: 'center' },
  userInfo: { display: 'flex', gap: '10px', alignItems: 'center' },
  loginForm: { display: 'flex', gap: '8px' },
  inputSmall: { padding: '8px 12px', borderRadius: '6px', border: 'none' },
  btnPrimary: { backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  btnLink: { background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', textDecoration: 'underline' },
  nav: { display: 'flex', backgroundColor: '#0f172a', padding: '10px', overflowX: 'auto', gap: '8px' },
  navButton: { background: 'none', border: 'none', color: '#94a3b8', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', whitespace: 'nowrap' },
  navButtonActive: { backgroundColor: '#3b82f6', color: '#fff' },
  content: { maxWidth: '800px', margin: '20px auto', padding: '0 15px' },
  cardRU: { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', marginBottom: '20px' },
  saldoDisplay: { margin: '20px 0' },
  saldoNumero: { fontSize: '48px', fontWeight: 'bold', color: '#1e293b' },
  saldoRotulo: { display: 'block', color: '#64748b' },
  ruButtonsGroup: { display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' },
  btnRU: { color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  card: { backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', marginBottom: '20px' },
  formGrid: { display: 'flex', flexDirection: 'column', gap: '12px' },
  formGridRow: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  input: { padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '100%', boxSizing: 'border-box' },
  inputShort: { padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '100px' },
  gridList: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '15px' },
  itemCard: { backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', position: 'relative' },
  itemBadge: { backgroundColor: '#3b82f6', color: '#fff', fontSize: '10px', padding: '3px 8px', borderRadius: '4px', display: 'inline-block', marginBottom: '8px' },
  dateTag: { color: '#2563eb', fontWeight: 'bold' },
  btnDelete: { backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' },
  bookItem: { marginBottom: '15px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' },
  progressBarBg: { height: '10px', backgroundColor: '#e2e8f0', borderRadius: '5px', marginTop: '6px', overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#10b981' },
  btnSmall: { padding: '4px 8px', fontSize: '12px', borderRadius: '4px', border: '1px solid #cbd5e1', cursor: 'pointer', backgroundColor: '#fff' },
  habitItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #e2e8f0' },
  streakTag: { fontSize: '12px', color: '#f59e0b', fontWeight: 'bold', marginTop: '4px' },
  btnSuccess: { backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer' },
  codeBox: { backgroundColor: '#0f172a', color: '#38bdf8', padding: '12px', borderRadius: '6px', marginTop: '12px' },
  instructionsList: { marginTop: '15px', lineHeight: '1.6' },
  empty: { color: '#94a3b8', fontStyle: 'italic' },
  list: { listStyle: 'none', padding: 0 },
  listItem: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' },
  dateText: { color: '#94a3b8' }
};
