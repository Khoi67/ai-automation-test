const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5688;
const TRIGGER_FILE = path.resolve(__dirname, '../../scratch/trigger.txt');

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/trigger') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        let ticket = '';
        try {
          const parsed = JSON.parse(body);
          ticket = parsed.ticket || '';
        } catch (e) {
          ticket = body;
        }
        
        // Clean ticket name (extract SCRUM-xxx or any KEY-123)
        const match = ticket.match(/[A-Za-z0-9]+-\d+/);
        const ticketKey = match ? match[0].toUpperCase() : ticket.trim();

        if (ticketKey) {
          fs.writeFileSync(TRIGGER_FILE, ticketKey, 'utf8');
          console.log(`[TRIGGER SERVER] Received ticket: ${ticketKey}. Written to trigger.txt`);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, ticket: ticketKey }));
        } else {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'No ticket provided' }));
        }
      } catch (err) {
        console.error('[TRIGGER SERVER ERROR]', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[TRIGGER SERVER] Listening on http://127.0.0.1:${PORT}`);
});
