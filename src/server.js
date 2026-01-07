'use strict';

const express = require("express");
const Database = require("better-sqlite3");
const Mustache = require("mustache");
const path = require("node:path");
const fs = require("node:fs");

const config = require("./config.json");

function createHash(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  return hash;
}

/* SERVER INIT */
process.chdir("dist");

const chat_template = fs.readFileSync(config.template_path, "utf8");
Mustache.parse(chat_template);

const db = new Database(config.db_path);
db.pragma("journal_mode = WAL");
db.exec("CREATE TABLE IF NOT EXISTS chats (ip_addr VARCHAR(48) NOT NULL, username VARCHAR(16) NOT NULL, message TEXT)");

const db_insert = db.prepare("INSERT INTO chats (ip_addr, username, message) VALUES (?, ?, ?)");

const chats = [];
const server = express();

/* REQUEST HANDLING */
server.get("/chats", (req, res) => {
	res.status(200);
	res.set("Content-Type", "text/html");
	res.send(chats.join(''));
});


server.use(express.urlencoded(config.express.urlencode));
server.post("/chats", (req, res) => {
	db_insert.run(req.socket.remoteAddress, req.body.username, req.body.message);
	try {
		const chat_html = Mustache.render(chat_template, {
			hash: createHash(req.socket.remoteAddress),
			username: req.body.username,
			message: req.body.message
		});
		chats.push(chat_html);
		res.sendStatus(201);
	} catch(e) {
		console.error(e);
		res.sendStatus(418);
	}
});

const file_path = path.join(__dirname, config.app_path);
server.use(express.static(file_path));

server.listen(config.port, () => console.log(`server listening on port ${config.port}`));