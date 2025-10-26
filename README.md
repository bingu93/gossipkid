# Stimmt es, KI? - Nachrichtenquiz

Eine interaktive Webanwendung, die KI-generierte Falschmeldungen erstellt und Benutzer herausfordert, diese von echten Nachrichten zu unterscheiden.

## Sicherheitsfeatures

### 🔐 Passwortsicherung
- **Standardpasswort**: `g0ssipK1D!`
- Die Webseite ist durch eine Login-Seite geschützt
- Session-basierte Authentifizierung
- Automatische Weiterleitung bei fehlender Authentifizierung

### 🔒 API Key Schutz
- Der OpenAI API Key ist in einer separaten `config.env` Datei gespeichert
- Der API Key wird niemals im Frontend-Code angezeigt
- Alle OpenAI-API-Aufrufe laufen über sichere Server-Endpunkte
- Die `config.env` Datei ist in der `.gitignore` aufgeführt

## Installation

1. **Abhängigkeiten installieren:**
   ```bash
   npm install
   ```

2. **Konfiguration einrichten:**
   - Erstellen Sie eine `config.env` Datei im Hauptverzeichnis
   - Fügen Sie Ihren OpenAI API Key hinzu:
     ```
     OPENAI_API_KEY=ihr_api_key_hier
     ```

3. **Server starten:**
   ```bash
   npm start
   ```

4. **Webseite aufrufen:**
   - Öffnen Sie `http://localhost:3000/login.html`
   - Geben Sie das Passwort ein: `g0ssipK1D!`

## Dateistruktur

```
StimmtEsKI2/
├── login.html          # Login-Seite mit Passwortsicherung
├── index.html          # Hauptanwendung (nur nach Login zugänglich)
├── server.js           # Express-Server mit sicheren API-Endpunkten
├── config.env          # Umgebungsvariablen (API Key)
├── .gitignore          # Git-Ignore für sensible Dateien
├── package.json        # Projektabhängigkeiten
└── galery/             # Ordner für generierte Artikel
```

## Sicherheitsrichtlinien

### Für die Produktion:
1. **Passwort ändern**: Ändern Sie das Standardpasswort in der `login.html`
2. **HTTPS verwenden**: Stellen Sie sicher, dass die Webseite über HTTPS läuft
3. **Umgebungsvariablen**: Verwenden Sie echte Umgebungsvariablen statt `config.env`
4. **Rate Limiting**: Implementieren Sie Rate Limiting für API-Endpunkte
5. **Logging**: Aktivieren Sie Logging für Sicherheitsereignisse

### API Key Sicherheit:
- Der API Key ist nur auf dem Server verfügbar
- Frontend-Code kann den API Key nicht einsehen
- Alle API-Aufrufe laufen über den Server
- Der API Key wird nicht in Git-Commit-Historie gespeichert

## Funktionen

- **Quiz-Modus**: Vordefinierte Fragen über KI-generierte Falschmeldungen
- **Eigene Fragen**: Erstellen Sie eigene Fragen und lassen Sie KI-Erklärungen generieren
- **Artikel-Generator**: Erstellen Sie vollständige Fake-Artikel mit Bildern
- **Galerie**: Speichern und verwalten Sie generierte Artikel
- **Feed**: Chronologische Ansicht aller erstellten Artikel

## Technologie-Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Node.js, Express.js
- **AI-Integration**: OpenAI GPT-4, DALL-E 3
- **Sicherheit**: Session-basierte Authentifizierung, sichere API-Endpunkte

## Support

Bei Fragen oder Problemen wenden Sie sich an den Entwickler.

---

**Wichtig**: Diese Anwendung ist für Bildungszwecke gedacht. Verwenden Sie sie verantwortungsvoll und respektieren Sie die OpenAI-Nutzungsbedingungen. 