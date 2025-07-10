const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

exports.handler = async function(event, context) {
  try {
    // Percorso statico della cartella upload sul filesystem della build
    const uploadsDir = path.resolve(__dirname, '../../static/uploads');
    const fixedFilename = 'volantino.pdf';
    const fixedFilePath = path.join(uploadsDir, fixedFilename);

    // Leggi i file PDF presenti in uploads
    const files = fs.readdirSync(uploadsDir).filter(f => f.endsWith('.pdf'));

    // Se non ci sono PDF, niente da fare
    if (files.length === 0) {
      return { statusCode: 200, body: 'Nessun file PDF trovato in uploads' };
    }

    // Trova il file PDF più recente che NON sia già 'volantino.pdf'
    const candidateFiles = files.filter(f => f !== fixedFilename);

    if (candidateFiles.length === 0) {
      return { statusCode: 200, body: 'Nessun nuovo PDF da rinominare' };
    }

    // Prendi il primo (potresti migliorare selezionando per data)
    const newFile = candidateFiles[0];
    const newFilePath = path.join(uploadsDir, newFile);

    // Copia/rinomina il file come volantino.pdf (sovrascrive se esiste)
    fs.copyFileSync(newFilePath, fixedFilePath);

    // Commit e push dei cambi (serve che la function abbia accesso a git)
    execSync(`git config --global user.email "netlify-bot@example.com"`);
    execSync(`git config --global user.name "Netlify Bot"`);

    execSync(`git add static/uploads/${fixedFilename}`);
    execSync(`git commit -m "Aggiornato volantino.pdf automaticamente"`);
    execSync(`git push origin main`);

    return {
      statusCode: 200,
      body: `File ${newFile} copiato come ${fixedFilename} e committato.`,
    };
  } catch (error) {
    return { statusCode: 500, body: `Errore: ${error.message}` };
  }
};
