var fs = require('fs')

function replaceObjects(){
  //read all objects
  var objArray = [];
  fs.readdirSync('objects').forEach(function(filename){
    if(filename.includes(".json")){
      let name = filename.split('.json')[0];
      objArray.push(name);
    }
  });
  fs.readdirSync('templates').forEach(function(filename){
    if(filename.includes(".html")){
      fs.readFile(`templates/${filename}`, 'utf8', function(err, originFile){
        if(err) throw new Error(err)
        else{
          for(let obj of objArray){
            let tag = obj.toUpperCase();
            if(originFile.includes(`<${tag}>`)){
              let objTemplate = originFile.split(`<${tag}>`)[1].split(`</${tag}>`)[0];
              let htmlObj = "";
              let rawdata = fs.readFileSync(`objects/${obj}.json`);
              let db = JSON.parse(rawdata)
              Object.keys(db).map(function(key, index){
                let unit = db[key]
                let temp = objTemplate;
                //console.log(unit)
                Object.keys(unit).map(function(key, index){
                  //console.log(key, unit[key])
                  temp = temp.replace(`{${key}}`, unit[key]);
                })
                htmlObj+=temp
              });
              let oldObj = `<${tag}>`+objTemplate+`</${tag}>`;
              let newFile = originFile.replace(oldObj, htmlObj);
              fs.writeFileSync(`output/${filename}`, newFile)
              console.log('success');
              return 'success';
            }
          }
        }
      })
    }
  });
}

replaceObjects()
