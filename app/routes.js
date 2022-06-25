module.exports = function(app, passport, db) {

      app.get('/', function(req, res) {
          res.render('index.ejs');
      });

      app.get('/profile', isLoggedIn, function(req, res) {
        let plants = [
          {plant: 'Roses', price: 10, src:'roses.jpeg'},
          {plant: 'Lilies', price: 11, src:'lilies.jpeg'},
          {plant: 'tulips', price: 12, src:'Tulips.jpeg'}
        ]
        console.log(plants, 'Testing plants');
        db.collection('flowerCart').find().toArray((err1,cart) => {
          console.log(cart, 'items saved to cart')
          db.collection('messages').find().toArray((err, result) => {
            if (err) return console.log(err)
            res.render('profile.ejs', {
              user : req.user,
              messages: result,
              plants: plants, 
              cart: cart
            })
          })
          })
      });

      app.get('/logout', function(req, res) {
          req.logout();
          res.redirect('/');
      });
 
      app.post('/messages', (req, res) => {
        db.collection('messages').insertOne({name: req.body.name, msg: req.body.msg, thumbUp: 0}, (err, result) => {
          if (err) return console.log(err)
          console.log('saved to database')
          res.redirect('/profile')
        })
      })
  
      app.post('/add2Cart', (req, res) => { 
        console.log(req.body)
        db.collection('flowerCart')
        .insertOne({plant: req.body.plant, price: req.body.price},
         (err, result) => {
          if (err) return res.send(err)
          res.send({})
        })
      })

      app.put('/messages', (req, res) => {
        db.collection('messages')
        .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
          $set: {
            thumbUp:req.body.thumbUp + 1
          }
        }, {
          sort: {_id: -1},
          upsert: true
        }, (err, result) => {
          if (err) return res.send(err)
          res.send(result)
        })
      })

      app.put('/thumbDown', (req, res) => {
        db.collection('messages')
        .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
          $set: {
            thumbUp:req.body.thumbUp - 1
          }
        }, {
          sort: {_id: -1},
          upsert: true
        }, (err, result) => {
          if (err) return res.send(err)
          res.send(result)
        })
      })

      app.delete('/messages', (req, res) => {
        db.collection('messages').findOneAndDelete({name: req.body.name, msg: req.body.msg}, (err, result) => {
          if (err) return res.send(500, err)
          res.send('Message deleted!')
        })
      })
  
      app.delete('/add2Cart', (req, res) => {
        db.collection('flowerCart').findOneAndDelete({plant: req.body.plant, price: req.body.price}, (err, result) => {
          if (err) return res.send(500, err)
          res.send('Message deleted!')
        })
      })

          app.get('/login', function(req, res) {
              res.render('login.ejs', { message: req.flash('loginMessage') });
          });
  

          app.post('/login', passport.authenticate('local-login', {
              successRedirect : '/profile', 
              failureRedirect : '/login', 
              failureFlash : true 
          }));
  
     
          app.get('/signup', function(req, res) {
              res.render('signup.ejs', { message: req.flash('signupMessage') });
          });
  
          app.post('/signup', passport.authenticate('local-signup', {
              successRedirect : '/profile', 
              failureRedirect : '/signup', 
              failureFlash : true 
          }));
  
 
      app.get('/unlink/local', isLoggedIn, function(req, res) {
          const user            = req.user;
          user.local.email    = undefined;
          user.local.password = undefined;
          user.save(function(err) {
              res.redirect('/profile');
          });
      });
  
  };
  
  
  function isLoggedIn(req, res, next) {
      if (req.isAuthenticated())
          return next();
  
      res.redirect('/');
  }
  