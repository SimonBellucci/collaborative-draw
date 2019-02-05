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
  },
  pool: { min: 0, max: 10 }
});

let crypto = require('crypto'),
    shasum = crypto.createHash('sha1');

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
  let userId = 1;
  let projects = [];
  // knex.table('projects').innerJoin('users', 'users.id', '=', 'projects.author_id').where("users.id", userId).then((response) => {
  //
  // });
  knex.table('projects').innerJoin('projects_users', 'projects.id', '=', 'projects_users.project_id').where("projects_users.user_id", userId).then((response) => {
    response.forEach(project => {
      projects.push(project);
    })
    knex.table('projects').innerJoin('users', 'users.id', '=', 'projects.author_id').where("users.id", userId).then((response) => {
      response.forEach(project => {
        // knex.table('users').innerJoin('projects_users', 'users.id', '=', 'projects_users.user_id').where("projects_users.project_id", project.id).then((response) => {
        //   project.users = response
        // })
        projects.push(project);
      })
      console.log(projects);
      res.render('pages/my-projects', {
        infos: projects
      });
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

  //Inscription
  socket.on('registerUser', data => {

    //Hashage MDP
    shasum.update(data.password);

    //Vérification si l'utilisateur existe déjà : email + pseudo
    knex('users').where({ email: data.email }).then( response => {
      if(response.length == 0){
          console.log('Pas de mail correspondant')

          knex('users').where({ nickname: data.nickname }).then( response => {
            console.log(response);
            if(response.length == 0){
              console.log('Surnom non existant');

              //Insertion dans la base
              knex('users').insert({
                lastname: data.lastname,
                firstname: data.firstname,
                nickname: data.nickname,
                email: data.email,
                password: shasum.digest('hex')
              }).then(response => {
                console.log(response);
              });
            }
            else{
              console.log('Surnom existant');
              socket.emit('nickNameAlreadyExists');
            }
          });
      }
      else{
        console.log('Un mail correspondant')
        socket.emit('emailAlreadyExists');
      }
    });
  });

  //Connexion
  socket.on('connectionUser', data => {

    //Hashage MDP
    shasum.update(data.password);

    //Vérification email
    knex('users').where({ email: data.email }).then( response => {
      if(response.length == 0){
        console.log('Email inconnu');
        socket.emit('emailUnknown');
      }
      else{
        console.log('Email connu');
        //Vérification correspondance user / password
        knex('users').where({ email: data.email, password: shasum.digest('hex') }).then( response => {
          if(response.length == 0){
            console.log('Mauvais MDP');
            socket.emit('wrongPassword');
          }
          else{
            console.log('Bon MDP');
          }
        });
      }
    });

  });

});

http.listen(10001);
