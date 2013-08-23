


exports.transloadit = function(req, res){
    res.render("transloadit", {layout: false})
}

exports.postupload = function(req, res){
      var object = JSON.parse(req.body.transloadit);
      var originalUrl = object.results[':original'][0].url;
      var thumbUrl = object.results.thumb[0].url;
      
      var data = {}
      data['message'] = "Photo uploaded - thanks";
      data['thumb'] = thumbUrl;
      data['original'] = originalUrl;
      res.json(data);
}