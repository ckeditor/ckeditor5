/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const crypto = require( 'crypto' );

module.exports = class Travis {
	constructor() {
		this._lastTimerId = null;
		this._lastStartTime = null;
	}

	foldStart( message ) {
		console.log( message );

		const nanoSeconds = process.hrtime.bigint();

		this._lastTimerId = crypto.createHash( 'md5' ).update( nanoSeconds.toString() ).digest( 'hex' );
		this._lastStartTime = nanoSeconds;

		// Intentional direct write to stdout, to manually control EOL.
		process.stdout.write( `travis_time:start:${ this._lastTimerId }\r\n` );
	}

	foldEnd( message ) {
		const travisEndTime = process.hrtime.bigint();
		const duration = travisEndTime - this._lastStartTime;

		// Intentional direct write to stdout, to manually control EOL.
		process.stdout.write(
			`\ntravis_time:end:${ this._lastTimerId }:start=${ this._lastStartTime },finish=${ travisEndTime },duration=${ duration }\r\n`
		);

		console.log( message );
	}
};
