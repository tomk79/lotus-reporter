const assert = require('assert');
const fsEx = require('fs-extra');
const LotusCrawler = require('@tomk79/lotus-crawler');
const LotusReporter = require(__dirname + '/../node/main.js');
const lotus = new LotusCrawler({
	user_agent: 'Mozilla/5.0 Test Agent',
	ranges: [
		'http://127.0.0.1:3000/',
		'http://127.0.0.1:3001/',
		'http://127.0.0.1:3002/'
	],
	db: {
		prefix: 'LotusCrawlerTest',
	},
});
let serverProc;
const lotusReporter = new LotusReporter(lotus);

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

describe('Crawling', function() {

	it("Creating Instance", function(done) {
		this.timeout(60*1000);
		assert.equal(typeof(lotus), typeof({}));
		done();
	});

	it("Adding Target URL", function(done) {
		this.timeout(60*1000);
		lotus.add_target_url('http://127.0.0.1:3000/')
			.then(result => {
				assert.equal(result, true);
				done();
			});
	});

	it("Crawl", function(done) {
		this.timeout(60*1000);
		lotus.crawl()
			.then(() => {
				done();
			})
			.catch((message) => {
				console.error(message);
				done();
			});
	});
});

describe('Exporting', function() {

	it("Export", function(done) {
		this.timeout(60*1000);
		this.timeout(60*1000);
		lotusReporter.export(__dirname + '/app/export/', {
		})
			.then(() => {
				done();
			})
			.catch((message) => {
				console.error(message);
				done();
			});
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
