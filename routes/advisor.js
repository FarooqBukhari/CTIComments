var express = require('express');
var router = express.Router();
var fs           = require('fs');
var xml2js       = require('xml2js');
var parser       = new xml2js.Parser();

/*GET student login page*/
router.get('/portal',function(req, res, next) {
    var messages = req.flash('error');
    res.render('html/portal', {messages: messages , hasErrors: messages.length > 0});
});
  
// Login endpoint
router.post('/portal', function (req, res) {
    var messages = [];
    if (!req.body.username || !req.body.password) {
        messages.push("Wrong Credentials");
        req.flash('error' , messages);
        res.redirect('/advisor/portal');
    }   
    else {
        var user = null;
        var xmlfile = __dirname + "/../public/database/accounts.xml";
        fs.readFile(xmlfile, "utf-8", function (error, text) {
          if (error) {
            throw error;
          }else {
            parser.parseString(text, function (err, result) {
              var advisors = result['advisors']['advisor'];
              advisors.forEach(element => {
                  if(element.username == req.body.username && element.password == req.body.password){
                    user = element;
                  }       
              });
              if(user){
                req.session.user = user;
                req.session.admin = user;
                res.redirect('/advisor/profile');
              }
              else{
                messages.push("Wrong Credentials");
                req.flash('error' , messages);
                res.redirect('/advisor/portal');
              } 
            });
          }
        });
    }
  });

  
// Logout endpoint
router.get('/logout',auth, function(req, res, next){
    req.session.admin = null;
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
                var advisorSpecificComments=[];
                var unreadReplies =[];
                comments.forEach(element =>{
                    if(String(element.type) == String(req.session.user.department)){
                        advisorSpecificComments.push(element);
                        if(String(element.status) != "Replied"){
                            unreadReplies.push(element);
                            notifications += 1;
                        }
                    } 
                });
                res.render('html/advisorProfile',{currentUser:req.session.user, comments: advisorSpecificComments, unreadReplies: unreadReplies, notifications: notifications});
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