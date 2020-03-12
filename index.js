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
              let start_tag = 
              `<!-- ${tag} -->
              `;
              let end_tag = 
              `
              <!-- !${tag} -->`;
              let htmlCom = start_tag + htmlComp + end_tag; 
              originFile = originFile.replace(tag, htmlCom);
            }
          }
          
          //replace objects
          for(let obj of objArray){
            let tag = obj.toUpperCase();
            if(originFile.includes(`<${tag}>`)){
              let start_tag = 
              `<!-- <${tag}> -->
              `;
              let end_tag = 
              `
              <!-- </${tag}> -->`;
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
                  
                  //split template into lines
                  //if line contains {${key}} split key 
                  //if line {${key}} split key[0].trim.endsWith('>) || 
                  temp = temp.replace(`{${key}}`, unit[key]);
                })
                htmlObj+= temp;
              });
              let oldObj = `<${tag}>`+objTemplate+`</${tag}>`;
              newHtmlObj = start_tag + htmlObj + end_tag; 
              let newFile = originFile.replace(oldObj, newHtmlObj);
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
