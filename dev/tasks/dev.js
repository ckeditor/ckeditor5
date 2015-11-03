'use strict';

var tools = require( './utils/tools' );
var path = require( 'path' );
var ckeditor5Path = process.cwd();
var json = require( path.join( ckeditor5Path, 'package.json' ) );
var dependencies = json.dependencies;

module.exports = function( grunt ) {
	grunt.registerTask( 'dev', function( target ) {
		var pluginPath;

		switch ( target ) {
			case 'init':
				var ckeDependencies = tools.getCKEditorDependencies( dependencies );
				var regexp = /^ckeditor\//;
				var location = path.join( ckeditor5Path, '..' );

				if ( ckeDependencies ) {
					Object.keys( ckeDependencies ).forEach( function( name ) {
						// Check if CKEditor GitHub url.
						if ( regexp.test( ckeDependencies[ name ] ) ) {
							grunt.log.writeln( 'Clonning repository ' + ckeDependencies[ name ] + '...' );
							tools.cloneRepository( ckeDependencies[ name ], location );

							pluginPath = path.join( location, name );
							grunt.log.writeln( 'Linking ' + pluginPath + ' into ' + ckeditor5Path + '...' );
							tools.npmLink( pluginPath, ckeditor5Path, name );
						}
					} );
				}
				break;
		}
	} );
};

