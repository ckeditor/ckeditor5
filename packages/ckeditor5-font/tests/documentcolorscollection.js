/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import DocumentColorsCollection from '../src/documentcolorscollection';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';

describe( 'DocumentColorsCollection', () => {
	let documentColorsCollection;

	const colors = [
		{
			color: '111',
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
		documentColorsCollection = new DocumentColorsCollection();

		colors.forEach( item => {
			documentColorsCollection.add( item );
		} );
	} );

	it( 'constructor()', () => {
		expect( documentColorsCollection ).to.be.instanceOf( DocumentColorsCollection );
		expect( documentColorsCollection ).to.be.instanceOf( Collection );
	} );

	it( 'has observable "isEmpty" parameter', () => {
		expect( documentColorsCollection.isEmpty ).to.be.false;

		documentColorsCollection.clear();
		expect( documentColorsCollection.isEmpty ).to.be.true;

		documentColorsCollection.add( colors[ 0 ] );
		expect( documentColorsCollection.isEmpty ).to.be.false;
	} );

	it( 'prevent of adding duplicated colors', () => {
		expect( documentColorsCollection.length ).to.equal( 4 );

		documentColorsCollection.add( { color: '111' } );
		expect( documentColorsCollection.length ).to.equal( 4 );
	} );

	it( 'hasColor()', () => {
		expect( documentColorsCollection.hasColor( '111' ) ).to.be.true;
		expect( documentColorsCollection.hasColor( '555' ) ).to.be.false;
	} );
} );
