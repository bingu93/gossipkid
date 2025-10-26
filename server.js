const express = require('express');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: './config.env' });
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('.'));
app.use('/images', express.static('images')); // Bilder-Ordner als statischer Ordner

// Galerie-Ordner
const GALLERY_DIR = './galery';
// Bilder-Ordner
const IMAGES_DIR = './images';

// Stelle sicher, dass der Galerie-Ordner existiert
async function ensureGalleryDir() {
    try {
        await fs.access(GALLERY_DIR);
    } catch {
        await fs.mkdir(GALLERY_DIR, { recursive: true });
    }
}

// Stelle sicher, dass der Bilder-Ordner existiert
async function ensureImagesDir() {
    try {
        await fs.access(IMAGES_DIR);
    } catch {
        await fs.mkdir(IMAGES_DIR, { recursive: true });
    }
}

// API: Galerie laden
app.get('/api/gallery', async (req, res) => {
    try {
        await ensureGalleryDir();
        const files = await fs.readdir(GALLERY_DIR);
        
        const galleryItems = [];
        for (const file of files) {
            if (file.endsWith('.html')) {
                try {
                    const content = await fs.readFile(path.join(GALLERY_DIR, file), 'utf8');
                    const titleMatch = content.match(/<h1[^>]*>(.*?)<\/h1>/);
                    const title = titleMatch ? titleMatch[1] : file;
                    
                    const stats = await fs.stat(path.join(GALLERY_DIR, file));
                    galleryItems.push({
                        filename: file,
                        title: title,
                        date: stats.mtime.toLocaleDateString('de-DE'),
                        size: stats.size
                    });
                } catch (err) {
                    console.error(`Fehler beim Lesen von ${file}:`, err);
                }
            }
        }
        
        // Sortiere nach Datum (neueste zuerst)
        galleryItems.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        res.json(galleryItems);
    } catch (error) {
        console.error('Fehler beim Laden der Galerie:', error);
        res.status(500).json({ error: 'Fehler beim Laden der Galerie' });
    }
});

// API: Artikel speichern
app.post('/api/save-article', async (req, res) => {
    try {
        await ensureGalleryDir();
        await ensureImagesDir();
        
        const { filename, content, title, date, imageUrl, imagePrompt } = req.body;
        const filePath = path.join(GALLERY_DIR, filename);
        
        // Speichere den HTML-Inhalt (der bereits das Bild enthält)
        await fs.writeFile(filePath, content, 'utf8');
        
        console.log(`Artikel gespeichert: ${filename}`);
        if (imageUrl) {
            console.log(`Bild eingebunden: ${imageUrl}`);
        }
        if (imagePrompt) {
            console.log(`Bildprompt: ${imagePrompt}`);
        }
        
        res.json({ success: true, filename, hasImage: !!imageUrl });
    } catch (error) {
        console.error('Fehler beim Speichern des Artikels:', error);
        res.status(500).json({ error: 'Fehler beim Speichern des Artikels' });
    }
});

// API: Bild von URL laden und lokal speichern
app.post('/api/save-image', async (req, res) => {
    try {
        await ensureImagesDir();
        
        const { imageUrl, filename } = req.body;
        
        if (!imageUrl || !filename) {
            return res.status(400).json({ error: 'imageUrl und filename sind erforderlich' });
        }
        
        // Lade das Bild von der URL
        const https = require('https');
        const http = require('http');
        
        const protocol = imageUrl.startsWith('https:') ? https : http;
        
        const imageResponse = await new Promise((resolve, reject) => {
            protocol.get(imageUrl, (response) => {
                if (response.statusCode !== 200) {
                    reject(new Error(`HTTP ${response.statusCode}`));
                    return;
                }
                
                const chunks = [];
                response.on('data', (chunk) => chunks.push(chunk));
                response.on('end', () => resolve(Buffer.concat(chunks)));
                response.on('error', reject);
            }).on('error', reject);
        });
        
        // Speichere das Bild lokal
        const imagePath = path.join(IMAGES_DIR, filename);
        await fs.writeFile(imagePath, imageResponse);
        
        console.log(`Bild gespeichert: ${filename}`);
        
        res.json({ 
            success: true, 
            localPath: `/images/${filename}`,
            filename: filename
        });
        
    } catch (error) {
        console.error('Fehler beim Speichern des Bildes:', error);
        res.status(500).json({ error: 'Fehler beim Speichern des Bildes' });
    }
});

// API: Artikel abrufen
app.get('/api/article/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(GALLERY_DIR, filename);
        
        const content = await fs.readFile(filePath, 'utf8');
        res.setHeader('Content-Type', 'text/html');
        res.send(content);
    } catch (error) {
        console.error('Fehler beim Abrufen des Artikels:', error);
        res.status(404).send('Artikel nicht gefunden');
    }
});

// Sichere OpenAI API-Endpunkte
app.post('/api/openai/chat', async (req, res) => {
    try {
        const { messages, max_tokens } = req.body;
        
        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({ error: 'OpenAI API Key nicht konfiguriert' });
        }
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages,
                max_tokens: max_tokens || 800
            })
        });
        
        const data = await response.json();
        res.json(data);
        
    } catch (error) {
        console.error('Fehler bei OpenAI API-Anfrage:', error);
        res.status(500).json({ error: 'Fehler bei der API-Anfrage' });
    }
});

app.post('/api/openai/image', async (req, res) => {
    try {
        const { prompt, size, quality, n } = req.body;
        
        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({ error: 'OpenAI API Key nicht konfiguriert' });
        }
        
        const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'dall-e-3',
                prompt,
                size: size || '1792x1024',
                quality: quality || 'standard',
                n: n || 1
            })
        });
        
        const data = await response.json();
        res.json(data);
        
    } catch (error) {
        console.error('Fehler bei OpenAI Image API-Anfrage:', error);
        res.status(500).json({ error: 'Fehler bei der Bildgenerierung' });
    }
});

// Starte Server
app.listen(PORT, async () => {
    try {
        // Stelle sicher, dass alle erforderlichen Ordner existieren
        await ensureGalleryDir();
        await ensureImagesDir();
        
        console.log(`Server läuft auf http://localhost:${PORT}`);
        console.log(`Galerie-Ordner: ${path.resolve(GALLERY_DIR)}`);
        console.log(`Bilder-Ordner: ${path.resolve(IMAGES_DIR)}`);
    } catch (error) {
        console.error('Fehler beim Erstellen der Ordner:', error);
    }
}); 