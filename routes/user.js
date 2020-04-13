var express = require('express');
var router = express.Router();
var fs           = require('fs');
var xml2js       = require('xml2js');
var parser       = new xml2js.Parser();

/*GET student login page*/
router.get('/login',function(req, res, next) {
    var messages = req.flash('error');
    res.render('html/login', {messages: messages , hasErrors: messages.length > 0});
});
  

// Login endpoint
router.post('/login', function (req, res) {
    var messages = [];
    if (!req.body.username || !req.body.password) {
        messages.push("Wrong Credentials");
        req.flash('error' , messages);
        res.redirect('/user/login');
    }   
    else {
        var user = null;
        var xmlfile = __dirname + "/../public/database/users.xml";
        fs.readFile(xmlfile, "utf-8", function (error, text) {
          if (error) {
            throw error;
          }else {
            parser.parseString(text, function (err, result) {
              var users = result['users']['user'];
              users.forEach(element => {
                  if(element.username == req.body.username && element.password == req.body.password){
                    user = element;
                  }       
              });
              if(user){
                req.session.user = user;
                res.redirect('/user/profile');
              }
              else{
                messages.push("Wrong Credentials");
                req.flash('error' , messages);
                res.redirect('/user/login');
              } 
            });
          }
        });
    }
  });

  
// Logout endpoint
router.get('/logout',auth, function(req, res, next){
    req.session.destroy();
    res.redirect('/');
});
  
  /* GET profile page. */
router.get('/profile',auth,function(req, res, next) {
    var xmlfile = __dirname + "/../public/database/comments.xml";
    fs.readFile(xmlfile, "utf-8", function (error, text) {
        if (error) {
            throw error;
        }else {
            parser.parseString(text, function (err, result) {
                var comments = result['comments']['comment'];
                var notifications = 0;
                var userSpecificComments=[];
                var unreadReplies =[];
                comments.forEach(element =>{
                    if(String(element.username) == String(req.session.user.username)){
                        userSpecificComments.push(element);
                        if(String(element.status) == "Replied"){
                            element.reply.forEach(rep =>{
                                if(String(rep.status) == "Unread"){
                                    unreadReplies.push(element);
                                    notifications += 1;
                                }
                            })
                        }
                    } 
                });
                res.render('html/studentProfile',{currentUser:req.session.user, comments: userSpecificComments, unreadReplies: unreadReplies, notifications: notifications});
        });
        }
    });     
});


module.exports = router;

function auth (req, res, next) {
    if (req.session && req.session.user)
      return next();
    else
      return res.redirect('/');
  };