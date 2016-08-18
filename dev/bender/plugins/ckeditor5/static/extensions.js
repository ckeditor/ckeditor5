/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* jshint node: false, browser: true, globalstrict: true, varstmt: false */
/* globals bender, requirejs */

'use strict';

( function() {
	// This seems to be the only way to force Require.JS to load modules starting with '/' from a different path.
	var load = requirejs.load;
	requirejs.load = function( context, moduleId, url ) {
		var basePath = bender.getCKEditorModuleBasePath().replace( /\/$/, '' );

		if ( moduleId[ 0 ] == '/' ) {
			url = basePath + url;
		}

		return load( context, moduleId, url );
	};

	require( [ '/ckeditor5/utils/ckeditorerror.js', 'chai' ], function( CKEditorError, chai ) {
		CKEditorError = CKEditorError.default;

		chai.use( function( _chai, utils ) {
			var Assertion = chai.Assertion;

			Assertion.addMethod( 'throwCKEditorError', assertThrows );

			function assertThrows( errMsg ) {
				var obj = utils.flag( this, 'object' ),
					actuallyGot = '' ,
					expectedThrown,
					thrown = false ,
					name = null ,
					thrownError = null,
					message;

				if ( arguments.length === 0 ) {
					errMsg = null;
				}

				try {
					obj();
				} catch ( err ) {
					// next, check constructor
					if (constructor) {
						this.assert(
							CKEditorError.isCKEditorError( err ),
							'expected #{this} to throw #{exp} but #{act} was thrown',
							'expected #{this} to not throw #{exp} but #{act} was thrown',
							'CKEditorError',
							(err instanceof Error ? err.toString() : err)
						);

						if ( !errMsg ) {
							utils.flag( this, 'object', err );
							return this;
						}
					}

					// next, check message
					message = utils.type( err ) === 'object' && 'message' in err ?
						err.message
						: '' + err;

					if ( ( message != null ) && errMsg && errMsg instanceof RegExp ) {
						this.assert(
							errMsg.exec( message ),
							'expected #{this} to throw error matching #{exp} but got #{act}',
							'expected #{this} to throw error not matching #{exp}',
							errMsg,
							message
						);

						utils.flag( this, 'object', err );

						return this;
					} else if ( ( message != null ) && errMsg && typeof errMsg == 'string' ) {
						this.assert(
							~message.indexOf( errMsg ),
							'expected #{this} to throw error including #{exp} but got #{act}',
							'expected #{this} to throw error not including #{act}',
							errMsg,
							message
						);

						utils.flag( this, 'object', err );

						return this;
					} else {
						thrown = true;
						thrownError = err;
					}
				}

				expectedThrown = 'an error';

				if ( thrown ) {
					actuallyGot = ' but #{act} was thrown'
				}

				this.assert(
					thrown === true ,
						'expected #{this} to throw ' + expectedThrown + actuallyGot ,
						'expected #{this} to not throw ' + expectedThrown + actuallyGot ,
						'CKEditorError',
						( thrownError instanceof Error ? thrownError.toString() : thrownError )
				);

				utils.flag( this, 'object', thrownError );
			};
		} );

		chai.expect( function() {
			throw new CKEditorError();
		} ).to.throwCKEditorError();

		chai.expect( function() {
			throw new Error();
		} ).to.not.throwCKEditorError();

		chai.expect( function() {
			throw new CKEditorError( 'custom message' );
		} ).to.throwCKEditorError( 'message' );

		chai.expect( function() {
			throw new CKEditorError( 'another msg' );
		} ).to.throwCKEditorError( /msg/ );
	} );

	// Reported: https://github.com/benderjs/benderjs/issues/248
	// Ugh... make some paths cleanup, because we need to combine these fragments and we don't want to
	// duplicate '/'. BTW. if you want to touch this make sure you haven't broken Bender jobs which
	// have different bender.basePaths (no trailing '/', unnecessary 'tests/' fragment).
	bender.getCKEditorModuleBasePath = function() {
		var appBasePath = bender.basePath;
		var ckeditorBasePath = bender.config.applications.ckeditor.basePath;
		var modulebasePath;

		modulebasePath = appBasePath
			.split( '/' )
			.filter( nonEmpty )
			// When running a job we need to drop the last parth of the base path, which is "tests".
			.slice( 0, -1 )
			.concat(
				ckeditorBasePath.split( '/' ).filter( nonEmpty )
			)
			.join( '/' );

		return '/' + modulebasePath;
	};

	function nonEmpty( str ) {
		return !!str.length;
	}
} )();
