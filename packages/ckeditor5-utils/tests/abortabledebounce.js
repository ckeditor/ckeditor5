/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import abortableDebounce from '../src/abortabledebounce.js';

describe( 'abortableDebounce()', () => {
	it( 'should forward arguments and return type', () => {
		const callback = sinon.stub();

		callback.onCall( 0 ).returns( 1 );
		callback.onCall( 1 ).returns( 2 );
		callback.returns( 3 );

		const abortable = abortableDebounce( callback );

		const result1 = abortable( 'a', 'b' );
		const result2 = abortable( 'x', 'y', 'z' );
		const result3 = abortable( 1, 2 );

		expect( result1, '1st result' ).to.equal( 1 );
		expect( result2, '2nd result' ).to.equal( 2 );
		expect( result3, '3rd result' ).to.equal( 3 );

		expect( callback.getCall( 0 ).args.length, '1st call, no. of args' ).to.equal( 3 );
		expect( callback.getCall( 0 ).args[ 0 ], '1st call, 1st arg' ).to.be.an.instanceof( AbortSignal );
		expect( callback.getCall( 0 ).args[ 1 ], '1st call, 2nd arg' ).to.equal( 'a' );
		expect( callback.getCall( 0 ).args[ 2 ], '1st call, 3rd arg' ).to.equal( 'b' );

		expect( callback.getCall( 1 ).args.length, '2nd call, no. of args' ).to.equal( 4 );
		expect( callback.getCall( 1 ).args[ 0 ], '2nd call, 1st arg' ).to.be.an.instanceof( AbortSignal );
		expect( callback.getCall( 1 ).args[ 1 ], '2nd call, 2nd arg' ).to.equal( 'x' );
		expect( callback.getCall( 1 ).args[ 2 ], '2nd call, 3rd arg' ).to.equal( 'y' );
		expect( callback.getCall( 1 ).args[ 3 ], '2nd call, 4rd arg' ).to.equal( 'z' );

		expect( callback.getCall( 2 ).args.length, '3rd call, no. of args' ).to.equal( 3 );
		expect( callback.getCall( 2 ).args[ 0 ], '3rd call, 1st arg' ).to.be.an.instanceof( AbortSignal );
		expect( callback.getCall( 2 ).args[ 1 ], '3rd call, 2nd arg' ).to.equal( 1 );
		expect( callback.getCall( 2 ).args[ 2 ], '3rd call, 3rd arg' ).to.equal( 2 );
	} );

	it( 'should abort previous call', () => {
		const signals = [];

		const abortable = abortableDebounce( s => signals.push( s ) );

		abortable();

		expect( signals[ 0 ].aborted, '1st call - current signal' ).to.be.false;

		abortable();

		expect( signals[ 0 ].aborted, '2nd call - previous signal' ).to.be.true;
		expect( signals[ 1 ].aborted, '2nd call - current signal' ).to.be.false;

		abortable();

		expect( signals[ 1 ].aborted, '3rd call - previous signal' ).to.be.true;
		expect( signals[ 2 ].aborted, '3rd call - current signal' ).to.be.false;
	} );

	it( '`abort()` should abort last call', () => {
		let signal;

		const abortable = abortableDebounce( s => {
			signal = s;
		} );

		abortable();

		expect( signal.aborted, 'before `abort()' ).to.be.false;

		abortable.abort();

		expect( signal.aborted, 'after `abort()`' ).to.be.true;

		abortable();

		expect( signal.aborted, 'after next call' ).to.be.false;
	} );

	it( 'should provide default abort reason', () => {
		const signals = [];

		const abortable = abortableDebounce( s => signals.push( s ) );

		abortable();
		abortable();
		abortable();
		abortable.abort();

		expect( signals[ 0 ].reason ).to.be.instanceof( DOMException );
		expect( signals[ 0 ].reason.name, '1st signal name' ).to.equal( 'AbortError' );
		expect( signals[ 1 ].reason ).to.be.instanceof( DOMException );
		expect( signals[ 1 ].reason.name, '2nd signal name' ).to.equal( 'AbortError' );
		expect( signals[ 2 ].reason ).to.be.instanceof( DOMException );
		expect( signals[ 2 ].reason.name, '3rd signal name' ).to.equal( 'AbortError' );
	} );
} );
