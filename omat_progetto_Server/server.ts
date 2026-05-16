import http from 'http';
import https from 'https';
import fs from 'fs';
import express, { CookieOptions, NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { Pool } from 'pg';

dotenv.config({ path: '.env' });

type UserRole = 'azienda' | 'admin';

type TokenPayload = {
  id: number;
  email: string;
  role: UserRole;
  name: string;
};

type AuthenticatedRequest = Request & {
  user?: TokenPayload;
};

const app = express();
const HTTP_PORT = Number(process.env.PORT ?? 3001);
const HTTPS_PORT = Number(process.env.HTTPS_PORT ?? 3000);
const TOKEN_DURATION_SECONDS = Number(process.env.DURATA_TOKEN ?? 3600);
const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? process.env.POSTGRES_URL,
  host: process.env.PGHOST,
  port: process.env.PGPORT ? Number(process.env.PGPORT) : undefined,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

const jwtKey =
  process.env.JWT_SECRET ??
  (fs.existsSync('keys/jwtKey') ? fs.readFileSync('keys/jwtKey', 'utf8') : 'omat-dev-secret');

const cookieOptions: CookieOptions = {
  path: '/',
  httpOnly: true,
  secure: isProduction,
  maxAge: TOKEN_DURATION_SECONDS * 1000,
  sameSite: isProduction ? 'none' : 'lax',
};

app.use((req, _res, next) => {
  console.log(`${req.method}: ${req.originalUrl}`);
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(
  cors({
    origin(origin, callback) {
      callback(null, origin ?? true);
    },
    credentials: true,
  }),
);

function createToken(payload: TokenPayload): string {
  return jwt.sign(payload, jwtKey, { expiresIn: TOKEN_DURATION_SECONDS });
}

function normalizeOrder(row: any) {
  return {
    id: String(row.id),
    code: `OM-${String(row.id).padStart(4, '0')}`,
    title: row.nomeProdotto,
    customer: row.nomeAzienda ?? 'Azienda non disponibile',
    material: row.materiale ?? 'Da definire',
    quantity: row.quantita,
    priority: row.urgenza,
    status: row.stato ?? 'sent',
    assignedAdmin: row.adminResponsabile ?? 'Da assegnare',
    createdAt: row.dataRichiesta,
    updatedAt: row.dataAggiornamento ?? row.dataRichiesta,
    deliveryDate: row.dataConsegna,
    description: row.descrizione,
    notes: row.noteAggiuntive,
    attachments: row.disegno
      ? [
          {
            id: `ordine-${row.id}-disegno`,
            fileName: row.disegno,
            contentType: 'application/octet-stream',
            size: 0,
            uploadedAt: row.dataRichiesta,
          },
        ]
      : [],
  };
}

function normalizePcto(row: any) {
  return {
    id: String(row.id),
    studentName: row.nome ?? 'Studente',
    studentSurname: row.cognome ?? '',
    email: row.email ?? '',
    city: row.citta ?? '',
    postalCode: row.cap ? String(row.cap) : '',
    school: row.scuola,
    classYear: row.classe,
    studyProgram: row.indirizzo,
    startDate: row.dataInizio,
    endDate: row.dataFine,
    motivation: row.motivazione,
    status: row.stato ?? 'sent',
    createdAt: row.createdAt ?? row.dataInizio,
  };
}

async function verifyPassword(plainPassword: string, dbPassword: string | null): Promise<boolean> {
  if (!dbPassword) {
    return false;
  }

  if (dbPassword.startsWith('$2a$') || dbPassword.startsWith('$2b$') || dbPassword.startsWith('$2y$')) {
    return bcrypt.compare(plainPassword, dbPassword);
  }

  return plainPassword === dbPassword;
}

function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const bearerToken = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice('Bearer '.length)
    : undefined;
  const token = req.cookies?.TOKEN ?? bearerToken;

  if (!token) {
    res.status(403).send('Token mancante');
    return;
  }

  jwt.verify(token, jwtKey, (err: any, payload: any) => {
    if (err) {
      res.status(403).send('Token non valido o scaduto');
      return;
    }

    req.user = payload as TokenPayload;
    res.cookie('TOKEN', createToken(req.user), cookieOptions);
    next();
  });
}

function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (req.user?.role !== 'admin') {
    res.status(403).send('Permessi insufficienti');
    return;
  }

  next();
}

app.get('/api/health', async (_req, res) => {
  const result = await pool.query('select now() as now');
  res.send({ ok: true, dbTime: result.rows[0].now });
});

app.post('/api/auth/login', async (req, res) => {
  const email = String(req.body.email ?? req.body.username ?? '').trim();
  const password = String(req.body.password ?? '');

  if (!email || !password) {
    res.status(400).send('Email e password sono obbligatorie');
    return;
  }

  const adminResult = await pool.query(
    'select "idLavoratore", nome, cognome, ruolo, email, password from public.admin where email = $1 limit 1',
    [email],
  );
  const admin = adminResult.rows[0];

  if (admin && (await verifyPassword(password, admin.password))) {
    const payload: TokenPayload = {
      id: Number(admin.idLavoratore),
      email: admin.email,
      role: 'admin',
      name: `${admin.nome} ${admin.cognome}`.trim(),
    };

    const token = createToken(payload);
    res.cookie('TOKEN', token, cookieOptions);
    res.send({ token, user: payload });
    return;
  }

  const companyResult = await pool.query(
    'select "idAzienda", "nomeAzienda", "emailAzienda", password from public.aziende where "emailAzienda" = $1 limit 1',
    [email],
  );
  const company = companyResult.rows[0];

  if (company && (await verifyPassword(password, company.password))) {
    const payload: TokenPayload = {
      id: Number(company.idAzienda),
      email: company.emailAzienda,
      role: 'azienda',
      name: company.nomeAzienda,
    };

    const token = createToken(payload);
    res.cookie('TOKEN', token, cookieOptions);
    res.send({ token, user: payload });
    return;
  }

  res.status(401).send('Email o password non validi');
});

app.post('/api/auth/logout', (_req, res) => {
  res.cookie('TOKEN', '', { ...cookieOptions, maxAge: -1 });
  res.send({ ok: true });
});

app.post('/api/auth/register-company', async (req, res) => {
  const passwordHash = await bcrypt.hash(String(req.body.password), 10);

  const result = await pool.query(
    `
      insert into public.aziende ("nomeAzienda", "emailAzienda", password, luogo, "contattoTelefonico")
      values ($1, $2, $3, $4, $5)
      returning "idAzienda", "nomeAzienda", "emailAzienda", luogo, "contattoTelefonico"
    `,
    [
      req.body.nomeAzienda,
      req.body.emailAzienda,
      passwordHash,
      req.body.luogo,
      req.body.contattoTelefonico,
    ],
  );

  res.status(201).send(result.rows[0]);
});

app.get('/api/orders', requireAuth, async (req: AuthenticatedRequest, res) => {
  const params: any[] = [];
  const where: string[] = [];

  if (req.user?.role === 'azienda') {
    params.push(req.user.id);
    where.push(`o."idAzienda" = $${params.length}`);
  }

  const result = await pool.query(
    `
      select
        o.*,
        a."nomeAzienda",
        null::text as materiale,
        null::text as stato,
        null::text as "adminResponsabile",
        null::date as "dataAggiornamento"
      from public.ordini o
      join public.aziende a on a."idAzienda" = o."idAzienda"
      ${where.length ? `where ${where.join(' and ')}` : ''}
      order by o."dataRichiesta" desc, o.id desc
    `,
    params,
  );

  res.send(result.rows.map(normalizeOrder));
});

app.get('/api/orders/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  const params: any[] = [req.params.id];
  const where = ['o.id = $1'];

  if (req.user?.role === 'azienda') {
    params.push(req.user.id);
    where.push(`o."idAzienda" = $${params.length}`);
  }

  const result = await pool.query(
    `
      select
        o.*,
        a."nomeAzienda",
        null::text as materiale,
        null::text as stato,
        null::text as "adminResponsabile",
        null::date as "dataAggiornamento"
      from public.ordini o
      join public.aziende a on a."idAzienda" = o."idAzienda"
      where ${where.join(' and ')}
      limit 1
    `,
    params,
  );

  if (!result.rowCount) {
    res.status(404).send('Ordine non trovato');
    return;
  }

  res.send(normalizeOrder(result.rows[0]));
});

