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

replaceComponents(parent, parent)

function replaceComponents(parentsArr, parent, component, callback){
    var compArray = [];
    fs.readdirSync('./toruf/components').forEach(function(filename){
      if(filename.includes(".html")){
        let name = filename.split('.html')[0];
        compArray.push(name);
      }
    });
    for(let comp of compArray){
      let tag = '#'+comp.toUpperCase();
      //read the component
      if(component.includes(tag)){
    //if the tag is equal to one of the parents throw an error
        //else
        //read the new component
        //replace 
        let newParent = component.replace(tag, newComponent)
        let newParentsArr = parentsArr.append(tag)
        replaceComponents(newParentsArr, newParent, newComp, callback)
      }
      else if(parent.includes(tag)){
        //read the new component
        let newComp = fs.readFileSync(tag)
        //if the tag is equal to one of the parents throw an error
        //else
        newParent = parent.replace(tag, newComp);
        ParentsArr = parentsArr
        replaceComponents(ParentsArr, newParent, newComp, callback)
      }
      else {
        callback
      }
    }
}



function recourseComponents(template, parents, callback) { 
  if(template.includes('<#')){
    //for each tag
      // read the component
      // add component to parents
      recurseComponents(htmlComp, parents, callback)
  } 
  else {
    //replace component into parent
    //repeat for new parent
    callback(null, template)
  }
}

function replaceComponents(template, callback){
  //read the component
  //if contains <# 
  //for each component
    //if the file contains the component
    recourseComponent( function(err, data){
      if(e)
    })  


	for(let i in compArray){
		if(!compArray[i]){
			callback(null, template)
		}
		else{
      //replace the component into the html template
      recurseComponents(template, parents, function(err, data){
        if(err) throw new Error(err)
        else{
          //replace component
        }
      }) 
		}
  }
  // else callback with template as is
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
  for(let index in compArray){
    let comp = compArray[index];
    let tag = '#'+comp.toUpperCase()
    if(template.includes(tag)){
      if(parents[comp]){
        throw new Error('warning: you cannot have a child component that calls its parent.')
      }
      else {
        let htmlComp = fs.readFileSync(`./toruf/components/${comp}.html`, 'utf8')
        parents[comp] = true;
        let start_tag = 
        `<!-- ${tag} -->
        `;
        let end_tag = 
        `
        <!-- !${tag} -->`;
        htmlComp = '<'+start_tag+'>' + htmlComp + '<'+end_tag+'>'; 
        template = template.replace(tag, htmlComp);
        //if component method exists
        //execute component method
        if(htmlComp.includes('<#')){
          htmlComp = replaceComponents(htmlComp, parents, callback)
        }
        else {
          callback(null, template)
        }
      }  
    }
    //check when loop ends
    if(index >= compArray.length-1){
      callback(null, template);
    }
  }
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