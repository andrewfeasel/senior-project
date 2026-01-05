'use strict';
const express = require("express");
const sql = require("sqlite3").verbose();
const path = require("node:path");

/* uses djb2 */
function createHash(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  return hash;
}

const config = require("./config.json");

const db = new sql.Database(config.db_path, (error) => {
	if (error) throw error;
	console.log("sqlite3 connect ok");
});

db.run("CREATE TABLE IF NOT EXISTS chats (ip_addr VARCHAR(48) NOT NULL, username VARCHAR(16) NOT NULL, message TEXT)");

const chats = [];
const server = express();

server.get("/chats", (req, res) => {
	res.status(200);
	res.set("Content-Type", "application/json");
	res.json(chats);
});


server.use(express.json(config.express.json));
server.post("/chats", (req, res) => {
	db.run("INSERT INTO chats(ip_addr, username, message) VALUES (?, ?, ?)",
	[req.socket.remoteAddress, req.body.username, req.body.message], (error) => {
		if (error) console.error(error);
		const recv_message = {
			message: req.body.message,
			username: req.body.username,
			hash: createHash(req.socket.remoteAddress)
		};
		chats.push(recv_message);
		if (chats.length > config.chat_limit) {
			chats.shift();
		}
		res.sendStatus(201);
	});
});

const file_path = path.join(__dirname, config.app_path);
server.use(express.static(file_path));

server.listen(config.port, () => console.log(`server listening on port ${config.port}`));