app.post('/api/orders', requireAuth, async (req: AuthenticatedRequest, res) => {
  const idAzienda = req.user?.role === 'azienda' ? req.user.id : Number(req.body.idAzienda);

  if (!idAzienda) {
    res.status(400).send('idAzienda mancante');
    return;
  }

  const notes = [
    req.body.materiale ?? req.body.material ? `Materiale: ${req.body.materiale ?? req.body.material}` : '',
    req.body.noteAggiuntive ?? req.body.notes ?? '',
  ]
    .filter(Boolean)
    .join('\n');

  const result = await pool.query(
    `
      insert into public.ordini (
        "nomeProdotto",
        descrizione,
        disegno,
        urgenza,
        "idAzienda",
        "dataRichiesta",
        "dataConsegna",
        "noteAggiuntive",
        quantita
      )
      values ($1, $2, $3, $4, $5, current_date, $6, $7, $8)
      returning *
    `,
    [
      req.body.nomeProdotto ?? req.body.title,
      req.body.descrizione ?? req.body.description,
      req.body.disegno ?? req.body.attachments?.[0]?.fileName ?? null,
      req.body.urgenza ?? req.body.priority ?? 'standard',
      idAzienda,
      req.body.dataConsegna ?? null,
      notes || null,
      Number(req.body.quantita ?? req.body.quantity),
    ],
  );

  res.status(201).send(normalizeOrder(result.rows[0]));
});

