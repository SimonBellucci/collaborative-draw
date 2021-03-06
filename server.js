const express = require('express');
const path = require('path');
const app = express();
const http = require('http').Server(app);

const io = require('socket.io')(http);

const session = require('express-session');

const config = require('./config/config.js');

const knex = require('knex')({
  client: 'mysql',
  connection: {
    host : config.host,
    user : config.user,
    password : config.password,
    database : config.database
  },
  pool: { min: 0, max: 10 },
  charset   : 'UTF8_GENERAL_CI'
});

const crypto = require('crypto')

function sha1(data){
  return crypto.createHash("sha1").update(data).digest("hex");
}

// set the view engine to ejs
app.set('view engine', 'ejs');

// créé le chemin vers les images
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/vendors', express.static(__dirname + '/node_modules'));
app.use('/mincss', express.static(__dirname + '/mincss'))
app.use('/minjs', express.static(__dirname + '/minjs'))

app.get('/', function(req, res) {
  res.render('pages/index');
});

const useSession = app.use(session({
  key: 'user_id',
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { expires: 3600000 },
}));

const sessionChecker = (req, res, next) => {
    if (req.session.user) {
        res.redirect('/mes-projets');
    } else {
        next();
    }
};

app.get('/galerie', function(req, res) {
    knex.table('projects').innerJoin('users', 'users.id', '=', 'projects.author_id').select('title', 'visibility', 'thumbnail', 'nickname').where('projects.visibility', 1).then(response => {
      if(req.session.user){
        res.render('pages/gallery', {
            ownProjects: response.reverse(),
            user: req.session.user[0].id,
        });
      }
      else{
        res.render('pages/gallery', {
            ownProjects: response.reverse(),
            user: req.session.user
        });
      }
    });

});

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
  let countUsers = 0;
  let isInProject = false;

  if(req.session.user) {
      knex('projects_users').where({user_id: req.session.user[0].id, project_id: projectId}).then(collaboratorCheck => {
          if (collaboratorCheck.length === 0) {
              knex('projects').where({author_id: req.session.user[0].id, id: projectId}).then(authorCheck => {
                  if (authorCheck.length === 0) {
                      return isInProject = false
                  }
                  else {
                      return isInProject = true
                  }
              })
          }
          else {
              return isInProject = true
          }
      }).catch(error => {
      });
  }else{
      res.redirect('/connexion');
  }

  knex('projects_users').where({ project_id: projectId }).then(all => {

    all.forEach(one => {
      countUsers++
    })

    knex('users').where({ id: req.session.user[0].id }).then(user => {

      knex('projects').where({ id: projectId }).then((response) => {
        if(req.session.user && isInProject){
          res.render('pages/app', {
            infos: response,
            count: countUsers,
            username: user[0].nickname,
            user: user[0].id
          });
        }
      	else if(!req.session.user){
          res.redirect('/connexion');
        }
        else if(!isInProject){
          res.redirect('/mes-projets');
        }
      });

    });
  })


});

app.get('/deconnexion', function(req, res){
  req.session.user = null;
  res.redirect('/connexion');
});

