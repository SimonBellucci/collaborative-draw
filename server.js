const express = require('express');
const path = require('path');
const app = express();
const http = require('http').Server(app);

const io = require('socket.io')(http);

var knex = require('knex')({
  client: 'mysql',
  connection: {
    host : 'base.iha.unistra.fr',
    user : 'prjapp2',
    password : 'YPQ7ygSJQ0zZeLV9',
    database : 'prjapp2'
  }
});

// set the view engine to ejs
app.set('view engine', 'ejs');

// use res.render to load up an ejs view file

// // index page
// app.get('/', function(req, res) {
//   res.render('pages/index');
// });

// // about page
// app.get('/about', function(req, res) {
//   res.render('pages/about',
// });

//Requests
//Récupérer le title d'un projet
let title = ""

// knex('projects').where({id: 1}).select('title').then((response)=>{
//   console.log(response);
//   title = response[0].title
// });

// créé le chemin vers les images
app.use(express.static('public'));

app.use('/mincss', express.static(__dirname + '/mincss'))
app.use('/minjs', express.static(__dirname + '/minjs'))

app.get('/', function(req, res) {
  res.render('pages/index');
});

app.get('/app', function(req, res) {
  res.render('pages/app');
});

app.get('/mes-projets', function(req, res) {
  let userId = 2;
  knex.table('projects').innerJoin('users', 'users.id', '=', 'projects.author_id').where("users.id", userId).then((response) => {
    res.render('pages/my-projects', {
      infos: response
    });
  });
});

app.get('/connexion', function(req, res) {
  res.render('pages/connexion');
});

app.get('/inscription', function(req, res) {
  res.render('pages/register');
});

app.get('/canvas', function(req, res) {
  res.render('pages/canvas');
});

// server.on('request', (request, response) => {
//   let url = request.url;

//   if(url == '/'){
//     fs.readFile('canvas.html', (error, contents) => {
//       if(error){
//         response.writeHead(500);
//         response.end()
//         return;
//       }
//       else{
//         response.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
//         response.write(contents);
//         response.end();
//       }
//     });
//     return;
//   }
//   else if (url == '/js/fabric.min.js') {
//     fs.readFile('./js/fabric.min.js', (error, contents) => {
//       if(error){
//         response.writeHead(500);
//         response.end()
//         return;
//       }
//       else{
//         response.writeHead(200, {'Content-Type': 'application/javascript; charset=utf-8'});
//         response.write(contents);
//         response.end();
//       }
//     });
//     return;
//   }
// });

let canvasData = '';
let idCount = 0;

io.on('connection', (socket) => {
  console.log('Nouvelle connexion');

  io.emit('getConnectionCanvas', canvasData);

  socket.on('connectionCanvas', data => {
    canvasData = data;
    io.emit('getConnectionCanvas', data);
  });

  socket.on('newCoords', data => {
    io.emit('getNewCoords', data);
  });

  socket.on('newScale', data => {
    io.emit('getNewScale', data);
  });

  socket.on('objectAdded', data => {
    idCount++
    io.emit('getNewObject', {type: data.type, color: data.color, id: idCount-1});
  });

  socket.on('pathAdded', () => {
    idCount++
  })

});

http.listen(10001);