app.get('/api/pcto', requireAuth, requireAdmin, async (_req, res) => {
  const result = await pool.query(
    `
      select
        r.*,
        null::text as nome,
        null::text as cognome,
        null::text as email,
        null::text as citta,
        null::smallint as cap,
        null::text as stato,
        r."dataInizio" as "createdAt"
      from public."richiestePCTO" r
      order by r."dataInizio" desc, r.id desc
    `,
  );

  res.send(result.rows.map(normalizePcto));
});

app.get('/api/pcto/:id', requireAuth, requireAdmin, async (req, res) => {
  const result = await pool.query(
    `
      select
        r.*,
        null::text as nome,
        null::text as cognome,
        null::text as email,
        null::text as citta,
        null::smallint as cap,
        null::text as stato,
        r."dataInizio" as "createdAt"
      from public."richiestePCTO" r
      where r.id = $1
      limit 1
    `,
    [req.params.id],
  );

  if (!result.rowCount) {
    res.status(404).send('Richiesta PCTO non trovata');
    return;
  }

  res.send(normalizePcto(result.rows[0]));
});

app.post('/api/pcto', async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('begin');

    const studentResult = await client.query(
      `
        insert into public.studenti (nome, cognome, "numeroTelefono", email, citta, cap)
        values ($1, $2, $3, $4, $5, $6)
        returning *
      `,
      [
        req.body.nome ?? req.body.firstName,
        req.body.cognome ?? req.body.lastName,
        req.body.numeroTelefono ?? req.body.phone ?? 'Non indicato',
        req.body.email,
        req.body.citta ?? req.body.city ?? null,
        Number(req.body.cap ?? req.body.postalCode),
      ],
    );

    const pctoResult = await client.query(
      `
        insert into public."richiestePCTO" (scuola, classe, indirizzo, "dataInizio", "dataFine", motivazione)
        values ($1, $2, $3, $4, $5, $6)
        returning *
      `,
      [
        req.body.scuola ?? req.body.school,
        req.body.classe ?? req.body.classYear,
        req.body.indirizzo ?? req.body.studyProgram,
        req.body.dataInizio ?? req.body.startDate,
        req.body.dataFine ?? req.body.endDate,
        req.body.motivazione ?? req.body.motivation ?? null,
      ],
    );

    await client.query('commit');

    res.status(201).send({
      student: studentResult.rows[0],
      request: normalizePcto({
        ...pctoResult.rows[0],
        nome: studentResult.rows[0].nome,
        cognome: studentResult.rows[0].cognome,
        email: studentResult.rows[0].email,
        citta: studentResult.rows[0].citta,
        cap: studentResult.rows[0].cap,
      }),
    });
  } catch (err) {
    await client.query('rollback');
    throw err;
  } finally {
    client.release();
  }
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).send(err?.message ?? 'Errore interno del server');
});

http.createServer(app).listen(HTTP_PORT, () => {
  console.log(`Server HTTP in ascolto sulla porta ${HTTP_PORT}`);
});

if (fs.existsSync('keys/privateKey.pem') && fs.existsSync('keys/certificate.crt')) {
  const credentials = {
    key: fs.readFileSync('keys/privateKey.pem', 'utf8'),
    cert: fs.readFileSync('keys/certificate.crt', 'utf8'),
  };

  https.createServer(credentials, app).listen(HTTPS_PORT, () => {
    console.log(`Server HTTPS in ascolto sulla porta ${HTTPS_PORT}`);
  });
}
