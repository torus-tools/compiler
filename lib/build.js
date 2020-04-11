var fs = require('fs')
var attributeList = require('./attributeList')
//function  templateMethod()

module.exports = async function buildOuput(filename){
  if(filename.includes(".html")){
    let fileContent = await fs.promises.readFile(`./toruf/templates/${filename}`, 'utf8')
    let compFile = await replaceComponents(fileContent)
    let objFile = await replaceObjects(compFile)
    await fs.promises.writeFile(`site/${filename}`, objFile).then(console.log('All Done!'))
  }
}

function replaceComponents(template) { 
  return new Promise(async (resolve, reject) => {
    let newTemplate = template
    if(template.includes('<#')){
      var compArr = template.split('<#')
      for(let i=1;i<=compArr.length; i++) {
        if(!compArr[i]) {
          //console.log(newTemplate)
          resolve(newTemplate)
        }
        else{
          let compName = compArr[i].split('>')[0];
          let compFileName = compName.toLowerCase();
          //console.log(compFileName)
          let compFile = await fs.promises.readFile(`./toruf/components/${compFileName}/index.html`, 'utf8').catch((err)=>{reject(err)})
          if(compFile){
            let htmlComp = `\n<!-- #${compName} -->\n` + compFile + `\n<!-- !${compName} -->\n`;
            let comp_tag = `<#${compName}>`
            newTemplate = newTemplate.replace(comp_tag, htmlComp)
            //console.log(newTemplate)
          }
          else reject(`component ${compName} doesnt exist`)
        }
      }
    }
    else resolve(template)
  })
}


async function replaceObjects(template){
  return new Promise((resolve, reject) => {
    var objArray = [];
    fs.promises.readdir('./toruf/objects')
    .then((files)=>{
      files.forEach((filename) => {
        if(filename.includes(".json")){
          let name = filename.split('.json')[0];
          objArray.push(name);
        }
      })
    }).then(() => { 
      let newTemplate = template
      for(let i=0;i<=objArray.length;i++){
        if(i===objArray.length) {
          resolve(newTemplate)
          console.log(i)
        }
        else {
          let obj = objArray[i]
          let tag = obj.toUpperCase();
          if(newTemplate.includes(`<${tag}>`)){
            console.log(tag)
            let start_tag = `\n<!-- <${tag}> -->\n`;
            let end_tag = `\n<!-- </${tag}> -->\n`;
            let objTemplate = newTemplate.split(`<${tag}>`)[1].split(`</${tag}>`)[0];
            let htmlObj = "";
            if(objTemplate.includes('{{') && objTemplate.includes('}}')){
              let rawdata = fs.readFileSync(`./toruf/objects/${obj}.json`);
              let db = JSON.parse(rawdata)
              Object.keys(db).map((key, index)=>{
                let item = db[key]
                let temp = objTemplate;
                //insert ID in parent div toruf-OBJ-ID
                Object.keys(item).map((key, index)=>{
                  
                  if(temp.includes(`{{${key}}}`)){
                    console.log(key)
                    //console.log(key)
                    let temparr = temp.split(`{{${key}}}`)
                    //check if its an html attribute value
                    let beginAttr = temparr[0].substr(0, temparr[0].lastIndexOf('"'));
                    let endAttr = temparr[1].split('"')[1];
                    let newVal = `<span class="torufattr_${key}">${item[key]}</span>`
                    //console.log(newVal)
                    //conditions to check if the {{}} is inserted inside an html element
                    if(endAttr && beginAttr){
                      if(endAttr.startsWith(' ') && beginAttr.endsWith('=') || endAttr.startsWith('>') && beginAttr.endsWith('=')){    
                        let tag = beginAttr.substr(beginAttr.lastIndexOf(' ')+1).split('=')[0]
                        if(attributeList[tag]){
                          //check if element already has a class item
                          let lastElem = temparr[0].split('<')[temparr[0].split('<').length - 1]
                          if(lastElem.includes('class=')){
                            let tempClassArr = temparr[0].split('class="')
                            let tempClass = tempClassArr[tempClassArr.length - 1]
                            temp = temp.replace(tempClass+`{{${key}}}`, `toruf${tag}_${key} `+ tempClass+item[key]);
                          }
                          else temp = temp.replace(`${tag}="{{${key}}}`, `class="toruf${tag}_${key} href="${item[key]}`);
                        }
                        else reject(`warning invalid html attribute ${tag}`);
                      }
                      else temp = temp.replace(`{{${key}}}`, newVal);
                    }
                    else temp = temp.replace(`{{${key}}}`, newVal);
                  }
                })
                let initTemp = temp.split('>')[0]
                temp = temp.replace(initTemp+'>', initTemp+` id="torufobj_${key}">`)
                htmlObj+= temp;
              });
              let oldObj = `<${tag}>`+objTemplate+`</${tag}>`;
              newHtmlObj = start_tag + htmlObj + end_tag; 
              newTemplate = newTemplate.replace(oldObj, newHtmlObj);
            }
          }
        }
      }
    })
  })
}



/* function recourseComponents(parentsArr, parent, component, callback){
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
} */