/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DocumentColorCollection } from '../../src/colorselector/documentcolorcollection.js';
import { Collection } from '@ckeditor/ckeditor5-utils';

describe( 'DocumentColorCollection', () => {
	let documentColorCollection;

	const colors = [
		{
			color: '111'
		},
		{
			color: '222'
		},
		{
			color: '333'
		},
		{
			color: '444'
		}
	];

	beforeEach( () => {
		documentColorCollection = new DocumentColorCollection();

		colors.forEach( item => {
			documentColorCollection.add( item );
		} );
	} );

	it( 'constructor()', () => {
		expect( documentColorCollection ).toBeInstanceOf( DocumentColorCollection );
		expect( documentColorCollection ).toBeInstanceOf( Collection );
	} );

	it( 'has observable "isEmpty" parameter', () => {
		expect( documentColorCollection.isEmpty ).toBe( false );

		documentColorCollection.clear();
		expect( documentColorCollection.isEmpty ).toBe( true );

		documentColorCollection.add( colors[ 0 ] );
		expect( documentColorCollection.isEmpty ).toBe( false );
	} );

	it( 'prevent of adding duplicated colors', () => {
		expect( documentColorCollection.length ).toBe( 4 );

		documentColorCollection.add( { color: '111' } );
		expect( documentColorCollection.length ).toBe( 4 );
	} );

	it( 'hasColor()', () => {
		expect( documentColorCollection.hasColor( '111' ) ).toBe( true );
		expect( documentColorCollection.hasColor( '555' ) ).toBe( false );
	} );
} );
