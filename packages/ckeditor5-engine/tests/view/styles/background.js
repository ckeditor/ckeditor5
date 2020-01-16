/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import StylesMap, { StylesProcessor } from '../../../src/view/stylesmap';
import { addBackgroundRules } from '../../../src/view/styles/background';

describe( 'Background styles normalization', () => {
	let styles;

	before( () => {
		const stylesProcessor = new StylesProcessor();
		StylesMap._setProcessor( stylesProcessor );
		addBackgroundRules( stylesProcessor );
	} );

	beforeEach( () => {
		styles = new StylesMap();
	} );

	it( 'should normalize background', () => {
		// TODO: border-box given only for coverage test.
		styles.setTo( 'background:url("example.jpg") center #f00 repeat-y fixed border-box;' );

		expect( styles.getNormalized( 'background' ) ).to.deep.equal( {
			attachment: 'fixed',
			image: 'url("example.jpg")',
			position: [ 'center' ],
			repeat: [ 'repeat-y' ],
			color: '#f00'
		} );
	} );

	// TODO: define what should happen with layers
	it.skip( 'should normalize background with layers', () => {
		styles.setTo( 'background:url("test.jpg") repeat-y,#f00;' );

		expect( styles.getNormalized( 'background' ) ).to.deep.equal( { color: '#f00' } );
	} );

	it( 'should normalize background-color', () => {
		styles.setTo( 'background-color:#f00;' );

		expect( styles.getNormalized( 'background' ) ).to.deep.equal( { color: '#f00' } );
	} );

	it( 'should output inline background-color style', () => {
		styles.setTo( 'background:#f00;' );

		expect( styles.toString() ).to.equal( 'background-color:#f00;' );
		expect( styles.getAsString( 'background-color' ) ).to.equal( '#f00' );
	} );
} );
