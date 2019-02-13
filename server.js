const express = require('express');
const path = require('path');
const app = express();
const http = require('http').Server(app);

const io = require('socket.io')(http);

const session = require('express-session');

const knex = require('knex')({
  client: 'mysql',
  connection: {
    host : 'localhost',
    user : 'root',
    password : '',
    database : 'prjapp2'
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

  knex('projects_users').where({ project_id: projectId }).then(all => {

    all.forEach(one => {
      countUsers++
    })

    knex('projects').where({ id: projectId }).then((response) => {
      if(req.session.user){
        res.render('pages/app', {
          infos: response,
          count: countUsers
        });
      }
    	else{
        res.redirect('/connexion');
      }
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
        console.log(Object.values(ownProjects));
        res.render('pages/my-projects', {
          ownProjects: Object.values(ownProjects)
        });
    });


    /*
  	knex.from('projects').select('id', 'title', 'creation_date', 'visibility').where('author_id', userId).then(response => {
  		response.forEach(own => {
  			ownProjects.push(own);
        own.collabs = [];
  			knex.from('projects_users').select('user_id').where('project_id', own.id).then(response => {
  				response.forEach(collabId => {
  					knex.from('users').select('nickname').where('id', collabId.user_id).then(response => {
  						own.collabs.push(response)

  					});
  				});
  			});
  		});
      console.log(ownProjects)
  		res.render('pages/my-projects', {
  			ownProjects: ownProjects
  		});
  	});
    */

    /* knex.from('projects').select('id', 'title', 'creation_date', 'visibility').where('author_id', userId).then(response => {
		response.forEach(own => {
			ownProjects.push(own);
			knex.from('users').select('nickname').where('id', userId).then(response => {
				ownProjects.push(response);
				res.render('pages/my-projects', {
					ownProjects: ownProjects
				});
			});

		});
		knex.from('projects_users').select('project_id').where('user_id', userId).then(response => {
		response.forEach(project => {
			knex.from('projects').select('id', 'author_id', 'title', 'creation_date', 'visibility').where('id', project.project_id).then(responses => {
				responses.forEach(response => {
					othersProjects.push(response);
					knex.from('users').select('nickname').where('id', response.id).then(names => {
							names.forEach(name => {
								othersProjects.push(names);
							});
							console.log(othersProjects);

						});
					});
				});
			});
		});
    }) */


	/* knex.table('projects').innerJoin('users', 'users.id', '=', 'projects.author_id').where("users.id", userId).then((response) => {
        response.forEach(project => {
			ownProjects.push(project);
			console.log(project)
        });
		res.render('pages/my-projects', {
			ownProjects: ownProjects
		});
    }); */

	/* knex.table('projects').innerJoin('users', 'users.id', '=', 'projects.author_id').where("users.id", userId).then((response) => {
        response.forEach(project => {
			ownProjects.push(project);
        });
		res.render('pages/my-projects', {
			ownProjects: ownProjects
		});
    }); */

    /* knex.table('projects').innerJoin('projects_users', 'projects.id', '=', 'projects_users.project_id').where("projects_users.user_id", userId).then((response) => {
      response.forEach(project => {
        othersProjects.push(project);
      })

  	}); */
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
    console.log(response);
    res.redirect('/app/'+response);
  });
})

app.post('/delete/:id', function(req, res) {
  console.log('delete '+req.params.id)
  knex('projects').where({ id: req.params.id }).del().then(response => {
    res.redirect('/mes-projets')
  })
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

app.get('/canvas', function(req, res) {
  res.render('pages/canvas');
});

let canvasData = '';
let idCount = 0;

io.on('connection', (socket) => {
  console.log('Nouvelle connexion');

  io.emit('getConnectionCanvas', canvasData);

  socket.on('connectionCanvas', data => {
    canvasData = data.canvas;
    let project_id = data.id;
    let image = data.image;

    knex('projects').where({ id: project_id }).update({ render: canvasData, thumbnail: image }).then(response => {
      console.log(response);
    })

    io.emit('getConnectionCanvas', data.canvas);
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
