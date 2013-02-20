

//var auth = require("../config/couch.js")
// var nano = require("nano")('http://grabbeh:everton@mbg.iriscouch.com')
var nano = require("nano")('http://mbg.iriscouch.com')
//var nano = require("nano")('http://127.0.0.1:5984')
, moment = require("moment");

exports.showAll = function(req, res){
      var blogdb = nano.use('blogs');

      blogdb.view('basicmap', 'basicmap', function(err, blogs){ 
        if (err) { console.log(err)}
          res.renderPjax("bloglist", {title: "Blogs", blogs: blogs.rows})
  })     
}

exports.showOne = function(req, res) {

  var blogdb = nano.use('blogs');
  blogdb.get(req.params.id, { revs_info: true }, function(err, blog) {
  if (!err)

    res.renderPjax("blog", {title: blog.title, date: blog.date, body: blog.body})
});

}

exports.newBlog = function(req, res){
  if (req.user._id === "grabbeh"){
  res.renderPjax('newblog', {title: "New blog"})
}
else { res.send("Alas you're not allowed to post blogs on this site")}
  
}

exports.post = function(req, res){

var blogdb = nano.use('blogs')
var day = moment(new Date());
var formattedDate = day.format("MMMM Do YYYY");
var urltitle = req.body.title.replace(/\s+/g, '-').toLowerCase();

blogdb.insert({title: req.body.title, body: req.body.body, date: formattedDate}, urltitle, function(err, body, header){
  if (err) {
    console.log(err.message);
    return;
    }
      console.log('Blog upload successful');
      console.log(body);
      res.redirect('/blog');
    })
}

exports.delete = function(req, res) {

  var blogdb = nano.use('blogs');

  blogdb.get(req.params.id, { revs_info: true }, function(err, blog) {    
        console.log(blog)
      blogdb.destroy(blog._id, blog._revs_info[0].rev, function(err, body) {
        if (err){ console.log(err)}
      else {
        res.redirect('/blog/admin');
      }
    });
});
}

exports.edit = function(req, res) {

  var blogdb = nano.use('blogs');
  blogdb.get(req.params.id, { revs_info: true }, function(err, blog) {
  if (!err){

    res.renderPjax("blogedit", {title: blog.title, date: blog.date, body: blog.body, id: blog._id})
    }
  });
}

exports.postEdit = function(req, res) {

id = req.body.id;
var blogdb = nano.use('blogs');
blogdb.get(id, function(err, blog){

    blogdb.insert({title: req.body.title, body: req.body.body, date: req.body.date, _rev: blog._rev}, id, function(err, body, header){
      if (err) {
        console.log(err.message);
        return;
      }
  console.log('Blog update successful');
  res.redirect('/blog/admin');
  })
})
}

exports.admin = function(req, res){
    var blogdb = nano.use('blogs');

      blogdb.view('basicmap', 'basicmap', function(err, blogs){ 
        res.renderPjax("blogadmin", {title: "Blogs", blogs: blogs.rows})
  })     
}
