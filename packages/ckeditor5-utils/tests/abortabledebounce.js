/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi } from 'vitest';

import { abortableDebounce } from '../src/abortabledebounce.js';

describe( 'abortableDebounce()', () => {
	it( 'should forward arguments and return type', () => {
		const callback = vi.fn();

		callback
			.mockReturnValueOnce( 1 )
			.mockReturnValueOnce( 2 )
			.mockReturnValue( 3 );

		const abortable = abortableDebounce( callback );

		const result1 = abortable( 'a', 'b' );
		const result2 = abortable( 'x', 'y', 'z' );
		const result3 = abortable( 1, 2 );

		expect( result1, '1st result' ).toBe( 1 );
		expect( result2, '2nd result' ).toBe( 2 );
		expect( result3, '3rd result' ).toBe( 3 );

		expect( callback.mock.calls[ 0 ].length, '1st call, no. of args' ).toBe( 3 );
		expect( callback.mock.calls[ 0 ][ 0 ], '1st call, 1st arg' ).toBeInstanceOf( AbortSignal );
		expect( callback.mock.calls[ 0 ][ 1 ], '1st call, 2nd arg' ).toBe( 'a' );
		expect( callback.mock.calls[ 0 ][ 2 ], '1st call, 3rd arg' ).toBe( 'b' );

		expect( callback.mock.calls[ 1 ].length, '2nd call, no. of args' ).toBe( 4 );
		expect( callback.mock.calls[ 1 ][ 0 ], '2nd call, 1st arg' ).toBeInstanceOf( AbortSignal );
		expect( callback.mock.calls[ 1 ][ 1 ], '2nd call, 2nd arg' ).toBe( 'x' );
		expect( callback.mock.calls[ 1 ][ 2 ], '2nd call, 3rd arg' ).toBe( 'y' );
		expect( callback.mock.calls[ 1 ][ 3 ], '2nd call, 4rd arg' ).toBe( 'z' );

		expect( callback.mock.calls[ 2 ].length, '3rd call, no. of args' ).toBe( 3 );
		expect( callback.mock.calls[ 2 ][ 0 ], '3rd call, 1st arg' ).toBeInstanceOf( AbortSignal );
		expect( callback.mock.calls[ 2 ][ 1 ], '3rd call, 2nd arg' ).toBe( 1 );
		expect( callback.mock.calls[ 2 ][ 2 ], '3rd call, 3rd arg' ).toBe( 2 );
	} );

	it( 'should abort previous call', () => {
		const signals = [];

		const abortable = abortableDebounce( s => signals.push( s ) );

		abortable();

		expect( signals[ 0 ].aborted, '1st call - current signal' ).toBe( false );

		abortable();

		expect( signals[ 0 ].aborted, '2nd call - previous signal' ).toBe( true );
		expect( signals[ 1 ].aborted, '2nd call - current signal' ).toBe( false );

		abortable();

		expect( signals[ 1 ].aborted, '3rd call - previous signal' ).toBe( true );
		expect( signals[ 2 ].aborted, '3rd call - current signal' ).toBe( false );
	} );

	it( '`abort()` should abort last call', () => {
		let signal;

		const abortable = abortableDebounce( s => {
			signal = s;
		} );

		abortable();

		expect( signal.aborted, 'before `abort()' ).toBe( false );

		abortable.abort();

		expect( signal.aborted, 'after `abort()`' ).toBe( true );

		abortable();

		expect( signal.aborted, 'after next call' ).toBe( false );
	} );

	it( 'should provide default abort reason', () => {
		const signals = [];

		const abortable = abortableDebounce( s => signals.push( s ) );

		abortable();
		abortable();
		abortable();
		abortable.abort();

		expect( signals[ 0 ].reason ).toBeInstanceOf( DOMException );
		expect( signals[ 0 ].reason.name, '1st signal name' ).toBe( 'AbortError' );
		expect( signals[ 1 ].reason ).toBeInstanceOf( DOMException );
		expect( signals[ 1 ].reason.name, '2nd signal name' ).toBe( 'AbortError' );
		expect( signals[ 2 ].reason ).toBeInstanceOf( DOMException );
		expect( signals[ 2 ].reason.name, '3rd signal name' ).toBe( 'AbortError' );
	} );
} );
