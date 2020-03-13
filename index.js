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
                  let temparr = temp.split(`{${key}}`)
                  if(temparr[0].trim().endsWith('>') || /^[a-zA-Z0-9]/.test(temparr[0].substr(temparr[0].length - 1))){
                    let newU = `<span class="torufattr_${key}">${unit[key]}</span>`
                    temp = temp.replace(`{${key}}`, newU);
                  }
                  else if(temparr[0].endsWith(`href="`)){
                    let lastElem = temparr[0].split('<')[temparr[0].split('<').length - 1]
                    if(lastElem.includes('class=')){
                      let tempClassArr = temparr[0].split('class="')
                      let tempClass = tempClassArr[tempClassArr.length - 1]
                      temp = temp.replace(tempClass+`{${key}}`, `torufhref_${key} `+ tempClass+unit[key]);

                    }
                    else{
                      let newClass = `class="torufhref_${key} href="${unit[key]}`
                      temp = temp.replace(`href="{${key}}`, newClass);
                      newTempArr = temparr[0].split()
                    }
                  }
                  else temp = temp.replace(`{${key}}`, unit[key]);
                })
                let initTemp = temp.split('>')[0]
                temp = temp.replace(initTemp+'>', initTemp+` id="torufobj_${key}">`)
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
