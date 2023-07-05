const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const { body, validationResult } = require('express-validator');
const socketIO = require('socket.io');
const qrcode = require('qrcode');
const http = require('http');
const axios = require('axios');
const mime = require('mime-types');
const port = process.env.PORT || 8080;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const Util = require('./util/Util');

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use("/", express.static(__dirname + "/"))


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

// Send message
app.post('/send-message', [
  body('number').notEmpty(),
  body('message').notEmpty(),
  ], async (req, res) => {
  const errors = validationResult(req).formatWith(({
    msg
  }) => {
    return msg;
  });

  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: false,
      message: errors.mapped()
    });
  }

  const number = Util.formatPhoneNumber(req.body.number);
  const message = req.body.message;
  
  client.sendMessage(number, message).then(response => {
    res.status(200).json({
      status: true,
      message: 'Message sent successfully.',
      response: response
    });
  }).catch(err => {
      res.status(500).json({
        status: false,
        message: 'Message not sent.',
        response: err.text
      });
    });  
});

// Get chats
app.get('/chats', (req, res) => {
  client.getChats().then(response => {
    res.status(200).json({
      status: true,
      message: 'Returning chats',
      response: response
    });
  }).catch(err => {
      res.status(500).json({
        status: false,
        message: 'Cant return chats.',
        response: err.text
      });
    });  
});

// Get group participants
app.get('/group-participants', (req, res) => {
  let groupId = req.query.groupId;
  
  if (groupId === "") {
    return res.status(422).json({
      status: false,
      message: 'GroupID should be informed.'
    });
  }
  
  client.getChatById(groupId).then(response => {
    res.status(200).json({
        status: true,
        message: 'Returning chats',
        response: response.groupMetadata.participants
      });
  }).catch(err => {
      res.status(500).json({
        status: false,
        message: 'Cant return chats.',
        response: err.text
      });
    });      
});


server.listen(port, function() {
  console.log('App running on *: ' + port);
});