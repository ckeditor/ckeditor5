/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Styles, { StylesConverter } from '../../../src/view/styles';
import PaddingStyles from '../../../src/view/styles/paddingstyles';

describe( 'Padding styles normalization', () => {
	let styles;

	beforeEach( () => {
		const converter = new StylesConverter();
		PaddingStyles.attach( converter );
		styles = new Styles( converter );
	} );

	it( 'should set all paddings (1 value defined)', () => {
		styles.setStyle( 'padding:1px;' );

		expect( styles.getNormalized( 'padding' ) ).to.deep.equal( {
			top: '1px',
			right: '1px',
			bottom: '1px',
			left: '1px'
		} );
	} );

	it( 'should set all paddings (2 values defined)', () => {
		styles.setStyle( 'padding:1px .34cm;' );

		expect( styles.getNormalized( 'padding' ) ).to.deep.equal( {
			top: '1px',
			right: '.34cm',
			bottom: '1px',
			left: '.34cm'
		} );
	} );

	it( 'should set all paddings (3 values defined)', () => {
		styles.setStyle( 'padding:1px .34cm 90.1rem;' );

		expect( styles.getNormalized( 'padding' ) ).to.deep.equal( {
			top: '1px',
			right: '.34cm',
			bottom: '90.1rem',
			left: '.34cm'
		} );
	} );

	it( 'should set all paddings (4 values defined)', () => {
		styles.setStyle( 'padding:1px .34cm 90.1rem thick;' );

		expect( styles.getNormalized( 'padding' ) ).to.deep.equal( {
			top: '1px',
			right: '.34cm',
			bottom: '90.1rem',
			left: 'thick'
		} );
	} );

	describe( 'padding-*', () => {
		it( 'should set proper padding', () => {
			styles.setStyle( 'padding-top:1px;' );

			expect( styles.getNormalized( 'padding' ) ).to.deep.equal( {
				top: '1px'
			} );
		} );

		it( 'should set proper padding with padding shorthand', () => {
			styles.setStyle( 'padding: 2em;padding-top:1px;' );

			expect( styles.getNormalized( 'padding' ) ).to.deep.equal( {
				top: '1px',
				right: '2em',
				bottom: '2em',
				left: '2em'
			} );
		} );
	} );
} );
