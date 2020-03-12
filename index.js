var fs = require('fs')

function replaceObjects(){
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
    if(filename.includes(".html")){
      fs.readFile(`templates/${filename}`, 'utf8', function(err, originFile){
        if(err) throw new Error(err)
        else{

          //replace components
          for(let comp of compArray){
            let htmlComp = fs.readFileSync(`components/${comp}.html`, 'utf8')
            let tag = `<#${comp.toUpperCase()}>`
            if(originFile.includes(tag)){
              originFile = originFile.replace(tag, htmlComp);
            }
          }
          
          //replace objects
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
                //insert ID in parent div toruf-OBJ-ID
                Object.keys(unit).map(function(key, index){
                  //if the text is between text insert a span tag
                  //insert class toruf-OBJ-VARIABLE in the span tag or the actual tag (if no other text)
                  //add rules to truncate a particular variable if its length is greater than x
                  temp = temp.replace(`{${key}}`, unit[key]);
                })
                htmlObj+=temp
              });
              //insert comment <!-- toruf-OBJ-start -->
              //insert comment <!-- toruf-OBJ-end -->
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
