const assert = require('assert');
const fsEx = require('fs-extra');

describe('Starting test server', function() {

	it("Server Start", function(done) {
		this.timeout(60*1000);
		serverProc = require('child_process').spawn('node', [__dirname + '/app/server/server.js']);
		serverProc.stdout.on('data', function(data){
			console.log(data.toString());
		});
		serverProc.stderr.on('data', function(data){
			console.error(data.toString());
		});
		serverProc.on('close', function(code){
			console.log('------ server closed with:', code);
		});
		setTimeout(function(){
			done();
		}, 5000);
	});

});

describe('Test', function() {

	it("Test", function(done) {
		this.timeout(60*1000);
		assert.equal(1, 1);
		done();
	});

});

describe('Shutting down test server', function() {

	it("Server Stop", function(done) {
		process.kill(serverProc.pid);
		setTimeout(function(){
			done();
		}, 10);
	});

	it("(Remove SQLite database)", function(done) {
		this.timeout(60*1000);
		let pathSqliteDb = __dirname + '/../.lotus-crawler/database.sqlite';
		try{
			if( fsEx.existsSync(pathSqliteDb) ){
				let result = fsEx.unlinkSync(pathSqliteDb);
				// console.log('removing database:', result);
			}
		}catch(e){
			console.error(e);
		}
		setTimeout(function(){
			done();
		}, 1000);
	});

});
