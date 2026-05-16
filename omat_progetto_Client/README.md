# OMAT_Progetto

## 🧭 Architettura del progetto e scelte progettuali

Questo progetto è stato progettato seguendo un approccio **user-centered** e **role-based**, con l’obiettivo di offrire un’esperienza chiara, efficiente e coerente per ogni tipologia di utente.

L’idea di base è che **utenti diversi hanno obiettivi diversi**, e quindi **non devono vedere le stesse funzionalità**.

---

## 👥 Tipologie di utenti

Il sistema distingue tre ruoli principali:

### 🏭 Azienda / Cliente

L’azienda utilizza la piattaforma esclusivamente per **prenotare lavorazioni meccaniche** e monitorarne lo stato.

**Obiettivi principali:**

* Inserire nuovi ordini
* Visualizzare ordini attivi e storico
* Gestire i propri dati aziendali

👉 Per questo motivo, all’utente azienda viene fornita una **Single Page Application (SPA)** dedicata, semplice e focalizzata solo sulle funzioni realmente utili.

---

### 🎓 Studente

Lo studente utilizza la piattaforma per **richiedere e gestire il PCTO**.

**Obiettivi principali:**

* Inviare richiesta di PCTO
* Monitorare lo stato della candidatura
* Consultare documenti e comunicazioni

👉 Anche in questo caso, lo studente accede a una **SPA dedicata**, completamente separata da quella aziendale, per evitare confusione e ridurre il carico cognitivo.

---

### 👨‍💼 Amministratore (OMAT)

L’amministratore ha una visione completa del sistema.

**Funzioni principali:**

* Gestione ordini
* Gestione richieste PCTO
* Controllo dello stato delle lavorazioni

---

## 🏗️ Struttura dell’applicazione

L’applicazione è divisa in due macro-aree:

### 🌐 Sito pubblico (multi-page)

Accessibile senza login, serve a:

* Presentare l’azienda
* Descrivere i servizi offerti
* Fornire contatti e informazioni generali

Questa parte ha una struttura **multi-page**, più adatta a comunicazione, chiarezza e SEO.

---

### 🔐 Area applicativa (SPA)

Dopo il login, l’utente viene reindirizzato all’area applicativa corretta in base al proprio ruolo.

```text
/app/azienda   → area clienti (ordini)
/app/studente  → area studenti (PCTO)
/app/admin     → area amministratore
```

Ogni area è una **SPA indipendente dal punto di vista dell’esperienza utente**, ma condivide la stessa base applicativa.

---

## 📐 Sidebar e navigazione

La sidebar è **contestuale al ruolo dell’utente**:

* mostra solo le sezioni pertinenti
* elimina funzionalità inutili
* migliora velocità e usabilità

Questo approccio permette di:

* ridurre errori
* semplificare l’interfaccia
* rendere il sistema più professionale e realistico

---

## 🎯 Motivazione della scelta progettuale

La scelta di separare l’esperienza in base al ruolo è motivata da:

* principi di **UX Design**
* best practice dei gestionali reali
* necessità di chiarezza e semplicità

Un’azienda non è interessata alle funzioni PCTO, così come uno studente non deve interagire con la gestione degli ordini.

👉 Ogni utente vede **solo ciò che gli serve**, quando gli serve.

---

## ✅ Conclusione

Questo approccio rende il progetto:

* più scalabile
* più comprensibile
* più vicino a un’applicazione reale utilizzata in ambito industriale

La separazione tra sito pubblico e area applicativa, unita a una navigazione basata sui ruoli, rappresenta una scelta progettuale consapevole e orientata all’esperienza utente.

---
---

## 🧩 Linguaggi e tecnologie utilizzate

Il progetto utilizza un insieme di tecnologie moderne ma essenziali, scelte con l’obiettivo di garantire **chiarezza, realismo e facilità di manutenzione**, evitando soluzioni eccessivamente complesse.

Ogni linguaggio è stato selezionato in base al ruolo specifico che ricopre all’interno dell’architettura dell’applicazione.

---

## 🌐 HTML (HyperText Markup Language)

HTML viene utilizzato per definire la **struttura semantica** dell’interfaccia.

**Ruolo nel progetto:**

* definizione delle pagine del sito pubblico
* struttura base dell’area applicativa
* organizzazione logica dei contenuti (sezioni, form, layout)

HTML permette di separare chiaramente la struttura dalla logica e dallo stile, rendendo il codice più leggibile e ordinato.

---

## 🎨 CSS (Cascading Style Sheets)

CSS è utilizzato per la **presentazione grafica** e l’esperienza visiva dell’applicazione.

**Ruolo nel progetto:**

* layout responsive (desktop, tablet, mobile)
* design della sidebar e dei componenti UI
* gestione del tema grafico e delle variabili di stile
* animazioni e transizioni leggere

L’uso di CSS moderno consente di creare un’interfaccia coerente, accessibile e adattabile a diversi dispositivi.

---

## ⚙️ JavaScript

JavaScript rappresenta il **cuore logico del frontend** e collega l’interfaccia al backend.

**Ruolo nel progetto:**

* gestione della Single Page Application (SPA)
* comunicazione con il backend tramite API REST
* gestione dell’autenticazione e del token di sessione
* caricamento dinamico dei contenuti in base al ruolo dell’utente
* controllo della navigazione e della sidebar contestuale

JavaScript consente di offrire un’esperienza fluida e interattiva senza ricaricare le pagine.

---

## 🧠 Node.js

Node.js viene utilizzato per lo sviluppo del **backend** dell’applicazione.

**Ruolo nel progetto:**

* gestione del server
* implementazione delle API REST
* logica di autenticazione
* validazione delle richieste

L’utilizzo di JavaScript anche lato server permette di mantenere coerenza tecnologica tra frontend e backend.

---

## 🚏 Express.js

Express è il framework utilizzato sopra Node.js per semplificare la gestione delle richieste HTTP.

**Ruolo nel progetto:**

* definizione degli endpoint API
* gestione delle rotte
* separazione della logica applicativa
* gestione delle risposte in formato JSON

Express consente di costruire un backend leggero ma realistico, simile a quello utilizzato in applicazioni professionali.

---

## 🗄️ Database (MongoDB / SQL)

Il database viene utilizzato per la **persistenza dei dati**.

**Ruolo nel progetto:**

* memorizzazione degli utenti
* gestione degli ordini
* gestione delle richieste PCTO
* salvataggio dello stato delle lavorazioni

La struttura dei dati è pensata per essere semplice ma estendibile.

---

## 🔐 Autenticazione (JWT)

Per la gestione dell’accesso viene utilizzato un sistema di autenticazione basato su token.

**Ruolo nel progetto:**

* identificazione dell’utente autenticato
* gestione del ruolo
* protezione delle API

Questo approccio è comunemente utilizzato nelle applicazioni web moderne.

---

## 🎯 Considerazioni finali

Le tecnologie utilizzate sono state scelte per:

* essere coerenti tra loro
* essere spiegabili e difendibili
* rispecchiare soluzioni reali adottate in ambito aziendale

L’obiettivo non è la quantità di strumenti, ma l’uso consapevole di quelli realmente necessari.

---