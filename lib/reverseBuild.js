var fs = require('fs')

module.exports = function buildTemplate(filename){
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
  //read template
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
              let rePiece = start_tag + object + end_tag;
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
              let dbString =  JSON.stringify(db)
              dbString = dbString.replace(/,/g, ',\n').replace(/{/g, '{\n').replace(/}/g, '\n}')
              fs.writeFileSync(`objects/reverse${inst}.json`,dbString, 'utf8')
              //replace Object with object template
              console.log(inst)
              let frag1 = object.split('id="torufobj_')[0].split('<')[1]
              let beginFrag = '<' +frag1+'id="torufobj_'
              let endPosition = object.split('id="torufobj_')[1].lastIndexOf('<')
              let endFrag = object.split('id="torufobj_')[1].substr(0, endPosition)    
              let newPiece = beginFrag + endFrag
              if(object.includes('id="torufobj_')){
                let objId = newPiece.split('id="torufobj_')[1].split('"')[0];
                newPiece = newPiece.replace(`id="torufobj_${objId}"`, "")
              } 
              if(newPiece.includes('torufattr_')){
                let attrArr = newPiece.split('torufattr_');
                for(let j=1; j<attrArr.length; j++){
                  let attrId = attrArr[j].split('"')[0];
                  let attrVal = attrArr[j].split('>')[1].split('<')[0];
                  newPiece = newPiece.replace(`<span class="torufattr_${attrId}">${attrVal}</span>`, `{${attrId}}`)
                }
              }
              if(newPiece.includes('torufhref_')){
                let attrArr = newPiece.split('torufhref_');
                for(let j=1; j<attrArr.length; j++){
                  let attrId = attrArr[j].split(' ')[0];
                  let attrVal = attrArr[j].split('href="')[1].split('"')[0];
                  newPiece = newPiece.replace(attrVal, `{${attrId}}`);
                }
              }
              let objstart_tag = `<${inst.toUpperCase()}>
              `;
              let objend_tag = `
              </${inst.toUpperCase()}>`;
              let objTemplate = objstart_tag + newPiece + objend_tag;
              originFile = originFile.replace(rePiece, objTemplate)
            }
          }
        } 
        //replace components
        for(let comp of compArray){
          let tag = `<#${comp.toUpperCase()}>`
          if(originFile.includes(`<!-- ${tag} -->`)){
            let component = originFile.split(`<!-- ${tag} -->`)[1].split(`<!-- !${tag} -->`)[0];
            //save component
            fs.writeFileSync(`components/reverse${comp}.html`, component)
            let piece = `<!-- ${tag} -->` + component + `<!-- !${tag} -->`;
            originFile = originFile.replace(piece, tag);
          }
        }
        //console.log(originFile)
        //save file
        fs.writeFileSync(`templates/reverse${filename}`, originFile, 'utf8')
      }
    })
  }
}
