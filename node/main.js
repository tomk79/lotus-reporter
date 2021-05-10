module.exports = function( lotus ){
	const utils79 = require('utils79');
	const it79 = require('iterate79');
	const fsEx = require('fs-extra');

	this.export = function(){
		return new Promise( (rlv, rjt) => {
			rlv();
		} );
	}
	/**
	 * 収集したデータをファイルに出力する
	 */
	this.export = function( path_export_to, export_options ){
		export_options = export_options || {};

		const exporter = new (require('./exporter/exporter.js'))( lotus );
		return exporter.start( path_export_to, export_options );
	}

}
