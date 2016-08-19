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

	// Extend ChaiJS with custom exception check.
	require( [ '/ckeditor5/utils/ckeditorerror.js', 'chai' ], function( CKEditorError, chai ) {
		CKEditorError = CKEditorError.default;

		// Load extension and bind class used to check for inheritance.
		chai.use( addThrowsCKEditorError.bind( null, CKEditorError ) );

		// Self-test of the extension. Function names will help find those tests in case of regression.
		chai.expect( function throwCKEditorErrorSelfTest1() {
			throw new CKEditorError();
		} ).to.throwCKEditorError();

		chai.expect( function throwCKEditorErrorSelfTest2() {
			throw new Error();
		} ).to.not.throwCKEditorError();

		chai.expect( function throwCKEditorErrorSelfTest3() {
			throw new CKEditorError( 'custom message' );
		} ).to.throwCKEditorError( 'message' );

		chai.expect( function throwCKEditorErrorSelfTest4() {
			throw new CKEditorError( 'another msg' );
		} ).to.throwCKEditorError( /msg/ );

		chai.expect( function throwCKEditorErrorSelfTest5() {
			throw new CKEditorError( 'another msg' );
		} ).to.throwCKEditorError( /^another/ );

		chai.expect( function throwCKEditorErrorSelfTest6() {
			throw new CKEditorError( 'another msg' );
		} ).to.throwCKEditorError( /msg$/ );
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

	// Add `throwCKEditorError` chainable method to ChaiJS.
	//
	// @param {Object} CKEditorError Constructor of class checking for CKEditorError membership.
	// @param {Object} _chai Chai instance.
	// @param {Object} utils Chai extension utils.
	// @returns {Object} Assertion
	function addThrowsCKEditorError( CKEditorError, _chai, utils ) {
		var Assertion = _chai.Assertion;

		Assertion.addMethod( 'throwCKEditorError', assertThrowCKEditorError );

		function assertThrowCKEditorError( errMsg ) {
			// jshint validthis: true
			// jscs:disable disallowMultipleVarDecl

			var obj = utils.flag( this, 'object' ),
				actuallyGot = '' ,
				thrown = false ,
				thrownError = null,
				message;

			if ( arguments.length === 0 ) {
				errMsg = null;
			}

			try {
				obj();
			} catch ( err ) {
				this.assert(
					CKEditorError.isCKEditorError( err ),
					'expected #{this} to throw #{exp} but #{act} was thrown',
					'expected #{this} to not throw #{exp} but #{act} was thrown',
					'CKEditorError',
					( err instanceof Error ? err.toString() : err )
				);

				// Set subject of assertion.
				if ( !errMsg ) {
					utils.flag( this, 'object', err );

					return this;
				}

				// Check message of error.
				message = utils.type( err ) === 'object' && 'message' in err ? err.message : err.toString();

				if ( ( message !== null && message !== undefined ) && errMsg && errMsg instanceof RegExp ) {
					this.assert(
						errMsg.exec( message ),
						'expected #{this} to throw error matching #{exp} but got #{act}',
						'expected #{this} to throw error not matching #{exp}',
						errMsg,
						message
					);

					utils.flag( this, 'object', err );

					return this;
				} else if ( ( message !== null && message !== undefined ) && errMsg && typeof errMsg == 'string' ) {
					this.assert(
						message.indexOf( errMsg ) !== -1,
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

			if ( thrown ) {
				actuallyGot = ' but #{act} was thrown';
			}

			this.assert(
				thrown === true ,
					'expected #{this} to throw an error' + actuallyGot ,
					'expected #{this} to not throw an error' + actuallyGot ,
					'CKEditorError',
					( thrownError instanceof Error ? thrownError.toString() : thrownError )
			);

			utils.flag( this, 'object', thrownError );

			return this;
		}
	}
} )();
