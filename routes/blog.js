

var Blog = require('../models/blog.js')
, moment = require("moment");

exports.showAll = function(req, res){
     

      Blog.find({}, function(err, blogs){ 
        if (err) { console.log(err)}
          res.render("bloglist", {title: "Blogs", blogs: blogs})
  })     
}

exports.showOne = function(req, res) {


  Blog.findOne({urltitle: req.params.id}, function(err, blog) {
  if (!err)

    res.render("blog", {title: blog.title, date: blog.date, body: blog.body})
});

}

exports.newBlog = function(req, res){
  if (req.user._id === "grabbeh"){
  res.render('newblog', {title: "New blog"})
}
else { res.send("Alas you're not allowed to post blogs on this site")}
  
}

exports.post = function(req, res){

var day = moment(new Date());
var formattedDate = day.format("MMMM Do YYYY");
var urltitle = req.body.title.replace(/\s+/g, '-').toLowerCase();

new Blog({title: req.body.title, body: req.body.body, date: formattedDate, urltitle: urltitle}).save(function(err, blog){
if (!err) res.redirect('/blog');

})
}

exports.delete = function(req, res) {
     Blog.findOne({urltitle: req.params.id}, function(err, blog) {
        
          blog.remove();
          res.redirect('/blog');
        
    })
  };

exports.edit = function(req, res) {

  Blog.findOne({urltitle: req.params.id}, function(err, blog) {
  if (!err){

    res.render("blogedit", {title: blog.title, date: blog.date, body: blog.body, urltitle: blog.urltitle})
    }
  });
}

exports.postEdit = function(req, res) {
console.log(req.body);
Blog.findOne({urltitle: req.body.urltitle}, function(err, blog){

title: req.body.title;
body: req.body.body;
date: req.body.date;

    blog.save(function(err){
        res.redirect('/blog');
      })
    })
}

exports.admin = function(req, res){

      Blog.find({}, function(err, blogs){ 
        res.render("blogadmin", {title: "Blogs", blogs: blogs})
  })     
}
