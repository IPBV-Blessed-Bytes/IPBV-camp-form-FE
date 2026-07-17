/*
 * Mock BE para o sistema de inscrições (Acampamento IPBV).
 * Implementa os contratos planejados (Opção A) para o BE implementar depois.
 * Roda em http://localhost:3001. Persiste em mock/db.json.
 *
 * Uso: npm run mock   (ou npm run dev:mock para subir FE + mock juntos)
 */
const fs = require('fs');
const path = require('path');
const jsonServer = require('json-server');

const DB_PATH = path.join(__dirname, 'db.json');
const server = jsonServer.create();
server.use(jsonServer.defaults());
server.use(jsonServer.bodyParser);

// ---------- persistência simples ----------
let db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
const save = () => fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

// ---------- config de segurança (mock) ----------
const MAX_ATTEMPTS = 5; // falhas até bloqueio temporário
const LOCK_MINUTES = 15; // duração do bloqueio temporário
const MAX_LOCKS = 3; // bloqueios na janela até bloqueio duro

// ---------- helpers ----------
const b64url = (obj) =>
  Buffer.from(JSON.stringify(obj)).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const makeToken = (login, role) => {
  const header = b64url({ alg: 'HS256', typ: 'JWT' });
  const now = Math.floor(Date.now() / 1000);
  const payload = b64url({ iss: 'mock-api', sub: login, role, iat: now, exp: now + 2 * 60 * 60 });
  return `${header}.${payload}.mocksignature`;
};

const decodeToken = (req) => {
  const auth = req.headers['authorization'];
  if (!auth) return null;
  try {
    const payload = auth.replace('Bearer ', '').split('.')[1];
    return JSON.parse(Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8'));
  } catch {
    return null;
  }
};

const parseBRDate = (str) => {
  if (!str) return null;
  const [d, m, y] = str.split('/');
  return new Date(`${y}-${m}-${d}T00:00:00`);
};

const getActiveLot = () => {
  const now = new Date();
  return (
    db.lots.find((lot) => {
      const start = parseBRDate(lot.startDate);
      const end = parseBRDate(lot.endDate);
      if (!start || !end) return false;
      end.setHours(23, 59, 59, 999);
      return now >= start && now <= end;
    }) || db.lots[0] || null
  );
};

const priceRow = (lotId, productId) =>
  db.lotProductPrices.find((r) => String(r.lotId) === String(lotId) && r.productId === productId);

const genId = (name) =>
  (name || 'produto')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const findToken = (raw, type) =>
  db.securityTokens.find((t) => t.token === raw && t.type === type && !t.usedAt && new Date(t.expiresAt) > new Date());

const log = (...a) => console.log('[mock]', ...a);

// =========================================================
// AUTH
// =========================================================
server.post('/auth/login', (req, res) => {
  const { login, password } = req.body || {};
  const attempt = db.loginAttempts.find((a) => a.login === login) || { login, failed: 0, lockCount: 0, lockedUntil: null };

  // bloqueio temporário ativo
  if (attempt.lockedUntil && new Date(attempt.lockedUntil) > new Date()) {
    const minutesLeft = Math.ceil((new Date(attempt.lockedUntil) - new Date()) / 60000);
    return res.status(423).json({ message: 'Conta temporariamente bloqueada.', minutesLeft });
  }

  const user = db.users.find((u) => u.userName === login);
  const cred = db.credentials.find((c) => c.login === login);

  // bloqueio duro (só libera por e-mail)
  if (user && user.enabled === false) {
    return res.status(423).json({ message: 'Conta bloqueada. Use o link enviado ao seu e-mail para desbloquear.', hardLocked: true });
  }

  const ok = cred && cred.password === password;
  if (!ok) {
    attempt.failed = (attempt.failed || 0) + 1;
    if (attempt.failed >= MAX_ATTEMPTS) {
      attempt.failed = 0;
      attempt.lockCount = (attempt.lockCount || 0) + 1;
      attempt.lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60000).toISOString();
      if (attempt.lockCount >= MAX_LOCKS && user) {
        user.enabled = false; // bloqueio duro
      }
    }
    if (!db.loginAttempts.includes(attempt)) db.loginAttempts.push(attempt);
    save();
    if (attempt.lockedUntil && new Date(attempt.lockedUntil) > new Date()) {
      const minutesLeft = Math.ceil((new Date(attempt.lockedUntil) - new Date()) / 60000);
      return res.status(423).json({ message: 'Muitas tentativas. Conta bloqueada temporariamente.', minutesLeft });
    }
    return res.status(401).json({ message: 'Credenciais inválidas.', attemptsLeft: MAX_ATTEMPTS - attempt.failed });
  }

  // sucesso: zera contadores
  attempt.failed = 0;
  attempt.lockedUntil = null;
  if (!db.loginAttempts.includes(attempt)) db.loginAttempts.push(attempt);
  save();
  log('login OK:', login, '->', user.role);
  return res.json({ token: makeToken(login, user.role), role: user.role });
});

