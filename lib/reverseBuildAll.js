var fs = require('fs')
var reverseBuild = require('./reverseBuild')

module.exports = function buildAllTemplates(){
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
  fs.readdirSync('output').forEach(function(filename){
    reverseBuild(filename);
  });
}
