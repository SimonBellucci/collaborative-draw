const express = require('express');
const path = require('path');
const app = express();
const http = require('http').Server(app);

const io = require('socket.io')(http);

const session = require('express-session');

const knex = require('knex')({
  client: 'mysql',
  connection: {
    host : 'base.iha.unistra.fr',
    user : 'prjapp2',
    password : 'YPQ7ygSJQ0zZeLV9',
    database : 'prjapp2'
  },
  pool: { min: 0, max: 10 }
});

const crypto = require('crypto')

function sha1(data){
  return crypto.createHash("sha1").update(data).digest("hex");
}

//Bloquer l'acces au pages si pas de session
// app.use(function(req, res, next) {
//     if(!req.session) {
//         res.redirect('/connexion');
//     } else {
//         next();
//     }
// });

// set the view engine to ejs
app.set('view engine', 'ejs');

// créé le chemin vers les images
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/mincss', express.static(__dirname + '/mincss'))
app.use('/minjs', express.static(__dirname + '/minjs'))

app.get('/', function(req, res) {
  res.render('pages/index');
});

app.get('/galerie', function(req, res) {
  //JOINTURE A VOIR AVEC ISSLER POUR author_id = user_id
  knex('projects').where({ visibility: 1 }).then((response) => {
    res.render('pages/gallery', {
      infos: response
    });
  });
});

const useSession = app.use(session({
  key: 'user_id',
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { expires: 600000 },
}));

const sessionChecker = (req, res, next) => {
    if (req.session.user) {
        res.redirect('/mes-projets');
    } else {
        next();
    }
};

// app.use(function(req, res, next) {
//     console.log(req.session.authenticated)
//     if(!req.session) {
//         res.redirect('/connexion');
//     } else {
//         next();
//     }
// });

app.get('/app', function(req, res) {
  if(req.session.user){
    res.render('pages/app');
  }
	else{
    res.redirect('/connexion');
  }
});

app.get('/app/:id', function(req, res) {
  let projectId = req.params.id;

  knex('projects').where({ id: projectId }).then((response) => {
    if(req.session.user){
      res.render('pages/app', {
        infos: response
      });
    }
  	else{
      res.redirect('/connexion');
    }
  });

});

app.get('/deconnexion', function(req, res){
  req.session.user = null;
  res.redirect('/connexion');
});

app.get('/mes-projets', function(req, res) {

  let projects = [];
  // knex.table('projects').innerJoin('users', 'users.id', '=', 'projects.author_id').where("users.id", userId).then((response) => {
  //
  // });

  if(req.session.user){
    let userId = req.session.user[0].id;

    knex.table('projects').innerJoin('projects_users', 'projects.id', '=', 'projects_users.project_id').where("projects_users.user_id", userId).then((response) => {
      response.forEach(project => {
        projects.push(project);
      })
      knex.table('projects').innerJoin('users', 'users.id', '=', 'projects.author_id').where("users.id", userId).then((response) => {
        response.forEach(project => {
          projects.push(project);
        });
        // knex.table('users').innerJoin('projects_users', 'users.id', '=', 'projects_users.user_id').where("projects_users.project_id", 2).then((response) => {
        //   response.forEach(project => {
        //     projects.push(project);
        //   });
        // });
        console.log(projects);
        res.render('pages/my-projects', {
          infos: projects
        });
      });
  	});
  }else{
    res.redirect('/connexion');
  }
});

app.post('/mes-projets', function(req, res) {
  knex('projects').insert({
    author_id: req.session.user[0].id,
    title: req.body.name,
    width: req.body.width,
    height: req.body.height,
  }).then(response => {
    console.log(response);
    res.redirect('/app/'+response);
  });
})

app.get('/connexion', sessionChecker, function(req, res) {
  res.render('pages/connexion');
});

app.post('/connexion', sessionChecker, function (req, res, next) {
      //Vérification email
      knex('users').where({ email: req.body.email }).then( response => {
        if(response.length == 0){
          console.log('Email inconnu');
          res.redirect('/connexion');
        }
        else{
          console.log('Email connu');
          //Vérification correspondance user / password
          knex('users').where({ email: req.body.email, password: sha1(req.body.password) }).then( response => {
            if(response.length == 0){
              console.log('Mauvais MDP');
              res.redirect('/connexion');
            }
            else{
              console.log('Bon MDP');
              req.session.user = response;
              res.redirect('/mes-projets')
            }
          });
        }
      });

});

app.get('/inscription', function(req, res) {
  res.render('pages/register');
});

app.post('/inscription', function(req, res){
  //Vérification si l'utilisateur existe déjà : email + pseudo
  knex('users').where({ email: req.body.email }).then( response => {
    if(response.length == 0){
        console.log('Pas de mail correspondant')

        knex('users').where({ nickname: req.body.nickname }).then( response => {
          if(response.length == 0){
            console.log('Surnom non existant');

            //Insertion dans la base
            knex('users').insert({
              lastname: req.body.lastname,
              firstname: req.body.firstname,
              nickname: req.body.nickname,
              email: req.body.email,
              password: sha1(req.body.password)
            }).then(response => {
              res.redirect('/connexion')
            });
          }
          else{
            console.log('Surnom existant');
          }
        });
    }
    else{
      console.log('Un mail correspondant')
    }
  });
});

app.get('/canvas', function(req, res) {
  res.render('pages/canvas');
});

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