server.get('/auth/', (_req, res) => res.send('Você conseguiu'));

server.post('/auth/forgot-password', (req, res) => {
  const { email } = req.body || {};
  const user = db.users.find((u) => u.email === email);
  if (user) {
    const token = 'reset-' + Math.floor(Date.now()).toString(36);
    db.securityTokens.push({ id: token, userId: user.id, token, type: 'RESET', expiresAt: new Date(Date.now() + 30 * 60000).toISOString(), usedAt: null });
    save();
    log('reset link (mock):', `/redefinir-senha?token=${token}`);
  }
  return res.json({ message: 'Se o e-mail existir, enviaremos um link de redefinição.' });
});

server.post('/auth/reset-password', (req, res) => {
  const { token, newPassword } = req.body || {};
  const t = findToken(token, 'RESET');
  if (!t) return res.status(400).json({ message: 'Token inválido ou expirado.' });
  const cred = db.credentials.find((c) => c.id === t.userId);
  const user = db.users.find((u) => u.id === t.userId);
  if (cred) cred.password = newPassword;
  if (user) user.enabled = true;
  t.usedAt = new Date().toISOString();
  const attempt = db.loginAttempts.find((a) => user && a.login === user.userName);
  if (attempt) { attempt.failed = 0; attempt.lockCount = 0; attempt.lockedUntil = null; }
  save();
  return res.json({ message: 'Senha redefinida com sucesso.' });
});

server.post('/auth/unlock-request', (req, res) => {
  const { email } = req.body || {};
  const user = db.users.find((u) => u.email === email);
  if (user) {
    const token = 'unlock-' + Math.floor(Date.now()).toString(36);
    db.securityTokens.push({ id: token, userId: user.id, token, type: 'UNLOCK', expiresAt: new Date(Date.now() + 30 * 60000).toISOString(), usedAt: null });
    save();
    log('unlock link (mock):', `/desbloquear?token=${token}`);
  }
  return res.json({ message: 'Se o e-mail existir, enviaremos um link de desbloqueio.' });
});

server.post('/auth/unlock', (req, res) => {
  const { token } = req.body || {};
  const t = findToken(token, 'UNLOCK');
  if (!t) return res.status(400).json({ message: 'Token inválido ou expirado.' });
  const user = db.users.find((u) => u.id === t.userId);
  if (user) user.enabled = true;
  t.usedAt = new Date().toISOString();
  const attempt = db.loginAttempts.find((a) => user && a.login === user.userName);
  if (attempt) { attempt.failed = 0; attempt.lockCount = 0; attempt.lockedUntil = null; }
  save();
  return res.json({ message: 'Conta desbloqueada com sucesso.' });
});

// =========================================================
// PERMISSÕES (RBAC dinâmico)
// =========================================================
server.get('/auth/me/permissions', (req, res) => {
  const payload = decodeToken(req);
  if (!payload) return res.status(401).json({ message: 'Não autenticado.' });
  const role = db.roles.find((r) => r.name === payload.role);
  return res.json({ role: payload.role, permissions: role ? role.permissions : [] });
});

server.get('/roles', (_req, res) => res.json(db.roles));
server.post('/roles', (req, res) => {
  const { name, label, permissions = [] } = req.body || {};
  const id = genId(name);
  if (db.roles.some((r) => r.id === id)) return res.status(400).json({ message: 'Papel já existe.' });
  const role = { id, name: name || id, label: label || name, system: false, permissions };
  db.roles.push(role); save();
  return res.json(role);
});
server.patch('/roles/:id', (req, res) => {
  const role = db.roles.find((r) => r.id === req.params.id);
  if (!role) return res.status(404).json({ message: 'Papel não encontrado.' });
  const { label, permissions } = req.body || {};
  if (label !== undefined) role.label = label;
  if (permissions !== undefined) role.permissions = permissions;
  save();
  return res.json(role);
});
server.delete('/roles/:id', (req, res) => {
  const role = db.roles.find((r) => r.id === req.params.id);
  if (!role) return res.status(404).json({ message: 'Papel não encontrado.' });
  if (role.system) return res.status(400).json({ message: 'Papel de sistema não pode ser excluído.' });
  if (db.users.some((u) => u.role === role.name)) return res.status(400).json({ message: 'Há usuários vinculados a este papel.' });
  db.roles = db.roles.filter((r) => r.id !== role.id); save();
  return res.json({ message: 'Papel excluído.' });
});

