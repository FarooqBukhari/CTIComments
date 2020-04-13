var express = require('express');
var router = express.Router();
var fs           = require('fs');
var xml2js       = require('xml2js');
var parser       = new xml2js.Parser();

/* GET home page. */
router.get('/', function(req, res, next) {
  var xmlfile = __dirname + "/../public/database/internships.xml";
  fs.readFile(xmlfile, "utf-8", function (error, text) {
    if (error) {
      throw error;
    }else {
      parser.parseString(text, function (err, result) {
        var internships = result['internships']['internship'];
        res.render('html/index', { internships:  internships });
      });
    }
 });
});

router.get('/comment/:internshipId', function(req, res, next){
  var xmlfile = __dirname + "/../public/database/internships.xml";
  fs.readFile(xmlfile, "utf-8", function (error, text) {
    if (error) {
      throw error;
    }else {
      parser.parseString(text, function (err, result) {
        var internships = result['internships']['internship'];
        var internship;
        internships.forEach(element => {
          if(String(element.id) == String(req.params.internshipId)){
            internship = element;
          }
        });
        res.render('html/comment', { internship:  internship });
      });
    }
 });
});
router.post('/comment/:internshipId', auth, function(req, res, next){
  var xmlfile = __dirname + "/../public/database/internships.xml";
  fs.readFile(xmlfile, "utf-8", function (error, text) {
    if (error) {
      throw error;
    }else {
      parser.parseString(text, function (err, result) {
        var internships = result['internships']['internship'];
        var internship;
        internships.forEach(element => {
          if(String(element.id) == String(req.params.internshipId)){
            internship = element;
          }
        });
        console.log(internship);
        xmlfile = __dirname + "/../public/database/comments.xml";
        fs.readFile(xmlfile, "utf-8", function (error, text) {
            if (error) {
                throw error;
            }else {
                xml2js.parseString(text, {explicitArray: false},function (err, result) {
                    var comments = result['comments'];
                    console.log(comments);
                    var json = result['comments']['comment'];
                    var today = new Date();
                    var dd = today.getDate();
                    var mm = today.getMonth() + 1; //January is 0!

                    var yyyy = today.getFullYear();
                    if (dd < 10) {
                      dd = '0' + dd;
                    } 
                    if (mm < 10) {
                      mm = '0' + mm;
                    } 
                    var today = dd + '/' + mm + '/' + yyyy;
                    var mycomment = {username: String(req.session.user.username), text: String(req.body.comment), id: (json.length)+1, internshipid: String(internship.id), company: String(internship.company), designation: String(internship.designation), status:"Posted", type: String(internship.type), commenttype: String(req.body.commenttype),datecreated: today}; 
                    comments.comment.push(mycomment);
                    console.log(comments);
                    var builder = new xml2js.Builder({
                      rootName: "comments",
                      trim: true
                    });
                    var xml = builder.buildObject(comments);
                    fs.writeFile(xmlfile, xml, function(err, data){
                      if (err) 
                        console.log(err);
                      console.log("successfully written our update xml to file");
                  })
              });
            }
        });

        res.redirect('/user/profile');
      });
    }
 });
});
router.get('/reply/:commentId/:internshipId', function(req, res, next){
  var xmlfile = __dirname + "/../public/database/internships.xml";
  fs.readFile(xmlfile, "utf-8", function (error, text) {
    if (error) {
      throw error;
    }else {
      parser.parseString(text, function (err, result) {
        var internships = result['internships']['internship'];
        var internship;
        internships.forEach(element => {
          if(String(element.id) == String(req.params.internshipId)){
            internship = element;
          }
        });
        var xmlfile = __dirname + "/../public/database/comments.xml";
        fs.readFile(xmlfile, "utf-8", function (error, text) {
          if (error) {
            throw error;
          }else {
            parser.parseString(text, function (err, result) {
              var comments = result['comments']['comment'];
              var comment;
              comments.forEach(element => {
                if(String(element.id) == String(req.params.commentId)){
                  comment = element;
                }
              });
              res.render('html/reply', { internship:  internship , comment: comment});
            });
          }
      });
      });
    }
 });
});

router.post('/reply/:commentId/:internshipId', function(req, res, next){
  var xmlfile = __dirname + "/../public/database/internships.xml";
  fs.readFile(xmlfile, "utf-8", function (error, text) {
    if (error) {
      throw error;
    }else {
      parser.parseString(text, function (err, result) {
        var internships = result['internships']['internship'];
        var internship;
        internships.forEach(element => {
          if(String(element.id) == String(req.params.internshipId)){
            internship = element;
          }
        });
        var xmlfile = __dirname + "/../public/database/comments.xml";
        fs.readFile(xmlfile, "utf-8", function (error, text) {
          if (error) {
            throw error;
          }else {
            xml2js.parseString(text,{explicitArray:false} ,function (err, result) {
              var comments = result['comments'];
              var reply = {
                advisorname: String(req.session.user.username),
                replytext: String(req.body.reply),
                status: "Unread"
              }
              var index = parseInt(req.params.commentId);
              index = index-1;
              comments.comment[index].reply = reply;
              comments.comment[index].status = "Replied";
              console.log(comments.comment[index].reply);
              var builder = new xml2js.Builder({
                rootName: "comments",
                trim: true
              });
              var xml = builder.buildObject(comments);
              fs.writeFile(xmlfile, xml, function(err, data){
                if (err) 
                  console.log(err);
                console.log("successfully written our update xml to file");
              })
              res.redirect('/advisor/profile');
            });
          }
      });
      });
    }
 });
});
router.get('/markread/:commentId', function(req, res, next){
        var xmlfile = __dirname + "/../public/database/comments.xml";
        fs.readFile(xmlfile, "utf-8", function (error, text) {
          if (error) {
            throw error;
          }else {
            xml2js.parseString(text,{explicitArray:false} ,function (err, result) {
              var comments = result['comments'];
              var index = parseInt(req.params.commentId);
              index = index-1;
              comments.comment[index].reply.status = "Read";
              console.log(comments.comment[index].reply);
              var builder = new xml2js.Builder({
                rootName: "comments",
                trim: true
              });
              var xml = builder.buildObject(comments);
              fs.writeFile(xmlfile, xml, function(err, data){
                if (err) 
                  console.log(err);
                console.log("successfully written our update xml to file");
              })
              res.redirect('/user/profile');
            });
          }
      });
      });



module.exports = router;

function auth (req, res, next) {
  if (req.session && req.session.user)
    return next();
  else{
    var messages = [];
    messages.push("Login First before Commenting");
    req.flash('error' , messages);
    return res.redirect('/user/login');
  }
    
};