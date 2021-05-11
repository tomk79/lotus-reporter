module.exports = function( main ){
	const fs = require('fs');
	const fsEx = require('fs-extra');
	const it79 = require('iterate79');
	const utils79 = require('utils79');
	const options = main.get_options();
	const _this = this;
	this.path_export_to = null;
	this.export_options = {};

	let contents_count = 0;

	/**
	 * エクスポートを開始する
	 */
	this.start = function(path_export_to, export_options){
		console.log('============= starting Export:');
		console.log('  Export to:', path_export_to);
		console.log('  Export Options:', export_options);
		console.log('  ------');

		return new Promise( (rlv, rjt) => {

			try {
				if( !fsEx.existsSync( path_export_to ) ){
					if( !fsEx.mkdirSync( path_export_to ) ){
						rjt( 'Failed to mkdir: ' + path_export_to );
						return;
					}
				}
				path_export_to = path_export_to.replace( /[\/\\]*$/, '/' );
				if( !path_export_to.match( /\/$/ ) ){
					path_export_to += '/';
				}

				this.path_export_to = path_export_to;
				this.export_options = export_options;

				// console.log( path_export_to );
			} catch(e){
				rjt( 'Failed to Export:' + e.message );
				return;
			}

			it79.fnc({}, [
				function( it1 ){
					// 総ファイル数を取得
					main.count().then((result) => {
						console.log('Total count:', result);
						contents_count = result;
						it1.next();
					});
				},
				function(it1){
					main.each( function( uriInfo, next ){
						export_one(uriInfo)
							.then( () => {
								next();
							} )
						;
					} )
						.then( () => {
							it1.next();
						} );

				},
				function(it1){
					// index.html を生成
					generate_index()
						.then( () => {
							it1.next();
						} );
				},
				function(){
					rlv();
				}
			]);
		});
	}



	/**
	 * ファイル1件毎の出力処理
	 */
	async function export_one(urlInfo){
		return new Promise( (rlv, rjt) => {
			console.log();
			console.log('--------', urlInfo.scheme + '://' + urlInfo.host + urlInfo.path);

			if( !urlInfo.status ){
				console.error('not done.');
				console.log();
				rlv();
				return;
			}

			if( urlInfo.result == 'ignored' ){
				console.error('Ignored URI.');
				console.log();
				rlv();
				return;
			}

			if( urlInfo.response_status == 404 ){
				console.error('URL not found.');
				console.log();
				rlv();
				return;
			}

			if( urlInfo.response_status >= 300 && urlInfo.response_status <= 399 ){
				console.error('Redirect.');
				console.log();
				rlv();
				return;
			}

			let dirname_hostname,
				newFilePath,
				parsedUrl;

			it79.fnc({}, [
				function(it1){

					let tmpHostName = urlInfo.host.split(/[^a-zA-Z0-9\_\-\.]/).join('___');

					dirname_hostname = urlInfo.scheme + '---' + tmpHostName;

					parsedUrl = new URL(urlInfo.scheme + '://' + urlInfo.host + urlInfo.path);
					// console.log( parsedUrl );

					newFilePath = dirname_hostname + parsedUrl.pathname;
					if( newFilePath.match(/\/$/) ){
						newFilePath += 'index.html';
					}

					it1.next();
				},
				function(it1){
					// console.log(newFilePath);
					let dirname = newFilePath.replace(/\/[^\/]*$/, '/');
					fsEx.mkdirpSync(_this.path_export_to + dirname);


					let bin = (new Buffer(urlInfo.response_body_base64, 'base64'));
					fs.writeFileSync( _this.path_export_to + newFilePath, bin, {} );

					it1.next();
				},
				function(){
					console.log();
					rlv();
				}
			]);

		});
	}

	/**
	 * index.html を生成する
	 */
	async function generate_index(){
		return new Promise( (rlv, rjt) => {

			it79.fnc({}, [
				function(it1){
					fsEx.mkdirpSync(_this.path_export_to);
					fsEx.mkdirpSync(_this.path_export_to + '/index_files/');
					it1.next();
				},
				function(it1){
					fsEx.copySync(
						__dirname + '/../../dist/lotus-reporter.js',
						_this.path_export_to + '/index_files/lotus-reporter.js'
					);
					fsEx.copySync(
						__dirname + '/../../dist/lotus-reporter.css',
						_this.path_export_to + '/index_files/lotus-reporter.css'
					);
					it1.next();
				},
				function(it1){
					// console.log(newFilePath);

					let bin = '';
					bin += '<!DOCTYPE html>'+"\n";
					bin += '<html>'+"\n";
					bin += '<head>'+"\n";
					bin += '<meta charset="utf-8" />'+"\n";
					bin += '<title>Lotus Reporter</title>'+"\n";
					bin += '<link rel="stylesheet" href="./index_files/lotus-reporter.css" />'+"\n";
					bin += '</head>'+"\n";
					bin += '<body>'+"\n";
					bin += '<p>TODO: 開発中; count: '+ contents_count +'</p>'+"\n";
					bin += '<script src="./index_files/lotus-reporter.js"></script>'+"\n";
					bin += '</body>'+"\n";
					bin += '</html>'+"\n";
					fs.writeFileSync( _this.path_export_to + '/index.html', bin, {} );

					it1.next();
				},
				function(){
					console.log();
					rlv();
				}
			]);

		});
	}

}
