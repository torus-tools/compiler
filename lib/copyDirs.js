function recurseFolder(currentDirPath, destination, callback) {
	fs.readdirSync(currentDirPath).forEach(function (name) {
		var filePath = `${currentDirPath}/${name}`;
		let newDest = `${destination}/${name}`
		var stat = fs.statSync(filePath);
		if (stat.isFile()) callback(filePath, newDest);
		else if (stat.isDirectory()) {
			createDir(newDest, function(err, data){
				if(err) optionError(err, callback)
				else recurseFolder(filePath, newDest, callback);
			})
		}
	});
}

function copyModules(destination, callback){
	//console.log('Copying modules...')
	let npmPacks = ['uuid', 'axios', 'follow-redirects', 'debug', 'ms']
	for(let i=0; i<=npmPacks.length; i++){
		if(!npmPacks[i]){
			callback(null, 'finished copying modules')
		}
		else{
			let pack = npmPacks[i];
			let origin = `./node_modules/${pack}`
			if(fs.existsSync('./node_modules/super-easy-forms')){
				origin = `./node_modules/${pack}`;
			}
			let dest = `${destination}/${pack}`
			createDir(dest, function(err, data){
				if(err) optionError(err, callback)
				else{
					recurseFolder(origin, dest, function(filePath, newDest) {
						fs.copyFileSync(filePath, newDest)
					})
				}
			})
		}
	}
}