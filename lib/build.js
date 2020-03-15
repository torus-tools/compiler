var fs = require('fs')
var attributeList = require('./attributeList')
//function  templateMethod()

module.exports = function buildOuput(filename){
  //read template
  if(filename.includes(".html")){
    fs.readFile(`./toruf/templates/${filename}`, 'utf8', function(err, fileContent){
      if(err) throw new Error(err)
      else{
        //replace components
        replaceComponents(fileContent, {}, function(err,data){
          if(err) throw new Error(err)
          else{
            //replace objects
            replaceObjects(fileContent, function(err,data){
              if(err) throw new Error(err)
              else{
                //if template method exists
                //execute template method
                fs.writeFileSync(`site/${filename}`, newFile)
                console.log('success');
                return 'success';
              }
            })
          }
        })
      }
    })
  }
}

function replaceComponents(template, parents, callback){
  //create an array of components
  var compArray = [];
  fs.readdirSync('./toruf/components').forEach(function(filename){
    if(filename.includes(".html")){
      let name = filename.split('.html')[0];
      compArray.push(name);
    }
  });
  for(let comp of compArray){
    let tag = '#'+comp.toUpperCase()
    if(template.includes(tag)){
      let htmlComp = fs.readFileSync(`./toruf/components/${comp}.html`, 'utf8')
      if(parents[comp]){
        throw new Error('warning: you cannot have a child component that calls its parent.')
      }
      else {
        parents[comp] = true;
        //if component method exists
        //execute component method
        if(htmlComp.includes('<#')){
          htmlComp = replaceComponents(htmlComp, parents, callback)
        }
        let start_tag = 
        `<!-- ${tag} -->
        `;
        let end_tag = 
        `
        <!-- !${tag} -->`;
        let htmlCom = '<'+start_tag+'>' + htmlComp + '<'+end_tag+'>'; 
        template = template.replace(tag, htmlCom);
      }  
    }
    //check when loop ends
  }
  callback(null, template);
}


function replaceObjects(template, callback){
  //create an array of objects
  var objArray = [];
  fs.readdirSync('./toruf/objects').forEach(function(filename){
    if(filename.includes(".json")){
      let name = filename.split('.json')[0];
      objArray.push(name);
    }
  });
  for(let obj of objArray){
    let tag = obj.toUpperCase();
    if(template.includes(`<${tag}>`)){
      let start_tag = 
      `<!-- <${tag}> -->
      `;
      let end_tag = 
      `
      <!-- </${tag}> -->`;
      let objTemplate = template.split(`<${tag}>`)[1].split(`</${tag}>`)[0];
      let htmlObj = "";
      if(objTemplate.includes('{{') && objTemplate.includes('}}')){
      let rawdata = fs.readFileSync(`./toruf/objects/${obj}.json`);
      let db = JSON.parse(rawdata)
      Object.keys(db).map(function(key, index){
        let item = db[key]
        let temp = objTemplate;
        //insert ID in parent div toruf-OBJ-ID
        Object.keys(item).map(function(key, index){
          let temparr = temp.split(`{{${key}}}`)
          //check if its an html attribute value
          let beginAttr = temparr[0].substr(0, temparr[0].lastIndexOf('"'));
          let endAttr = temparr[1].split('"')[1];
          if(endAttr.startsWith(' ') && beginAttr.endsWith('=') || endAttr.startsWith('>') && beginAttr.endsWith('=')){    
            //check for tag in attribute list
            let tag = beginAttr.substr(beginAttr.lastIndexOf(' '), beginAttr.length)
            console.log(tag)
            if(attributeList[tag]){
              //check if element already has a class item
              let lastElem = temparr[0].split('<')[temparr[0].split('<').length - 1]
              if(lastElem.includes('class=')){
                let tempClassArr = temparr[0].split('class="')
                let tempClass = tempClassArr[tempClassArr.length - 1]
                temp = temp.replace(tempClass+`{{${key}}}`, `toruf${tag}_${key} `+ tempClass+item[key]);
              }
              else{
                let newClass = `class="toruf${tag}_${key} href="${item[key]}`
                temp = temp.replace(`href="{{${key}}}`, newClass);
                newTempArr = temparr[0].split()
              }
            }
            else {
              throw new Error(`warning invalid html attribute ${tag}`);
            }
          }
          else {
            let newVal = `<span class="torufattr_${key}">${item[key]}</span>`
            temp = temp.replace(`{{${key}}}`, newVal);
          }
        })
        let initTemp = temp.split('>')[0]
        temp = temp.replace(initTemp+'>', initTemp+` id="torufobj_${key}">`)
        htmlObj+= temp;
      });
      let oldObj = `<${tag}>`+objTemplate+`</${tag}>`;
      newHtmlObj = start_tag + htmlObj + end_tag; 
      let newFile = template.replace(oldObj, newHtmlObj);
      callback(newFile)
      }
    }
  }
}