app.get('/mes-projets', function(req, res) {

  let ownProjects = {};

  if(req.session.user){
    let userId = req.session.user[0].id;
    knex.from('projects').select('id', 'title', 'creation_date', 'visibility', 'thumbnail').where('author_id', userId).then(rows => {
      let projects_ids = [];
      rows.forEach( row => {
        ownProjects['project'+row.id] = row;
        row.collabs = [];
        projects_ids.push(row.id);
      });
      return projects_ids;
    }).then(ids => {
      return knex.table('projects_users').innerJoin('users', 'users.id', '=', 'projects_users.user_id').select('project_id','nickname').where('project_id', 'in', ids);
    }).then(collabs => {
        collabs.forEach(collab => {
          ownProjects['project'+collab.project_id].collabs.push(collab.nickname);
        });
        res.render('pages/my-projects', {
          ownProjects: (Object.values(ownProjects)).reverse(),
          user: userId
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
    creation_date: new Date().toISOString().slice(0, 19).replace('T', ' ')
  }).then(response => {
    res.redirect('/app/'+response);
  });
})

app.post('/delete/:id', function(req, res) {
  knex('projects').where({ id: req.params.id }).del().then(response => {
    res.redirect('/mes-projets')
  })
})

app.get('/mes-collaborations', function(req, res) {

  if(req.session.user){
    let userId = req.session.user[0].id;

    knex.select('projects.*', 'users.nickname as author').from('projects').innerJoin('projects_users', 'projects.id', '=', 'projects_users.project_id').innerJoin('users', 'projects.author_id', '=', 'users.id').where('projects_users.user_id', userId).then(rows => {
      res.render('pages/my-collabs', {
            othersProjects: rows.reverse(),
            user: userId
        });
    });
  }else{
    res.redirect('/connexion');
  }
});

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

app.post('/add-user/:id', function(req, res) {
  let mail = req.body.email;
  let project = req.params.id;

  knex('users').where({ email: mail }).then( response => {
    if(response.length == 0){
        console.log('Pas de mail correspondant')
    }
    else{
      knex('projects_users').insert({
        user_id: response[0].id,
        project_id: project,
      }).then(response => {
        res.redirect('/app/'+project)
      });
    }
  });

});

app.post('/visible/:id', (req, res) => {
    let project = req.params.id;
    let visibility = req.body.visibility;
    if(visibility == 'private'){
        knex('projects').where('id', project).update('visibility', 0).then(response => {
            res.redirect('/mes-projets');
        });
    }
    else if(visibility == 'public'){
        knex('projects').where('id', project).update('visibility', 1).then(response => {
            res.redirect('/mes-projets');
        });
    }
})

app.get('/canvas', function(req, res) {
  res.render('pages/canvas');
});

let canvasData = '';

io.on('connection', (socket) => {

  socket.on('room', function(room) {

      socket.join(room.room);

      let connectedUsers = io.sockets.adapter.rooms[room.room].length;
      socket.broadcast.to(room.room).emit('newUser', room.user+' a rejoint la salle');
      io.sockets.in(room.room).emit('numberConnected', connectedUsers);
  });

  /*******
  * Chat
  *******/
  socket.on('chatMsg', data => {
    io.sockets.in(data.room).emit('newChatMsg', {message: data.message, username: data.username});
  })

  socket.on('chatTyping', data => {
    socket.broadcast.to(data.room).emit('typingStatus', {user: data.username, status: data.isTyping});
  })

  socket.on('leavingRoom', data => {
    socket.broadcast.to(data.room).emit('userLeft', {count: data.count-1, message: data.user+' a quitté la salle'});
  })

  /*******
  * Notification collabs
  *******/
  socket.on('newCollab', data => {
    knex('users').where({ email: data.receiver }).then(response => {
      io.emit('getCollabNotif', {sender: data.sender, receiver: response[0].id, project: data.project});
    })
  });

  io.emit('getConnectionCanvas', canvasData);

  socket.on('connectionCanvas', data => {
    canvasData = data.canvas;
    let project_id = data.id;
    let image = data.image;

    socket.project_id = project_id;
    //io.sockets pour récupérer tous les sockets

    knex('projects').where({ id: project_id }).update({ render: canvasData, thumbnail: image }).then(response => {
      // console.log(response);
    })

    io.emit('getConnectionCanvas', data.canvas);
  });

  socket.on('newCoords', data => {
    io.sockets.in(data.room).emit('getNewCoords', data);
  });

  socket.on('newScale', data => {
    io.sockets.in(data.room).emit('getNewScale', data);
  });

  socket.on('newRotation', data => {
    io.sockets.in(data.room).emit('getNewRotation', data);
  });

  socket.on('newColor', data => {
    io.sockets.in(data.room).emit('getNewColor', data);
  });

  socket.on('newNoneColor', data => {
    io.sockets.in(data.room).emit('getNewNoneColor', data);
  });

  socket.on('newBorderColor', data => {
    io.sockets.in(data.room).emit('getNewBorderColor', data);
  });

  socket.on('newBorderWidth', data => {
    io.sockets.in(data.room).emit('getNewBorderWidth', data);
  });

  socket.on('newFont', data => {
    io.sockets.in(data.room).emit('getNewFont', data);
  })

  socket.on('newFilter', data => {
    io.sockets.in(data.room).emit('getNewFilter', {id: data.id, filter: data.filter});
  });

  socket.on('newText', data => {
    io.sockets.in(data.room).emit('getNewText', {text: data.text, id: data.id});
  });

  socket.on('deleted', data => {
    io.sockets.in(data.room).emit('getDeleted', {id: data.id});
  })

  socket.on('layer', data => {
    io.sockets.in(data.room).emit('getLayer', {type: data.type, object: data.object});
  })

  socket.on('objectAdded', data => {
    let room = data.room;

    knex('projects').where('id', room).update({items: knex.raw('items + 1')}).then(response => {
      knex('projects').select('items').where({ id: room }).then(response => {
        io.sockets.in(room).emit('getNewObject', {type: data.type, color: data.color, id: response[0].items - 1, file: data.file, url: data.url, path: data.path, pathWidth: data.pathWidth, pathColor: data.pathColor});
      });
    });

  });

});

http.listen(10001);
