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
  fs.readdirSync('output').forEach(function(filename){
    if(filename.includes(".html")){
      fs.readFile(`output/${filename}`, 'utf8', function(err, originFile){
        if(err) throw new Error(err)
        else{
          if(originFile.includes('<!-- <')){
            //for each model
            for(let inst of objArray){
              let start_tag = `<!-- <${inst.toUpperCase()}> -->`;
              let end_tag = `<!-- </${inst.toUpperCase()}> -->`;
              if(originFile.includes(start_tag)){
                let object = originFile.split(start_tag)[1].split(end_tag)[0];
                let piece = start_tag + object + end_tag;
                let rawdata = fs.readFileSync(`objects/${inst}.json`);
                let db = JSON.parse(rawdata)
                if(object.includes('id="torufobj_')){
                  let objArr = originFile.split('id="torufobj_')
                  //update all objects
                  for(let i=1; i<objArr.length; i++){
                    let objId = objArr[i].split('"')[0];
                    let innerObj = {}
                    let subFrag = objArr[i]
                    if(subFrag.includes('torufattr_')){
                      let attrArr = subFrag.split('torufattr_');
                      for(let j=1; j<attrArr.length; j++){
                        let attrId = attrArr[j].split('"')[0];
                        let attrVal = attrArr[j].split('>')[1].split('<')[0];
                        innerObj[attrId] = attrVal;
                      }
                    }
                    if(subFrag.includes('torufhref_')){
                      let attrArr = subFrag.split('torufhref_');
                      for(let j=1; j<attrArr.length; j++){
                        let attrId = attrArr[j].split(' ')[0];
                        let attrVal = attrArr[j].split('href="')[1].split('"')[0];
                        innerObj[attrId] = attrVal;
                      }
                    }
                    db[objId] = innerObj;
                  }
                }
                //writeFile
                //fs.writeFileSync(`objects/${inst}.json`, db)
                //replace Object with object template
                let frag1 = object.split('id="torufobj_')[0].split('<')[1]
                let beginFrag = '<' +frag1+'id="torufobj_'
                let endPosition = object.split('id="torufobj_')[1].lastIndexOf('<')
                console.log(endPosition)
                let endFrag = object.split('id="torufobj_')[1].substr(0, endPosition)    
                console.log(beginFrag + endFrag)
              }
            }
          } 

          //replace components
          for(let comp of compArray){
            let htmlComp = fs.readFileSync(`components/${comp}.html`, 'utf8')
            let tag = `<#${comp.toUpperCase()}>`
            if(originFile.includes(`<!-- ${tag} -->`)){
              //console.log(tag)
              let objTemplate = originFile.split(`<!-- ${tag} -->`)[1].split(`<!-- !${tag} -->`)[0];
              let piece = `<!-- ${tag} -->` + objTemplate + `<!-- !${tag} -->`;
              originFile = originFile.replace(piece, tag);
            }
          }

        }
      })
    }
  });
}

replaceObjects()
