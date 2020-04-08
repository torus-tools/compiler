var fs = require('fs')
var attributeList = require('./attributeList')
//function  templateMethod()

module.exports = function buildOuput(filename){
  //read template
  console.log(filename)
  if(filename.includes(".html")){
    fs.readFile(`./toruf/templates/${filename}`, 'utf8', function(err, fileContent){
      if(err) throw new Error(err)
      else{
        //replace components
        replaceComponents(fileContent, {}, function(err,template){
          if(err) throw new Error(err)
          else{
            //replace objects
            replaceObjects(template, function(err, newFile){
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

function recourseComponents(parentsArr, parent, component, callback){
    var compArray = [];
    fs.readdirSync('./toruf/components').forEach(function(filename){
      if(filename.includes(".html")){
        let name = filename.split('.html')[0];
        compArray.push(name);
      }
    });
    for(let comp of compArray){
      let tag = '#'+comp.toUpperCase();
      let start_tag = 
      `<!-- ${tag} -->
      `;
      let end_tag = 
      `
      <!-- !${tag} -->`;
      if(typeof component === 'String'){
        if(component.includes(`<${tag}>`)){
          if(parentsArr.includes(comp)){
            throw new Error('warning: you cannot have a child component that calls its parent.')
          }
          else {
            let newComp = fs.readFileSync(`./toruf/components/${comp}.html`)
            let htmlComp = '<'+start_tag+'>' + newComp + '<'+end_tag+'>'; 
            let newParent = component.replace(tag, htmlComp)
            let newParentsArr = parentsArr.append(comp)
            recourseComponents(newParentsArr, newParent, newComp, callback)
          }
        }
      }
      else if(parent.includes(tag)){
        if(parentsArr.includes(tag)){
          throw new Error('warning: you cannot have a child component that calls its parent.')
        }
        else {
          let newComp = fs.readFileSync(`./toruf/components/${comp}.html`)
          let htmlComp = '<'+start_tag+'>' + newComp + '<'+end_tag+'>'; 
          let newParent = parent.replace(tag, htmlComp)
          recourseComponents(parentsArr, newParent, newComp, callback)
        }
      }
      else {
        callback(null, parent)
      }
    }
}



function replaceComponents(template, parents, callback) { 
  if(template.includes('<#')){
    //console.log(template)
    var compArray = [];
    fs.readdirSync('./toruf/components').forEach(function(filename){
      if(filename.includes(".html")){
        let name = filename.split('.html')[0];
        compArray.push(name);
      }
    });
    for(let i=0; i<=compArray.length; i++){
      if(!compArray[i]){
        callback(null, template)
      }
      else{
        let tag = '#'+compArray[i].toUpperCase();
        let start_tag = 
        `<!-- ${tag} -->
        `;
        let end_tag = 
        `
        <!-- !${tag} -->`;
        let comp_tag = `<${tag}>`
        let comp = fs.readFileSync(`./toruf/components/${compArray[i]}.html`)
        let htmlComp = start_tag + comp + end_tag; 
        template = template.replace(comp_tag, htmlComp)
        
          /* if(template.includes(tag)){
              recourseComponents([], template, parents, function(err, data){
                if(err) throw new Error(err)
                else{
                  //replace component
                  template.replace(tag, data)
                }
              })
            }  */
          }
    }
  } 
}


function replaceObjects(template, callback){
  console.log('HELLo')
  //create an array of objects
  var objArray = [];
  fs.readdirSync('./toruf/objects').forEach(function(filename){
    if(filename.includes(".json")){
      let name = filename.split('.json')[0];
      objArray.push(name);
    }
  });
  for(let obj of objArray){
    console.log(obj)
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
        console.log(key)
        let item = db[key]
        let temp = objTemplate;
        //insert ID in parent div toruf-OBJ-ID
        Object.keys(item).map(function(key, index){
          console.log(key)
          if(objTemplate.includes(`{{${key}}}`)){
            let temparr = temp.split(`{{${key}}}`)
            //check if its an html attribute value
            //console.log(temparr)
            let beginAttr = temparr[0].substr(0, temparr[0].lastIndexOf('"'));
            //console.log(temparr)
            let endAttr = temparr[1].split('"')[1];
            if(endAttr.startsWith(' ') && beginAttr.endsWith('=') || endAttr.startsWith('>') && beginAttr.endsWith('=')){    
              //check for tag in attribute list
              let tag = beginAttr.substr(beginAttr.lastIndexOf(' ')+1).split('=')[0]
              console.log('TAG ', tag)
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
                  temp = temp.replace(`${tag}="{{${key}}}`, newClass);
                  //newTempArr = temparr[0].split()
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
          }
        })
        let initTemp = temp.split('>')[0]
        temp = temp.replace(initTemp+'>', initTemp+` id="torufobj_${key}">`)
        htmlObj+= temp;
      });
      let oldObj = `<${tag}>`+objTemplate+`</${tag}>`;
      newHtmlObj = start_tag + htmlObj + end_tag; 
      let newFile = template.replace(oldObj, newHtmlObj);
      console.log(newHtmlObj)
      callback(null, newFile)
      }
    }
  }
}