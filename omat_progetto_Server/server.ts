//A. import delle librerie
import http, { request } from "http";
import https from "https"
import fs from "fs";
import express, { CookieOptions } from "express";
import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";
import queryStringParser from "./queryStringParser";
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
import { create } from "domain";
import { emitWarning } from "process";
import nodemailer from 'nodemailer'

//req.query = parametri GET
//req.body = parametri POST
//req.params = parametri passati nella risorsa

//B. configurazioni
//funzione di callback richiamata in corrispondenza di ogni richiesta al server
const app: express.Express = express();
//prende le configurazioni dal file .env
dotenv.config({
    path: ".env"
});


const connectionString = process.env.connectionStringLocal;
const dbName = process.env.dbName;
const HTTPS_PORT = parseInt(process.env.HTTPS_PORT!);
const googleOAuth = JSON.parse(process.env.googleOAuth!);

//C.  Creazione ed avvio del server http
const server = http.createServer(app);
let paginaErrore: string = "";
// Il metodo readFile non è asincrono quindi lo esegue e nel mentre va avanti
fs.readFile("./static/error.html", function (err, content) {
    if (err) {
        paginaErrore = "<h1> Risorsa non trovata </h1>"
    }
    else {
        // bisogna fare .toString() perchè content è una sequenza di byte
        paginaErrore = content.toString();
    }
});


// Creazione ed avvio di un server HTTPS
const privateKey = fs.readFileSync("keys/privateKey.pem", "utf8");
const certificate = fs.readFileSync("keys/certificate.crt", "utf8");
const credentials = { "key": privateKey, "cert": certificate };
const jwtKey = fs.readFileSync('keys/jwtKey', 'utf8')

let httpsServer = https.createServer(credentials, app);
httpsServer.listen(HTTPS_PORT, function () {
    console.log("Server in ascolto sulla porta HTTPS:" + HTTPS_PORT)
});


//D. middleware
//1. request log
app.use("/", function (req, res, next) {
    console.log(req.method + ": " + req.originalUrl);
    next();
})

//2. gestione risorse statiche
app.use("/", express.static("./static"));

//3. lettura dei parametri post
//express.json({"limit": "5mb"}) = accetto parametri post con una dimensione massima di 5MB e li restituisce
//i parametri post sono restituiti come json all'interno di req.body
//i parametri get sono restituiti come json all'interno di req.query
//(agganciati automaticamente perchè in coda alla url)
app.use("/", express.json({ "limit": "5mb" }));

//4. Parsing dei parametri GET
app.use("/", queryStringParser)

//5. log dei parametri post
app.use("/", function (req, res, next) {
    if (req['query'] && Object.keys(req['query']).length > 0)
        console.log("      parametri query: " + JSON.stringify(req['query']));
    else if (req['body'] && Object.keys(req['body']).length > 0)
        console.log("      parametri body: " + JSON.stringify(req['body']));
    next();
})

//6. Vincoli CORS
// accettiamo sul nostro server richiesta da qualunque client.
const corsOptions = {
    origin: function (origin: any, callback: any) {
        return callback(null, true);
    },
    credentials: true
};
app.use("/", cors(corsOptions));

//7. parsing dei cookies
app.use(cookieParser())


// ***************************************************************** //

//D2. Gestione Login e Token
const cookiesOptions = ({
    path: '/', //vale per tutte le sotto root
    httpOnly: true, //cookie non visibile da js
    secure: true, //cookie trasmesso solo su canali HTTPS
    maxAge: parseInt(process.env.DURATA_TOKEN!) * 1000, //durata del cookie, relativa a partire da ora
    sameSite: 'none' //deve essere trasmesso anche extra-domain il cookie 
    // (lo manda anche ai serve che non appartengono allo stesso dominio)
}) as CookieOptions

// 1. Login
app.post('/api/login', async function (req: any, res, next) {
    let username: string = req.body.username
    let password: string = req.body.password

    const client = new MongoClient(connectionString!)
    await client.connect().catch(function (err) {
        res.status(503).send("Errore di connessione al dbms")
        return;
    })
    const collection = client.db(dbName).collection('mails')
    const cmd = collection.findOne({ username })
    cmd.catch(function (err) {
        res.status(500).send("Errore esecuzione query: " + err)
    })
    cmd.then(function (dbUser) { // gli inietta l'intero record utente, compresa la password
        if (!dbUser)
            res.status(401).send('Username o password non valido')
        else {
            console.log('Password ricevuta:', password, ' - Password DB:', dbUser.password)
            bcrypt.compare(password, dbUser.password, function (err, ok) {  //prima: pw in chiaro, seconda: pw cifrata, terza: callback
                if (err) {
                    res.status(500).send('Bcrypt execution failed')
                    console.log(err?.stack)
                }
                else if (!ok)  // la pw era sbagliata
                    res.status(401).send('Password non valida')
                else {
                    const TOKEN = createToken(dbUser)
                    res.cookie('TOKEN', TOKEN, cookiesOptions)
                    res.send({ _id: dbUser._id })
                }
            })
        }
    })
    cmd.finally(function () {
        client.close()
    })
})

