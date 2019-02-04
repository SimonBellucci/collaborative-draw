const express = require('express');
const path = require('path');
const app = express();
const http = require('http').Server(app);

const io = require('socket.io')(http);

var knex = require('knex')({
  client: 'mysql',
  connection: {
    host : 'https://db.iha.unistra.fr',
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
        {
          name: ''
        });
// });

// créé le chemin vers les images
app.use(express.static('public'));


app.use('/mincss', express.static(__dirname + '/mincss'))
app.use('/minjs', express.static(__dirname + '/minjs'))

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/app', function(req, res) {
  res.sendFile(path.join(__dirname + '/app.html'));
});

app.get('/canvas', function(req, res) {
  res.sendFile(path.join(__dirname + '/canvas.html'));
});

app.get('/mes-projets', function(req, res) {
  res.sendFile(path.join(__dirname + '/my-projects.html'));
});

app.get('/connexion', function(req, res) {
  res.sendFile(path.join(__dirname + '/connexion.html'));
});

app.get('/inscription', function(req, res) {
  res.sendFile(path.join(__dirname + '/register.html'));
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
