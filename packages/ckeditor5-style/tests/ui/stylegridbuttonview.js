/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { ButtonView, View } from '@ckeditor/ckeditor5-ui';
import { Locale } from '@ckeditor/ckeditor5-utils';

import StyleGridButtonView from '../../src/ui/stylegridbuttonview';

describe( 'StyleGridButtonView', () => {
	let locale, button;

	beforeEach( async () => {
		locale = new Locale();
		button = new StyleGridButtonView( locale, {
			name: 'Red heading',
			element: 'h2',
			classes: [ 'red-heading', 'foo' ]
		} );
	} );

	afterEach( async () => {
		button.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should inherit from ButtonView', () => {
			expect( button ).to.be.instanceOf( ButtonView );
		} );

		it( 'should set #styleDefinition', () => {
			expect( button.styleDefinition ).to.deep.equal( {
				name: 'Red heading',
				element: 'h2',
				classes: [ 'red-heading', 'foo' ]
			} );
		} );

		describe( 'preview', () => {
			beforeEach( () => {
				button.render();
			} );

			it( 'should be set as #previewView', () => {
				expect( button.previewView ).to.be.instanceOf( View );
			} );

			it( 'should be a div', () => {
				expect( button.previewView.element.tagName ).to.equal( 'DIV' );
			} );

			it( 'should have CSS classes', () => {
				expect( button.previewView.element.classList.contains( 'ck' ) ).to.be.true;
				expect( button.previewView.element.classList.contains( 'ck-style-grid__button__preview' ) ).to.be.true;
			} );

			it( 'should use the .ck-content CSS class for easier integration (configuration)', () => {
				expect( button.previewView.element.classList.contains( 'ck-content' ) ).to.be.true;
			} );

			it( 'should exclude its content from the UI CSS reset for easier integration (configuration)', () => {
				expect( button.previewView.element.classList.contains( 'ck-reset_all-excluded' ) ).to.be.true;
			} );

			it( 'should exclude the presentational preview text from assistive technologies', () => {
				expect( button.previewView.element.getAttribute( 'aria-hidden' ) ).to.equal( 'true' );
			} );

			it( 'should render the inner preview as the element specified in definition if previewable', () => {
				const previewElement = button.previewView.element.firstChild;

				expect( previewElement.tagName ).to.equal( 'H2' );
				expect( previewElement.classList.contains( 'red-heading' ) ).to.be.true;
				expect( previewElement.classList.contains( 'foo' ) ).to.be.true;
				expect( previewElement.textContent ).to.equal( 'AaBbCcDdEeFfGgHhIiJj' );
			} );

			it( 'should render the inner preview as a DIV if non-previewable', () => {
				const button = new StyleGridButtonView( locale, {
					name: 'Non-previewable',
					element: 'td',
					classes: [ 'a', 'b' ]
				} );

				button.render();

				const previewElement = button.previewView.element.firstChild;

				expect( previewElement.tagName ).to.equal( 'DIV' );
				expect( previewElement.classList.contains( 'a' ) ).to.be.true;
				expect( previewElement.classList.contains( 'b' ) ).to.be.true;
				expect( previewElement.textContent ).to.equal( 'AaBbCcDdEeFfGgHhIiJj' );

				button.destroy();
			} );
		} );

		it( 'should have a label', () => {
			expect( button.label ).to.equal( 'Red heading' );
		} );

		it( 'should have a CSS class', () => {
			expect( button.class ).to.equal( 'ck-style-grid__button' );
		} );

		it( 'should display text label', () => {
			expect( button.withText ).to.be.true;
		} );

		it( 'should have a role attribute', () => {
			button.render();

			expect( button.element.getAttribute( 'role' ) ).to.equal( 'option' );
		} );
	} );
} );
