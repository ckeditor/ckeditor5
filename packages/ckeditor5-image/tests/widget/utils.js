/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ViewElement from '@ckeditor/ckeditor5-engine/src/view/element';
import { widgetize, isWidget, WIDGET_CLASS_NAME, setFakeSelectionLabel, getFakeSelectionLabel } from '../../src/widget/utils';

describe( 'widget utils', () => {
	let element;

	beforeEach( () => {
		element = new ViewElement( 'div' );
		widgetize( element );
	} );

	describe( 'widgetize()', () => {
		it( 'should set contenteditable to false', () => {
			expect( element.getAttribute( 'contenteditable' ) ).to.be.false;
		} );

		it( 'should define getFillerOffset method', () => {
			expect( element.getFillerOffset ).to.be.function;
			expect( element.getFillerOffset() ).to.be.null;
		} );

		it( 'should add proper CSS class', () => {
			expect( element.hasClass( WIDGET_CLASS_NAME ) ).to.be.true;
		} );
	} );

	describe( 'isWidget()', () => {
		it( 'should return true for widgetized elements', () => {
			expect( isWidget( element ) ).to.be.true;
		} );

		it( 'should return false for non-widgetized elements', () => {
			expect( isWidget( new ViewElement( 'p' ) ) ).to.be.false;
		} );
	} );

	describe( 'fake selection label utils', () => {
		it( 'should allow to set fake selection for element', () => {
			const element = new ViewElement( 'p' );
			setFakeSelectionLabel( element, 'foo bar baz' );

			expect( getFakeSelectionLabel( element ) ).to.equal( 'foo bar baz' );
		} );

		it( 'should return undefined for elements without fake selection label', () => {
			const element = new ViewElement( 'div' );

			expect( getFakeSelectionLabel( element ) ).to.be.undefined;
		} );

		it( 'should allow to use a function as label creator', () => {
			const element = new ViewElement( 'p' );
			let caption = 'foo';
			setFakeSelectionLabel( element, () => caption );

			expect( getFakeSelectionLabel( element ) ).to.equal( 'foo' );
			caption = 'bar';
			expect( getFakeSelectionLabel( element ) ).to.equal( 'bar' );
		} );
	} );
} );
