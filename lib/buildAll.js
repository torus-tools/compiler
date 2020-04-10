var fs = require('fs')
var build = require('./build')

module.exports = function buildAllOutput(){
  var objArray = [];
  var compArray = [];
  //create an array of objects
  fs.readdirSync('toruf/objects').forEach(function(filename){
    if(filename.includes(".json")){
      let name = filename.split('.json')[0];
      objArray.push(name);
    }
  });
  //create an array of components
  fs.readdirSync('toruf/components').forEach(function(filename){
    if(filename.includes(".html")){
      let name = filename.split('.html')[0];
      compArray.push(name);
    }
  });
  //read all templates
  fs.readdirSync('toruf/templates').forEach(function(filename){
    console.log(filename)
    build(filename);
  });
}