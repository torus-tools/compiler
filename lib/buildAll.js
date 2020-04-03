var fs = require('fs')
var build = require('./build')

module.exports = function buildAllOutput(){
  var objArray = [];
  var compArray = [];
  //create an array of objects
  fs.readdirSync('objects').forEach(function(filename){
    if(filename.includes(".json")){
      let name = filename.split('.json')[0];
      objArray.push(name);
    }
  });
  //create an array of components
  fs.readdirSync('components').forEach(function(filename){
    if(filename.includes(".html")){
      let name = filename.split('.html')[0];
      compArray.push(name);
    }
  });
  //read all templates
  fs.readdirSync('templates').forEach(function(filename){
    build(filename);
  });
}