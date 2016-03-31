const fs = require('fs');
const path = require('path');
const http = require('http');
//////////////////////////////////////////////INITALISATION SERVEUR EXPRESS/////////////////////////////////////////////////////////////////////////
var httpServer = http.createServer();
var avertissement;
var express = require('express');
var app = express();
var bodyParser = require ('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var MongoClient = require('mongodb').MongoClient;
var mongo = require('mongodb');
var server = require('http').Server(app);
var io = require('socket.io')(server);


app.set('view engine', 'html');
app.set('views', 'public');
app.use(express.static(__dirname + '/'));


app.use(bodyParser.urlencoded({extended: false}));
	app.use(cookieParser());
	app.use(session({
		secret:'123456789SECRET',
		saveUninitialized : false,
		resave: false
	}));

app.get('', function(req,res){
	res.sendFile(__dirname + '/jeuMulti.html');
});

app.post('/afficheScore', function(req,res){
		tableauDesScores.length = 0;
		var collection = maDb.collection('utilisateurs');
		collection.find({}, {_id:0,username:1, Victoire:1, Defaite:1, partieJoue:1}).toArray(function(err, data){
			data.forEach(
				function(cetUtilisateur){
					if(tableauDesScores.indexOf(cetUtilisateur) > -1){
						
					}else {
					tableauDesScores.push(cetUtilisateur)
					
					}
				}
			)
			res.send({dataScore : tableauDesScores});
		});
	});


const socketIo = require('socket.io');

var IOServer = socketIo(httpServer);

var scopes = {},pseudoUser,apparitionBallon, ballons = {},winnner,pseudoAdv, i = 0,tab = ["img/blue.png", "img/yellow.png","img/green.jpg","img/red.png" ], tabUsername = [],maDb, tableauDesScores = [];
function getRandomArbitrary(min, max) {
	return Math.random() * (max - min) + min;
};

io.on('connection', function(socket){	

	app.post('/sub', function(req,res){
		 pseudoUser = req.body.usernameSub; //Récupération de la valeur du champs texte
		var collection = maDb.collection('utilisateurs');
		collection.find({username:pseudoUser}, {_id:0}).toArray(function(err, data){ 
			if(data == ''){ //Compte n'existe pas.
				avertissement = 'Votre compte à correctement été crée ' + pseudoUser;
				collection.insertOne({username : pseudoUser, password:req.body.passwordSub, identifiant:socket.id, victoire: +0, defaite: +0, partieJoue: +0});
				res.send({indication : avertissement});//Renvoie du message côté client dans ce cas
				
			}else{//Compte existe.
				avertissement = 'Le compte existe déjà, veuillez en choisir un autre :';	
				res.send({indication : avertissement});//Renvoie du message côté client dans ce cas
			}
		});
	});

	app.post('/connect', function(req,res){
		 pseudoUser = req.body.usernameLog; //Récupération de la valeur du champs texte
		var collection = maDb.collection('utilisateurs');
		collection.find({username:pseudoUser, password:req.body.passwordLog}, {_id:0}).toArray(function(err, data){
			if(data == ''){ //Compte n'existe pas.
				avertissement = 'Aucun compte trouvée à ce nom.';
				res.send({indication : avertissement}); //Renvoie du message côté client dans ce cas
			}else{
				avertissement = 'Bonjour, '+ pseudoUser;	
				res.send({indication : avertissement}); //Renvoie du message côté client dans ce cas "Bonjour, +pseudo+"
			}
		});
	});

	socket.on('efface', function(data){
		socket.emit('effaceBien', {encoreRien : 'ok'});
	});

	socket.on('souscription', function(data){
		socket.broadcast.emit('afficheEnnemieSub', data);
	});

	socket.on('login', function(data){
		socket.broadcast.emit('afficheEnnemieLog', data);
	});

	socket.on('pseudoAdverse', function(data){
		pseudoAdv = data;
	});

	var play = function () {

		var scope = {
			top:'20px',
			left:'0px',
			id:socket.id,
			width:'50px',
			height:'50px',
			position:'absolute'
		};


		
		scopes[scope.id] = scope;
		socket.emit('creerMonViseur', scope);
		socket.broadcast.emit('creerSonViseur', scope);
		socket.emit('creerLesAutresViseurs', scopes);
		
		socket.on('changementPositionDeMonViseur', function(data){
			if(scopes[data.id]){
				scopes[data.id].top = data.top;
				scopes[data.id].left = data.left;
			}
			socket.broadcast.emit('changementPositionDeSonViseur', data);
		});


		var randomsrc = getRandomArbitrary(0, 4);
		var positionYrandom = getRandomArbitrary(0, 600);
		var positionXrandom = getRandomArbitrary(0, 1200);
		var source = Math.floor(randomsrc);
		var ballon = {
			id:'toRemove',
			position:'absolute',
			height:'150px',
			width:'150px',
			top: positionYrandom +'px',
			left:positionXrandom +'px',
			backgroundImage: tab[source]
		};

		ballons[ballon.id] = ballon;
		io.emit('apparitionMesBallons', ballons);
		io.emit('positionMesBallons', ballons);
		io.emit('collisionBallons', ballons);

		socket.on('disparitionBallons', function(message) {
			io.emit('bugBallon', "message");
		    for(index in ballons){
		    	socket.broadcast.emit('disparitionAllBallons', message);
		    		apparitionBallon = setTimeout(function(){
		    		var randomsrc = getRandomArbitrary(0, 4);
					var positionYrandom = getRandomArbitrary(0, 500);
					var positionXrandom = getRandomArbitrary(0, 1000);
					var source = Math.floor(randomsrc);
					var ballon = {
						id:'Object',
						position:'absolute',
						height:'150px',
						width:'150px',
						top: positionYrandom +'px',
						left:positionXrandom +'px',
						backgroundImage: tab[source]
					};
					ballons[ballon.id] = ballon;
		    		io.emit('apparitionMesBallons', ballons);
					io.emit('positionMesBallons', ballons);
					io.emit('collisionBallons', ballons);
				}, 2000);
		    }
		});	
    }; 

   	socket.on('ready', function(data){ //Reçoit la requête "ready"
		tabUsername.push(data); //Insere le pseudo de l'utilisateur dans le tableau "tabUsername"
		if(tabUsername.length == 2){ // Quand le tableau atteint deux entrées : effectue la fonction play() qui démarre le jeu
			io.emit("startGame", data);
		}
	});

	socket.on('verification', function(data){
		if(tabUsername.length > 2){
			socket.emit('verificationDone');
		}
	});

	socket.on('detectionParPersonne', function(data){
		socket.broadcast.emit("cleanDetection", {data});
	});
	socket.on('requeteParPersonne', function(data){
		socket.broadcast.emit("cleanRequete", {data});
	});

	socket.on('launchGame', function(data){
		play();
	});

	socket.on('endGame', function(data){
		clearInterval(apparitionBallon);
		var foe = data.ratio.perdant;
		var ally = data.ratio.gagnant;
		var collection = maDb.collection('utilisateurs');
		collection.find({username:ally}).toArray(function(err,data){
			if(err){
				console.log('Imposssible d\'insérer dans la base de données');
			}else{
				collection.find({username:data.ally}, {Victoire:1, _id:0}).toArray(function(err, data){
					collection.updateOne({username:ally},{$inc:{"Victoire": +1,"partieJoue": +1, "Defaite": +0}});
				});
			}
		});
		collection.find({username:foe}).toArray(function(err,data){
			if(err){
				console.log('Imposssible d\'insérer dans la base de données');
			}else{
				collection.find({username:foe}, {Defaite:1, _id:0}).toArray(function(err, data){
					collection.updateOne({username:foe},{$inc:{"Defaite": +1,"partieJoue": +1,"Victoire": +0}});
				});

			}
		});
			io.emit('stopGame', data.ratio.gagnant);
	});
});



setInterval(function(){
    for(index in scopes){
    	if(!io.sockets.connected[scopes[index].id]){ // Si il y'a déconnexion d'un viseur, supprime son entrée du tableau tabUsername.
    		tabUsername.splice(scopes[index]);
        	io.emit('detruireViseur', scopes[index]);
        	delete scopes[index];
    	};
 	};
}, 1000);



var MongoClient = require('mongodb').MongoClient;
// var url ="mongodb://localhost:27017/multi";
var url ="mongodb://utilisateurs:okamiden@ds023458.mlab.com:23458/heroku_733gnm6p";
MongoClient.connect(url, function(err, db){
	maDb = db;
	if(err){
		console.log('Impossible de charger la base de données');
	}else {	
		// server.listen(1010);
		server.listen(process.env.PORT || 3000, function(){
		  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
		});
	}
});




