#!/usr/bin/node

const http = require("http");
const node_static = require("node-static");

const mongo = require("mongodb").MongoClient;

let server_url = "mongodb://localhost:27017";

let chat_db;

mongo.connect(server_url, (err, server) => {
	if (err){
		console.log("Error en la conexión a MongoDB");
		throw err;
	}

	console.log("Dentro de MongoDB");

	chat_db = server.db("amongmeme");
});



console.log("Inicializando servidor chat");


let public_files = new node_static.Server("pub");

//if del chat
http.createServer( (request, response) => {
	if (request.url == "/chat"){
		let cursor = chat_db.collection("chat").find({});

		cursor.toArray().then( (data) => {
			response.writeHead(200, {'Content-Type': 'text/plain'});

			response.write( JSON.stringify(data) );

			response.end();
		});

		return;
	}
//if del recent
	if (request.url == "/recent"){
		const estimated_count = chat_db.collection("chat").estimatedDocumentCount();

			estimated_count.then( (count) => {
				console.log(count);

			const MAX = 5;

			let cursor = chat_db.collection("chat").find({}, {
				skip: NUM - MAX,
				limit:5,
				sort: { $natural:1 }
			});

			cursor.toArray().then( (data) => {
				response.writeHead(200, {'Content-Type': 'text/plain'});

				response.write( JSON.stringify(data) );

				response.end();
			});
		});

		return;
	}

//if del submit
	if (request.url == "/submit"){
		console.log("Envío de datos");

		let body = [];
		request.on('data', (chunk) => {

			body.push(chunk);

		}).on('end', () => {
			
			let chat_data = JSON.parse(Buffer.concat(body).toString());
		
			chat_db.collection("chat").insertOne({
				user: chat_data.chat_user,
				msg: chat_data.chat_msg,
				date: Date.now()
			});
			 

		});

	

		response.end();

		return;
	
	}





	public_files.serve(request, response);

}).listen(6891);
