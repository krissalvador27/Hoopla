// app/routes.js
var validator = require('validator');
var nodemailer = require('nodemailer');
var User       = require('../app/models/user');

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'hoopla.app@gmail.com',
        pass: 'whatisallthishoopla'
    }
});

 var timeSince = function(date) {
    if (typeof date !== 'object') {
        date = new Date(date);
    }

    var seconds = Math.floor((new Date() - date) / 1000);
    var intervalType;

    var interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
        intervalType = 'year';
    } else {
        interval = Math.floor(seconds / 2592000);
        if (interval >= 1) {
            intervalType = 'month';
        } else {
            interval = Math.floor(seconds / 86400);
            if (interval >= 1) {
                intervalType = 'day';
            } else {
                interval = Math.floor(seconds / 3600);
                if (interval >= 1) {
                    intervalType = "hour";
                } else {
                    interval = Math.floor(seconds / 60);
                    if (interval >= 1) {
                        intervalType = "minute";
                    } else {
                        interval = seconds;
                        intervalType = "second";
                    }
                }
            }
        }
    }

    if (interval > 1 || interval === 0) {
        intervalType += 's';
    }

    return interval + ' ' + intervalType;
};


module.exports = function(app, passport, db, mongoose) {
  var hoop_model = require('./models/hoop.js');
  var domain_model = require('./models/domain.js');
	var Schema = mongoose.Schema;
	var post_schema = new Schema({
		content: String
	});
	var post = mongoose.model('post', post_schema);

  // =====================================
  // HOME PAGE (with login links) ========
  // =====================================
  app.get('/', function(req, res) {
      var previous      = req.session.value || 0;
      req.session.value = previous + 1;
      if(req.isAuthenticated()) {
        res.redirect('/home');
      }
      else{
      //res.send('<h1>Previous value: ' + previous + '</h1>')
        res.render('index.ejs'); // load the index.ejs file
      }
  });

  // =====================================
  // LOGIN ===============================
  // =====================================
  // show the login form
  app.get('/login', function(req, res) {
    // render the page and pass in any flash data if it exists
    res.render('login.ejs', { message: req.flash('loginMessage'), success: req.flash('success') }); 
  });

  // process the login form
  // app.post('/login', do all our passport stuff here);

  // =====================================
  // SIGNUP ==============================
  // =====================================
  // show the signup form
  app.get('/signup', function(req, res) {

    // render the page and pass in any flash data if it exists
    res.render('signup.ejs', { message: req.flash('signupMessage') });
  });

  // process the signup form
  // app.post('/signup', do all our passport stuff here);
    // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/signup', // redirect to the home
    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));

  // =====================================
  // HOME SECTION ========================
  // =====================================
  // we will want this protected so you have to be logged in to visit
  // we will use route middleware to verify this (the isLoggedIn fƒprevunction)
   app.get('/home', isLoggedIn, function(req, res) {
  req.session.hoopStart = 0;
  req.session.hoopEnd = 19;
  var res1 = res;
     var domain_name = req.user.local.domain;
     req.session.hoopArray = [];
     req.session.user_id = req.user._id;
  console.log("hoopstart: " + req.session.hoopStart);
     var domain = domain_model.findOne({'domain_name': domain_name}, function(err, res) {
       hoop_model.find({'parent_id': res._id}, function(err, res) {
         if (err) {
           res.send(500);
         }
         for (var i=0; i<res.length; i++) {
           if (typeof res[i] !== 'undefined') {
             res[i].timestamp = timeSince(res[i].timestamp);
             req.session.hoopArray.push(res[i]);
           } 
         }
  res1.render('home.ejs', {
  arr: req.session.hoopArray, domain: domain_name, id: req.user._id, hoopStart: req.session.hoopStart, hoopEnd: req.session.hoopEnd, plusOnes: req.user.plusOnes
  });
       }).sort( { 'timestamp': 1 } ).limit(50);

     });
   });

  app.get('/home_next', isLoggedIn, function(req, res) {
  var res1 = res;
     var domain_name = req.user.local.domain;
  console.log("hoopstart: " + req.session.hoopStart);
  if(req.session.hoopStart + 20 < req.session.hoopArray.length){
  req.session.hoopStart += 20;
  if(req.session.hoopEnd + 20 < req.session.hoopArray.length){
  req.session.hoopEnd += 20;
  res1.render('home.ejs', {
  arr: req.session.hoopArray, domain: domain_name, id: req.user._id, hoopStart: req.session.hoopStart, hoopEnd: req.session.hoopEnd,plusOnes: req.user.plusOnes
  });
  }
  else{
  req.session.hoopEnd += 20;
  res1.render('home.ejs', {
  arr: req.session.hoopArray, domain: domain_name, id: req.user._id, hoopStart: req.session.hoopStart, hoopEnd: req.session.hoopArray.length-1,plusOnes: req.user.plusOnes
  });
  }
  };
   });
   
   app.get('/home_prev', isLoggedIn, function(req, res) {
  if(req.session.hoopStart - 20 >= 0){
  req.session.hoopStart -= 20;
  req.session.hoopEnd -= 20;
  }
  var res1 = res;
     var domain_name = req.user.local.domain;
  res1.render('home.ejs', {
  arr: req.session.hoopArray, domain: domain_name, id: req.user._id, hoopStart: req.session.hoopStart, hoopEnd: req.session.hoopEnd, plusOnes: req.user.plusOnes
  });
     });

  // process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect : '/home', // redirect to the home
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));

  // =====================================
  // LOGOUT ==============================
  // =====================================
  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  app.get('/post/:id', isLoggedIn, function(req, res) {

    try{
      hoop_model.findById(req.params.id,
                        function(err, hoop_found) {
                          if (err) { console.log(err); }
                          else{
                            try{
                            console.log(hoop_found);
                            hoop_found.timestamp = timeSince(hoop_found.timestamp);
                            for (var i = 0; i < hoop_found.replies.length; i++) {
                              hoop_found.replies[i].timestamp = timeSince(hoop_found.replies[i].timestamp); 
                            }
                            res.render('page.ejs',{hoop: hoop_found, replies: hoop_found.replies, domain: req.user.local.domain, plusOnes: req.user.plusOnes});
                          }
                          catch(err){
                            res.redirect('/home');
                          }
                          }
                        });
    }
    catch(err) {
      res.redirect('/home');
    }



  });

  app.get('/check_access/:accessCode', function(req, res) {
      if (req.params.accessCode === req.session.accessCode) {
        delete req.session.accessCode;
        User.findOne({ 'local.email' :  req.user.local.email }, function(err, user) {

          user.local.hasAccess = true;
          user.save();
          // create the user and send them to the mail pag
          req.flash('success', 'Access code accepted. Please log in.');
          res.redirect('/login');
        });

      }
      else {
        delete req.session.accessCode;
        req.flash('signupMessage', 'Invalid access code.');
        res.redirect('/signup');
      }
  });

  // validate the email and possibly send
  app.get('/validate_email', function(req, res){

      var email = req.query.email;
      var password = req.query.password;
      var isEmail = validator.isEmail(email);
      var isPassword = validator.isAlphanumeric(password);

      res.send({email: isEmail, password: isPassword});
    });

  app.get('/send_email', function(req, res) {
        // create the access code
        var email = req.user.local.email;
        var accessCode = Math.random().toString(36).substring(8);
        var website = email.slice(email.indexOf('@'));
        console.log('Sending access code: ' + accessCode + ' to ' + email);

        // send the email
        var mailOptions = {
            from: 'Hoopla <hoopla.app@gmail.com>', // sender address
            to: email, // list of receivers
            subject: 'Hoopla Access Code', // Subject line
            html: 'Click the link below to validate your email and get access to the ' + website + ' section of Hoopla.<br><br><a href = "http://localhost:8080/check_access/' + accessCode + '">Access Code</a><br><br>- Hoopla Developers'
        };

        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                console.log(error);
                res.send({response: false})
            }else{
                console.log('Message sent: ' + info.response);
                req.session.accessCode = accessCode;
                res.send({response: true})
            }
        });
      });

  //create a domain
  app.post('/domain', function(req, res) {
    //req.body needs to have domain_name
    var new_domain = new domain_model({
      'parent_id' : 0,
      'domain_name' : req.body.domain_name
    });
    
    var new_domain_id = new_domain._id;

    new_domain.save(function(err, new_domain) {
      if (err) {
        return console.error(err);
      } 

      console.dir(new_domain);
    });

    res.send(new_domain._id);
  });

  app.post('/delete_hoop', function(req, res) {
    console.log('req id: '+ req.body._id);
    hoop_model.findByIdAndRemove(req.body._id, function(err, res) {
      console.log('res: '+res);
    });
    res.send(200);
  });

  //create a hoop
 //create a hoop
  app.post('/hoop', isLoggedIn, function(req, res) {
    //req.body needs to have domain_name, commenter, body, image_link, title 
    var hoop_commenter = req.user.local.username;
    var hoop_body = req.body.hoop_body;
    var hoop_image_link = req.body.image_link;
    var hoop_type = 'hoop';
    var hoop_score = 0;
    var hoop_title = req.body.hoop_title;

    domain_model.findOne({'domain_name' : req.body.domain_name},
                         function (err, parent) {
                          if (err) {
                            return console.error(err);
                          }

                          var new_hoop = new hoop_model({
                            'parent_id' : parent._id,
                            'title' : hoop_title,
                            'commenter' : hoop_commenter,
                            'body' : hoop_body,
                            'image_link' : hoop_image_link,
                            'score' : hoop_score,
                            'timestamp' : new Date(),
                            'replies' : new Array(),
                          });

                          new_hoop.save(function(err, new_hoop) {
                            if (err) {
                              return console.error(err);
                            } 

                            console.dir(new_hoop);
                            //does the body text mention anyone? If so, send that person an email!
                            var mentions = new Array();
                            mentions = hoop_body.match(/@[\w|.]+/g);
                            if (mentions) {
                              mentions.forEach(function(mentioned) {
                                //check if the mention is a valid username
                                User.find({},
                                             function(err, all_users) { 
                                               if (err) {
                                                 return;
                                               }

                                               all_users.forEach(function(single_user) { 
                                                if (single_user.local.username == mentioned.slice(1)) { //drop the @ from mentioned
                                                  var email = single_user.local['email'];
                            
                                                  // send email to the mentioned user
                                                  var mailOptions = {
                                                      from: 'Hoopla <hoopla.app@gmail.com>', // sender address
                                                      to: email, // list of receivers
                                                      subject: 'You were mentioned on Hoopla@' + single_user.local.domain + '!', // Subject line
                                                      html: '<span style = "border-bottom: 1px solid #3498DB;padding: 4px;font-size: 20px;font-weight: 100;padding-bottom: 8px;">Such Popular! Very Friends!</span><br><br>\
                                                             <div font-size:22px margin-top:8px;"><div>' + hoop_commenter + ' mentioned you on Hoopla. That\'s so cool, isn\'t it? \
                                                             <br><br>Here\'s what ' + hoop_commenter + ' had to say:\
                                                             <br><br>' + new_hoop.body + '\
                                                             <br><br> <a href="http://localhost:8080/post/' + new_hoop._id + '">Click Here to send some Hoopla back!</a><br>'
                                                  };
                            
                                                  transporter.sendMail(mailOptions, function(error, info){
                                                      if(error){
                                                          console.log(error);
                                                          res.send({response: false})
                                                      }else{
                                                          console.log('Message sent: ' + info.response);
                                                          res.send({response: true})
                                                      }
                                                  });
                                                }
                                               });
                                             });
                              }); 
                            }
                          });
                          
                          res.send(parent._id);
                         });
  });

  app.post('/update_hoop', isLoggedIn, function(req, res) {
    hoop_model.findByIdAndUpdate(req.body._id, {'body': req.body.body},  function(err, res) {
      if (err) {
        return console.error(err);
      } 
    });
    res.send(200);
  });

  //create a la (reply)
  app.post('/la', isLoggedIn, function(req, res) {
    //req.body needs to have hoop_id (id of parent hoop), commenter, body 
    var parent_hoop_id = req.body.hoop_id;
    var la_commenter = req.user.local.username;
    var la_body = req.body.la_body;


    console.log(parent_hoop_id);
    console.log(la_commenter);
    console.log(la_body);

    hoop_model.findByIdAndUpdate(parent_hoop_id,
                                {'$push' : {
                                  'replies' : {
                                    '_id' : mongoose.Types.ObjectId(),
                                    'parent_id' : parent_hoop_id,
                                    'commenter' : la_commenter,
                                    'body' : la_body,
                                    'score' : 0,
                                    'timestamp' : new Date()
                                  }
                                }}, 
                                function(err, hoop_found) {
                                  if (err) {
                                    return console.error(err);
                                  }

                                  //does the body text mention anyone? If so, send them an email!
                                  var mentions = new Array();

                                  mentions = la_body.match(/@[\w|.]+/g);
                                  if (mentions) {
                                    mentions.forEach(function(mentioned) {
                                      //check if the mention is a valid username
                                      User.find({},
                                                   function(err, all_users) { 
                                                     if (err) {
                                                       return;
                                                     }

                                                     all_users.forEach(function(single_user) { 
                                                      if (single_user.local.username == mentioned.slice(1)) { //drop the @ from mentioned
                                                        var email = single_user.local['email'];
                                  
                                                        // send email to the mentioned user
                                                        var mailOptions = {
                                                            from: 'Hoopla <hoopla.app@gmail.com>', // sender address
                                                            to: email, // list of receivers
                                                            subject: 'You were mentioned on Hoopla@' + single_user.local.domain + '!', // Subject line
                                                            html: '<span style = "border-bottom: 1px solid #3498DB;padding: 4px;font-size: 20px;font-weight: 100;padding-bottom: 8px;">Such Popular! Very Friends!</span><br><br>\
                                                                   <div font-size:22px margin-top:8px;"><div>' + la_commenter + ' mentioned you on Hoopla. That\'s so cool, isn\'t it? \
                                                                   <br><br>Here\'s what ' + la_commenter + ' had to say:\
                                                                   <br><br>' + la_body + '\
                                                                   <br><br> <a href="http://localhost:8080/page?hoop_id=' + hoop_found._id + '">Click Here to send some Hoopla back!</a><br>'
                                                        };
                                  
                                                        transporter.sendMail(mailOptions, function(error, info){
                                                            if(error){
                                                                console.log(error);
                                                                res.send({response: false})
                                                            }else{
                                                                console.log('Message sent: ' + info.response);
                                                                res.send({response: true})
                                                            }
                                                        });
                                                      }
                                                     })
                                                   });
                                    }); 
                                  }

                                  res.send(hoop_found.replies[hoop_found.replies.length - 1]._id);
                                });
  });

  //delete a la from a hoop's replies array
  app.post('/delete_la', isLoggedIn, function(req, res) {
    //req needs to have a hoop_id (id of the hoop to delete la from) and la_id (id of la to delete)
    hoop_model.findById(req.body.hoop_id,
                        function(err, hoop_found) {
                          if (err) {
                            return console.error(err);
                          }
 
                          var replies = hoop_found.replies;
                          var index = -1;
                          replies.forEach(function(reply){
                            if (reply._id == req.body.la_id) {
                             index = replies.indexOf(reply);
                            } 
                          });
 
                          if (index >= 0) {
                             replies.splice(index, 1);
 
                             hoop_model.findByIdAndUpdate(req.body.hoop_id,
                                                          {'replies' : replies},
                                                          function (err2, updated_hoop) {
                                                            if (err2) {
                                                              console.error(err2);
                                                            }
                                                            res.send(updated_hoop.replies);
                                                          });
                          }
                        });
  });

  //update a la in a hoop's replies array
  app.post('/update_la', isLoggedIn, function(req, res) {
    //req needs to have an hoop_id (id of hoop to update la in) and la_id (id of la to update)
    //req also needs to have body, the new body text
    hoop_model.findById(req.body.hoop_id,
                        function(err, hoop_found) {
                          if (err) {
                            return console.error(err);
                          }

                          var replies = hoop_found.replies;
                          var index = -1;
                          replies.forEach(function(reply){
                            if (reply._id == req.body.la_id) {
                             index = replies.indexOf(reply);
                            } 
                          });
                          
                          if (index >= 0) {
                            replies[index].body = req.body.body
                            hoop_model.findByIdAndUpdate(req.body.hoop_id,
                                                         {'replies' : replies},
                                                         function(err2, updated_hoop) {
                                                           if (err2) {
                                                             console.error(err2);
                                                           }
                                                           res.send(updated_hoop.replies[index].body);
                                                         });
                          }
                        })
  }); 


  //get a single hoop and its list of las
  app.get('/page', isLoggedIn, function(req, res) {
    //req.body needs to have the hoop id for the single hoop we want to see
    hoop_model.findById(req.query.hoop_id,
                        function(err, hoop_found) {
                          if (err) {
                            return console.error(err);
                          }
                          res.send(hoop_found.replies);
                        });
  });

  //this is totally different from an upvote
  app.post('/plus_one_hoop', isLoggedIn, function(req, res) {  
    //req.body needs to have _id (hoop id of hoop to plus one) 
    // also needs user_id
    
    var hoop_id = req.body.hoop_id;
    var user_id = req.user._id;
    console.log(hoop_id);
    console.log(user_id);
    try {
    User.findById(user_id, function(err, res2) {
      if (err) {
        return console.error(err);
      }

      var plusOneHoop = res2.plusOnes;
      var alreadyPlus = false;

      hoop_model.findById(hoop_id,
        function(err, hoop_found) {
          if (err) {
            return console.error(err);
          }
          console.log(hoop_found);

          // Loop through user's array of plus ones
          plusOneHoop.forEach(function(plus) {
            // If Hoop id exists in array, user has already +1
            if (hoop_id == plus) {
              alreadyPlus = true;
              res.send({'response': 'already'});
            }
          })

          

          var current_score = hoop_found.score;
          if (!alreadyPlus) {
            res.send({'response': 200});
            // update User's +1 array with hoop_id
            current_score++;

            User.findByIdAndUpdate(user_id, {$push: {'plusOnes': hoop_id } }, 
              function(err2, updated_array) {
                  if (err2) {
                    return console.error(err2);
                  }
              });
          } else {
            // User has already +1, so we should -1 from Hoop score
            current_score--;

            // pop hoop_id from User's +1
            User.findByIdAndUpdate(user_id, {$pull: { 'plusOnes': hoop_id } }, 
              function(err2, updated_array) {
                  if (err2) {
                    return console.error(err2);
                  }
              });
          }
          // update Hoop's score
          hoop_model.findByIdAndUpdate(hoop_id,
                                       {'score' : current_score},
                                       function(err2, updated_hoop) {
                                         if (err2) {
                                           return console.error(err2);
                                         }
                                       });

        });

 
                        });
     console.log('Plus one successful');
    }
    catch(err) {
      console.log('A problem with plus oneing a hoop occured');
      res.send({'failure': 500});
    }
  });

  //this is totally different from an upvote
  app.post('/plus_one_la', isLoggedIn, function(req, res) {
    //req.body needs to have _id (of comment to be plus one'd), parent_id (of hoop comment is on) 
    var la_id = req.body.la_id;
    var parent_id = req.body.parent_id;
    var user_id = req.body._id;

    // Get User by user_id
    User.findById(user_id, function(err, res2) {
      if (err) {
        return console.error(err);
      }

      var plusOneHoop = res2.plusOnes;
      var alreadyPlus = false;

      // Get hoop post that matches the parent_id
      hoop_model.findById(parent_id,
        function(err, parent_hoop) {
          if (err) {
            return console.error(err);
          }
          //console.log('parent_hoop: '+parent_hoop);
          var replies = parent_hoop.replies;
          var index = -1;
          replies.forEach(function(reply) {
            if (reply._id == la_id) {
              index = replies.indexOf(reply);
            }
          });

          // found index of la in replies array
          if (index >= 0) {
            // Loop through user's array of plus ones
            plusOneHoop.forEach(function(plus) {
              // If la_id exists in array, user has already +1
              if (replies[index]._id == plus) {
                alreadyPlus = true;
              }
            });
              if (!alreadyPlus) {
                replies[index].score++;

                // Push la_id to user's plusOnes
                User.findByIdAndUpdate(user_id, {$push: {'plusOnes': la_id } }, 
                  function(err2, updated_array) {
                      if (err2) {
                        return console.error(err2);
                      }
                });

              } else {
                replies[index].score--;

                // Pull la_id from user's plusOnes
                User.findByIdAndUpdate(user_id, {$pull: { 'plusOnes': la_id } }, 
                  function(err2, updated_array) {
                      if (err2) {
                        return console.error(err2);
                      }
                });
              }

              hoop_model.findByIdAndUpdate(parent_id,
                                         {'replies' : replies},
                function(err2, updated_hoop) {
                   if (err2) {
                     return console.error(err2);
                   }
                });
          }
        });
      });
    res.send(200);
  });

  //get all posts authored by a given user
  app.get('hoops_by_user', isLoggedIn,function(req, res) {
    //req needs username and domain_name
    var user_query = req.query.username;
    var domain_query = req.query.domain_name;
    var query_array = new Array();

    domain_model.find({'domain_name' : domain_query},
                      function(err, found_domain) {
                        if (err) {
                          return console.error(err);
                        }
                        console.log(domain_query);
                        hoop_model.find({'username' : user_query,
                                         'parent_id' : found_domain._id},
                                         function(err2, hoops_found) {
                                           if (err2) {
                                             return console.error(err2);
                                           }
                                           console.log(hoops_found);
                                           query_array = hoops_found;
                                         }
                                       );
                        res.render('home.ejs', {arr: query_array, domain: domain_query, id: req.user._id});  
                      }.sort( {'timestamp' : 1} ).limit(50)
                     );
  });
};


// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

  // if user is authenticated in the session, carry on 
  console.log(req.route.path == '/');
  if (req.isAuthenticated())

      return next();      


  // if they aren't redirect them to the home page
  res.redirect('/');
}
