const express = require("express");
const sql = require("sqlite3").verbose();
const path = require("node:path");
const http = require("node:http");

const config = require("./config.json");

const db = new sql.Database(config.db_path, (error) => {
	if (error) throw error;
	console.log("sqlite3 connect ok");
});

db.run("CREATE TABLE IF NOT EXISTS chats (ip_addr VARCHAR(64) NOT NULL, message TEXT)");

const chats = [];
const server = express();

server.get("/chats", (req, res) => {
	res.json(chats);
	res.end();
});

server.use(express.json(config.express_json_settings));
server.post("/chats", (req, res) => {
	db.run("INSERT INTO chats(ip_addr, message) VALUES (?, ?)", [req.socket.remoteAddress, req.body], (error) => {
		if (error) console.error(error);
	});
	chats.push(req.body);
	if (chats.length > config.chat_limit)
		chats.unshift();
});

const file_path = path.join(__dirname, config.app_path);
server.use(express.static(file_path));

server.listen(config.port, () => console.log(`server listening; port ${config.port}`));