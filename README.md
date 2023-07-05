# Whatsapp N8N Server
A small server to run in localhost that provides some endpoints to access Whatsapp API client.

It uses [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) library.

## Installation

Clone this repository: `git clone https://github.com/carvalhorafael/whatsapp-n8n-server.git`

Install dependencies: `npm install` 


## Run server

`npm start`


## Conect device

Open a web browser `http://localhost:8080` and scan the QRCode.


## Endpoints

### /send-message

Send a message to one contact.

- Method: POST

### /chats

Get all chats (groups included).

- Method: GET

### /group-participants

Get all participants in a chat group.

- Method: GET