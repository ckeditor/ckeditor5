/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Styles, { StylesConverter } from '../../../src/view/styles';
import BackgroundStyles from '../../../src/view/styles/backgroundstyles';

describe( 'Background styles normalization', () => {
	let styles;

	beforeEach( () => {
		const converter = new StylesConverter();
		BackgroundStyles.attach( converter );
		styles = new Styles( converter );
	} );

	it( 'should normalize background', () => {
		// TODO: border-box given only for coverage test.
		styles.setStyle( 'background:url("example.jpg") center #f00 repeat-y fixed border-box;' );

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
		styles.setStyle( 'background:url("test.jpg") repeat-y,#f00;' );

		expect( styles.getNormalized( 'background' ) ).to.deep.equal( { color: '#f00' } );
	} );

	it( 'should normalize background-color', () => {
		styles.setStyle( 'background-color:#f00;' );

		expect( styles.getNormalized( 'background' ) ).to.deep.equal( { color: '#f00' } );
	} );

	it( 'should output inline background-color style', () => {
		styles.setStyle( 'background:#f00;' );

		expect( styles.getInlineStyle() ).to.equal( 'background-color:#f00;' );
		expect( styles.getInlineProperty( 'background-color' ) ).to.equal( '#f00' );
	} );
} );
