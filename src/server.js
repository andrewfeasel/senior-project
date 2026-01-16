'use strict';

const express = require("express");
const cookieParser = require("cookie-parser");
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

function cookieCheck(req, res) {
	const hasUsernameCookie = typeof req.cookies.username !== "undefined";
	if (!hasUsernameCookie)
		res.redirect(303, "/tos.html");
	return hasUsernameCookie;
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
server.use(express.urlencoded(config.express.urlencode));
server.use(cookieParser());

/* REQUEST HANDLING */
server.get("/chats", (req, res) => {
	if(!cookieCheck(req, res)) return;
	res.status(200);
	res.set("Content-Type", "text/html");
	res.send(chats.join(''));
});


server.post("/", (req, res) => {
	console.log("POST / hit");
	console.log("Content-Type:", req.headers['content-type']);
	console.log("req.body:", req.body);
	if(typeof req.body.username === "undefined") {
		res.redirect(400, "/tos.html");
		return;
	}

	res.status(201);
	res.cookie("username", req.body.username, {
		httpOnly: true,
		expires: new Date(Date.now() + (1000 * 60 * 60 * 24 * 400))
	});

	res.redirect(303, "/");
});

server.post("/chats", (req, res) => {
	if(!cookieCheck(req, res)) return;
	db_insert.run(req.socket.remoteAddress, req.cookies.username, req.body.message);
	try {
		const chat_html = Mustache.render(chat_template, {
			hash: createHash(req.socket.remoteAddress),
			username: req.cookies.username,
			message: req.body.message
		});
		chats.push(chat_html);
		res.redirect(303, "/");
	} catch(e) {
		console.error(e);
		res.sendStatus(418);
	}
});

const file_path = path.join(__dirname, config.app_path);
server.use(express.static(file_path));

server.listen(config.port, () => console.log(`server listening on port ${config.port}`));