// 2. LOGIN WITH GOOGLE
app.post('/api/loginWithGoogle', async function (req: any, res, next) {
    const googleToken: any = req.body.googleToken
    const payloadGoogleToken: any = jwt.decode(googleToken) // non possiamo verificarlo perché non ho la chiave di creazione
    console.log('Google Token:', payloadGoogleToken)
    const client = new MongoClient(connectionString!)
    await client.connect().catch(function (err) {
        res.status(503).send('Errore di connessione al Dtabase')
        return
    })
    const collection = client.db(dbName).collection('mails')
    const cmd = collection.findOne({ username: payloadGoogleToken.email })
    cmd.catch(function (err) {
        res.status(500).send('Errore esecuzione query: ' + err)
        client.close()
    })
    cmd.then(function (dbUser) {
        if (!dbName) {
            let password = ''
            for (let i = 0; i < 12; i++) {
                password += String.fromCharCode(Math.floor(Math.random() * 26) + 65)
            }

            const newUser: any = {
                username: payloadGoogleToken.email,
                password: bcrypt.hashSync(password, 10),
                oldPassword: password,
                mail: []
            }

            const cmd2 = collection.insertOne(newUser)
            cmd2.catch(function (err) {
                res.status(500).send('Errore esecuzione query: ' + err)
                client.close()
            })
            cmd2.then(function (mongoResponse) {
                newUser._id = mongoResponse.insertedId.toString()
                sendGmail(payloadGoogleToken.email, password)
                const TOKEN = createToken(newUser)
                res.cookie('TOKEN', TOKEN, cookiesOptions)
                res.send({ username: payloadGoogleToken.email })
            })
            cmd2.finally(function () {
                client.close()
            })
        }
        else {
            const TOKEN = createToken(dbUser)
            res.cookie('TOKEN', TOKEN, cookiesOptions)
            res.send({ username: payloadGoogleToken.email })
        }
    })
})

function sendGmail(email: any, password: any) {
    let message = fs.readFileSync('./message.html', 'utf8')
    message = message.replace('__user', email)
    message = message.replace('__password', password)
    
    const transporter = nodemailer.createTransport({service: 'gmail', auth: googleOAuth})
    const mailOptions = {
        "from": googleOAuth.user,
        "to": email,
        "subject": 'Nuovo Account Rilievi e Perizie',
        "html": message,
        "attachments": [{filename: "qrCode.png", path: "./qrCode.png"}]
    }
    transporter.sendMail(mailOptions, function(err: any, info: any) {
        if (err) {
            console.log(err.stack)
        }
        else {
            console.log(info)
            transporter.close()
        }
    })
}


// 3. INSERIMENTO DI UN NUOVO UTENTE


// PER ULTIMO: Controllo TOKEN
// controlla tutti i servizi che iniziano con /api, se il TOKEN è scaduto o no.
app.use('/api/', function (req: any, res, next) {
    if (!req.cookies || !req.cookies.TOKEN) // coockies: collezione dei token -> guardiamo se dentro c'è un cookie che si chiama TOKEN
        res.status(403).send('Token mancante')
    else {
        let token = req.cookies.TOKEN
        jwt.verify(token, jwtKey, function (err: any, payload: any) {
            if (err) {
                console.log('Token scaduto o non valido')
                res.status(403).send('Token non valido o scaduto')
            }
            else {
                let newToken = createToken(payload)
                res.cookie('TOKEN', newToken, cookiesOptions)
                req['username'] = payload.username
                next()
            }
        })
    }
})

// LOGOUT
app.post('/api/logout', async function (req: any, res, next) {
    const options = {
        ...cookiesOptions, maxAge: -1
    }
    res.cookie('TOKEN', '', options)
    res.send({ ok: 1 })
})


// ----------------------------------------------------------------- //

//E. gestione delle risorse dinamiche
app.get("/api/mails", async function (req: any, res, next) {
    const username = req['username']
    const currentCollection = 'mails'

    const client = new MongoClient(connectionString!)
    await client.connect().catch(function (err) {
        res.status(503).send("Errore di connessione al dbms")
        return;
    })
    const collection = client.db(dbName).collection(currentCollection)
    const cmd = collection.findOne({ username: username }, { projection: { mail: 1, _id: 0 } })
    cmd.then(function (data) {
        res.send(data)
    })
    cmd.catch(function (err) {
        res.status(500).send("Errore esecuzione query: " + err)
    });
    cmd.finally(function () {
        client.close()
    })
});


// ***************************************************************** //

//F. default root
app.use("/", function (req, res, next) {
    if (req.originalUrl.startsWith("/api/")) {
        // risorsa dinamica
        res.status(404).send("Servizio non trovato");
    }
    else if (req.accepts("html")) { // se la richiesta è per una pagina HTML
        res.status(404).send(paginaErrore);
    }
    else {
        res.sendStatus(404) // equivalente a res.status(404).send("")
    }
})

//G. gestione errori
app.use("/", function (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) {
    //err.stack elenco completo degli errori
    res.status(500).send(err.message);
    console.log("******** ERRORE ********:\n " + err.stack);
})


function createToken(data: any) {
    const now = Math.floor(((new Date()).getTime()) / 1000) // millisecondi attuali dalla creazione del token
    const payload = {
        '_id': data._id,
        'username': data.username,
        'iat': data.iat || now,
        'exp': now + parseInt(process.env.DURATA_TOKEN!)
    }
    const token = jwt.sign(payload, jwtKey)
    console.log('Creato nuovo token:', token)
    return token
}