server.get('/permissions', (_req, res) => res.json(db.permissions));

// =========================================================
// PRODUTOS (catálogo dinâmico — Opção A)
// =========================================================
// Consumo público: produtos ativos + preço/vaga do lote ativo
server.get('/products', (_req, res) => {
  const lot = getActiveLot();
  const list = db.products
    .filter((p) => p.active)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((p) => {
      const row = lot ? priceRow(lot.id, p.id) : null;
      return { ...p, price: row ? Number(row.price) : 0, vacancies: row ? row.vacancies : null };
    });
  res.json({ products: list, activeLotId: lot ? lot.id : null });
});

// Admin: catálogo completo com preços por lote
server.get('/products/all', (_req, res) => {
  const list = db.products
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((p) => ({
      ...p,
      prices: db.lotProductPrices
        .filter((r) => r.productId === p.id)
        .map((r) => ({ lotId: r.lotId, price: Number(r.price), vacancies: r.vacancies })),
    }));
  res.json({ products: list });
});

server.post('/products', (req, res) => {
  const { name, description = '', category, active = true, sortOrder } = req.body || {};
  if (!name || !category) return res.status(400).json({ message: 'name e category são obrigatórios.' });
  let id = genId(name);
  let i = 1;
  while (db.products.some((p) => p.id === id)) id = `${genId(name)}-${++i}`;
  const product = {
    id,
    slug: id,
    name,
    description,
    category,
    active,
    sortOrder: sortOrder ?? db.products.length + 1,
  };
  db.products.push(product);
  // cria linhas de preço/vaga (zeradas) para todos os lotes
  db.lots.forEach((lot) => {
    const maxId = db.lotProductPrices.reduce((m, r) => Math.max(m, r.id), 0);
    db.lotProductPrices.push({ id: maxId + 1, lotId: lot.id, productId: id, price: 0, vacancies: null });
  });
  save();
  return res.json(product);
});

server.patch('/products/:id', (req, res) => {
  const product = db.products.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ message: 'Produto não encontrado.' });
  const { name, description, category, active, sortOrder } = req.body || {};
  if (name !== undefined) product.name = name;
  if (description !== undefined) product.description = description;
  if (category !== undefined) product.category = category;
  if (active !== undefined) product.active = active;
  if (sortOrder !== undefined) product.sortOrder = sortOrder;
  save();
  return res.json(product);
});

server.delete('/products/:id', (req, res) => {
  const product = db.products.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ message: 'Produto não encontrado.' });
  db.products = db.products.filter((p) => p.id !== req.params.id);
  db.lotProductPrices = db.lotProductPrices.filter((r) => r.productId !== req.params.id);
  save();
  return res.json({ message: 'Produto excluído.' });
});

// Define preço + vaga de um produto em um lote
server.put('/lots/:lotId/products/:productId', (req, res) => {
  const { lotId, productId } = req.params;
  const { price, vacancies } = req.body || {};
  let row = priceRow(lotId, productId);
  if (!row) {
    const maxId = db.lotProductPrices.reduce((m, r) => Math.max(m, r.id), 0);
    row = { id: maxId + 1, lotId: Number(lotId), productId };
    db.lotProductPrices.push(row);
  }
  if (price !== undefined) row.price = Number(price);
  if (vacancies !== undefined) row.vacancies = vacancies === null || vacancies === '' ? null : Number(vacancies);
  save();
  return res.json(row);
});

