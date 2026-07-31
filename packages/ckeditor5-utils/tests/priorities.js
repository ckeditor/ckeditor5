/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, expect, it } from 'vitest';
import { priorities } from '../src/priorities.js';

describe( 'get', () => {
	it( 'should return correct value for string priority', () => {
		const priorityNames = Object.keys( priorities ).filter( name => name != 'get' );

		for ( const name of priorityNames ) {
			expect( priorities.get( name ) ).toEqual( priorities[ name ] );
		}
	} );

	it( 'should return value equal to normal for unrecognized string priority', () => {
		expect( priorities.get( 'foobar' ) ).toEqual( priorities.normal );
	} );

	it( 'should return passed number', () => {
		expect( priorities.get( 2 ) ).toEqual( 2 );
	} );
} );
