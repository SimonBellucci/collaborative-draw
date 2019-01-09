const http = require('http');
const server = http.createServer();
const fs = require('fs');

const io = require('socket.io')(server);

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

server.on('request', (request, response) => {
  let url = request.url;

  if(url == '/'){
    fs.readFile('canvas.html', (error, contents) => {
      if(error){
        response.writeHead(500);
        response.end()
        return;
      }
      else{
        response.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        response.write(contents);
        response.end();
      }
    });
    return;
  }
  else if (url == '/js/fabric.min.js') {
    fs.readFile('./js/fabric.min.js', (error, contents) => {
      if(error){
        response.writeHead(500);
        response.end()
        return;
      }
      else{
        response.writeHead(200, {'Content-Type': 'application/javascript; charset=utf-8'});
        response.write(contents);
        response.end();
      }
    });
    return;
  }
});

server.listen(10001);
