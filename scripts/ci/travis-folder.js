/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const crypto = require( 'crypto' );

/**
 * Allows enclosing part of console output on Travis CI in a foldable folder.
 * Execution time of the script within the folder will also be displayed.
 */
module.exports = class TravisFolder {
	constructor() {
		this._lastTimerId = null;
		this._lastStartTime = null;
	}

	start( badge, description ) {
		const nanoSeconds = process.hrtime.bigint();

		this._lastTimerId = crypto.createHash( 'md5' ).update( nanoSeconds.toString() ).digest( 'hex' );
		this._lastStartTime = nanoSeconds;

		console.log( `travis_fold:start:${ badge }` );
		console.log( `travis_time:start:${ this._lastTimerId }` );
		console.log( description );
	}

	end( badge ) {
		const travisEndTime = process.hrtime.bigint();
		const duration = travisEndTime - this._lastStartTime;

		console.log(
			`travis_time:end:${ this._lastTimerId }:` +
			`start=${ this._lastStartTime },finish=${ travisEndTime },duration=${ duration },event=${ badge }`
		);
		console.log( `travis_fold:end:${ badge }\n` );
	}
};
