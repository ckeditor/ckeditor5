/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import DocumentColorCollection from '../../src/colorselector/documentcolorcollection.js';
import Collection from '@ckeditor/ckeditor5-utils/src/collection.js';

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
		expect( documentColorCollection ).to.be.instanceOf( DocumentColorCollection );
		expect( documentColorCollection ).to.be.instanceOf( Collection );
	} );

	it( 'has observable "isEmpty" parameter', () => {
		expect( documentColorCollection.isEmpty ).to.be.false;

		documentColorCollection.clear();
		expect( documentColorCollection.isEmpty ).to.be.true;

		documentColorCollection.add( colors[ 0 ] );
		expect( documentColorCollection.isEmpty ).to.be.false;
	} );

	it( 'prevent of adding duplicated colors', () => {
		expect( documentColorCollection.length ).to.equal( 4 );

		documentColorCollection.add( { color: '111' } );
		expect( documentColorCollection.length ).to.equal( 4 );
	} );

	it( 'hasColor()', () => {
		expect( documentColorCollection.hasColor( '111' ) ).to.be.true;
		expect( documentColorCollection.hasColor( '555' ) ).to.be.false;
	} );
} );
