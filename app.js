const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const socketIO = require('socket.io');
const qrcode = require('qrcode');
const http = require('http');
const axios = require('axios');
const mime = require('mime-types');
const port = process.env.PORT || 8080;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use("/", express.static(__dirname + "/"))

// app.get('/', (req, res) => {
//   res.sendFile('index.html', {
//     root: __dirname
//   });
// });

const client = new Client({
  authStrategy: new LocalAuth({ clientId: 'client-one' }),
  puppeteer: { headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ] }
});
client.initialize();

io.on('connection', function(socket) {
  socket.emit('message', 'Server running...');

  client.on('qr', (qr) => {
      console.log('QR RECEIVED', qr);
      qrcode.toDataURL(qr, (err, url) => {
        socket.emit('qr', url);
        socket.emit('message', 'QRCode received, point the camera on your cell phone!');
      });
  });

  client.on('ready', () => {
      socket.emit('ready', 'Device is ready!');
      socket.emit('message', 'Device is ready!');
      socket.emit('qr', './check.svg')	
      console.log('Device is ready!');
  });

  client.on('authenticated', () => {
      socket.emit('authenticated', 'Server Authenticated!');
      socket.emit('message', 'Server Authenticated!');
      console.log('Server Authenticated!');
  });

  client.on('auth_failure', function() {
      socket.emit('message', 'Authentication failed, restarting...');
      console.error('Authentication failed.');
  });

  client.on('change_state', state => {
    console.log('Connection status: ', state );
  });

  client.on('disconnected', (reason) => {
    socket.emit('message', 'Client disconnected!');
    console.log('Client disconnected!', reason);
    client.initialize();
  });
});


server.listen(port, function() {
  console.log('App running on *: ' + port);
});