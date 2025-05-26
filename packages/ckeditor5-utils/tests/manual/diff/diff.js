/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import diff from '../../../src/diff.js';
import getLongText from '../../_utils/longtext.js';

// Tests
setTimeout( () => {
	console.log( 'Testing... (t1 length - t2 length - avg time - times)' );

	execTime( getLongText( 300 ), getLongText( 700, false, true ) );
	execTime( getLongText( 350 ), getLongText( 700, false, true ) );
	execTime( getLongText( 400 ), getLongText( 700, false, true ) );
	execTime( getLongText( 450 ), getLongText( 700, false, true ) );

	execTime( getLongText( 300 ), getLongText( 800, false, true ) );
	execTime( getLongText( 350 ), getLongText( 800, false, true ) );
	execTime( getLongText( 400 ), getLongText( 800, false, true ) );
	execTime( getLongText( 450 ), getLongText( 800, false, true ) );

	execTime( getLongText( 300 ), getLongText( 900, false, true ) );
	execTime( getLongText( 350 ), getLongText( 900, false, true ) );
	execTime( getLongText( 400 ), getLongText( 900, false, true ) );
	execTime( getLongText( 450 ), getLongText( 900, false, true ) );

	execTime( getLongText( 300 ), getLongText( 1000, false, true ) );
	execTime( getLongText( 350 ), getLongText( 1000, false, true ) );
	execTime( getLongText( 400 ), getLongText( 1000, false, true ) );
	execTime( getLongText( 450 ), getLongText( 1000, false, true ) );

	execTime( getLongText( 300 ), getLongText( 1200, false, true ) );
	execTime( getLongText( 350 ), getLongText( 1200, false, true ) );
	execTime( getLongText( 400 ), getLongText( 1200, false, true ) );
	execTime( getLongText( 450 ), getLongText( 1200, false, true ) );

	execTime( getLongText( 300 ), getLongText( 1500, false, true ) );
	execTime( getLongText( 350 ), getLongText( 1500, false, true ) );
	execTime( getLongText( 400 ), getLongText( 1500, false, true ) );
	execTime( getLongText( 450 ), getLongText( 1500, false, true ) );
}, 500 );

// Helpers
function execTime( text1, text2 ) {
	const times = [];

	for ( let i = 0; i < 15; i++ ) {
		const start = Number( new Date() );

		diff( text1, text2 );

		times.push( Number( new Date() ) - start );
	}

	console.log( 'l1: ' + text1.length, 'l2: ' + text2.length,
		'avg: ' + Math.round( times.reduce( ( a, b ) => a + b, 0 ) / times.length ) + 'ms', times );
}