// =========================================================
// LOTES (shape { lots: [...] } como o BE real)
// =========================================================
server.get('/lots', (_req, res) => res.json({ lots: db.lots }));
server.post('/lots', (req, res) => {
  const maxId = db.lots.reduce((m, l) => Math.max(m, l.id), 0);
  const lot = { id: maxId + 1, ...req.body };
  db.lots.push(lot); save();
  return res.json({ message: 'Operação realizada com sucesso.', lot });
});
server.patch('/lots/:id', (req, res) => {
  const lot = db.lots.find((l) => String(l.id) === req.params.id);
  if (!lot) return res.status(404).json({ message: 'Lote não encontrado.' });
  Object.assign(lot, req.body); save();
  return res.json({ message: 'Operação realizada com sucesso.' });
});
server.delete('/lots/:id', (req, res) => {
  db.lots = db.lots.filter((l) => String(l.id) !== req.params.id); save();
  return res.json({ message: 'Operação realizada com sucesso.' });
});

// =========================================================
// USUÁRIOS (com email)
// =========================================================
server.get('/users', (_req, res) => res.json(db.users));
server.post('/users', (req, res) => {
  const { userName, password, role, email } = req.body || {};
  if (db.users.some((u) => u.userName === userName)) return res.status(400).json({ message: 'userName já existe.' });
  const id = 'u-' + genId(userName);
  db.users.push({ id, userName, email: email || '', role, enabled: true });
  db.credentials.push({ id, login: userName, password });
  save();
  return res.status(200).send('');
});
server.put('/users/:id', (req, res) => {
  const user = db.users.find((u) => u.id === req.params.id);
  if (!user) return res.status(400).send('user not found');
  const { userName, password, role, email } = req.body || {};
  if (userName !== undefined) user.userName = userName;
  if (role !== undefined) user.role = role;
  if (email !== undefined) user.email = email;
  const cred = db.credentials.find((c) => c.id === user.id);
  if (cred) { if (userName !== undefined) cred.login = userName; if (password) cred.password = password; }
  save();
  return res.send('User atualizado com sucesso.');
});
server.delete('/users/:id', (req, res) => {
  db.users = db.users.filter((u) => u.id !== req.params.id);
  db.credentials = db.credentials.filter((c) => c.id !== req.params.id);
  save();
  return res.json('');
});

// =========================================================
// INSCRIÇÃO — pré-preenchimento com dados do ano anterior
// =========================================================
const onlyDigits = (s) => String(s || '').replace(/\D/g, '');

server.post('/camper/user-previous-year', (req, res) => {
  const { cpf } = req.body || {};
  const found = (db.campersPreviousYear || []).find((c) => onlyDigits(c.personalInformation?.cpf) === onlyDigits(cpf));
  if (!found) return res.status(404).json({ message: 'Nenhum dado do ano anterior para este CPF.' });
  return res.json({ personalInformation: found.personalInformation, contact: found.contact });
});

server.delete('/camper/user-previous-year/:cpf', (req, res) => {
  const before = (db.campersPreviousYear || []).length;
  db.campersPreviousYear = (db.campersPreviousYear || []).filter(
    (c) => onlyDigits(c.personalInformation?.cpf) !== onlyDigits(req.params.cpf),
  );
  save();
  return res.json({ removed: before - db.campersPreviousYear.length });
});

// =========================================================
// STUBS do painel (para o app não quebrar)
// =========================================================
server.get('/form-context', (_req, res) => res.json(db.formContext));
server.put('/form-context', (req, res) => { db.formContext = { formContext: req.body.formContext }; save(); res.json(db.formContext); });
server.get('/homepage-info', (_req, res) => res.json(db.homepageInfo));
server.get('/base-date', (_req, res) => res.json(db.baseDate));
server.get('/package-count', (_req, res) => res.json(db.packageCount));
server.get('/total-registrations', (_req, res) => res.json(db.totalRegistrations));
server.post('/logs', (req, res) => { db.logs.push({ id: db.logs.length + 1, ...req.body, at: new Date().toISOString() }); save(); res.json({ ok: true }); });
server.get('/logs', (_req, res) => res.json(db.logs));

// catch-all: evita 404 em telas ainda não implementadas no mock
server.use((req, res) => {
  log('não implementado:', req.method, req.path);
  if (req.method === 'GET') return res.json([]);
  return res.status(200).json({ message: 'mock: endpoint não implementado', path: req.path });
});

const PORT = 3001;
server.listen(PORT, () => {
  log(`Mock BE rodando em http://localhost:${PORT}`);
  log('Usuários: admin@ipbv / admin123 · colaborador@ipbv / colab123 · checker@ipbv / checker123');
});
