/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, expect, it } from 'vitest';
import { parseBase64EncodedObject } from '../src/parsebase64encodedobject.js';

describe( 'parseBase64EncodedObject', () => {
	it( 'should return a decoded object', () => {
		const obj = { foo: 1 };
		const encoded = btoa( JSON.stringify( obj ) );

		expect( parseBase64EncodedObject( encoded ) ).toEqual( obj );
	} );

	it( 'should return null if it is not an object', () => {
		const str = 'foo';
		const encoded = btoa( JSON.stringify( str ) );

		expect( parseBase64EncodedObject( encoded ) ).toBeNull();
	} );

	it( 'should return null of it is not parsable', () => {
		const encoded = btoa( '{"foo":1' );

		expect( parseBase64EncodedObject( encoded ) ).toBeNull();
	} );

	it( 'should use base64Safe variant of encoding', () => {
		const encoded = 'eyJmb28iOiJhYmNkZW/n+Glqa2xtbm8ifQ==';

		expect( parseBase64EncodedObject( encoded ) ).toEqual( { foo: 'abcdeoçøijklmno' } );
	} );
} );
