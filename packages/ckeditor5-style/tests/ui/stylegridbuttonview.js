/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ButtonView, View } from '@ckeditor/ckeditor5-ui';
import { Locale } from '@ckeditor/ckeditor5-utils';

import { StyleGridButtonView } from '../../src/ui/stylegridbuttonview.js';

describe( 'StyleGridButtonView', () => {
	let locale, button;

	beforeEach( async () => {
		locale = new Locale();
		button = new StyleGridButtonView( locale, {
			name: 'Red heading',
			element: 'h2',
			classes: [ 'red-heading', 'foo' ],
			previewTemplate: {
				tag: 'h2',
				attributes: {
					class: [ 'red-heading', 'foo' ]
				},
				children: [
					{ text: 'AaBbCcDdEeFfGgHhIiJj' }
				]
			}
		} );
	} );

	afterEach( async () => {
		button.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should inherit from ButtonView', () => {
			expect( button ).toBeInstanceOf( ButtonView );
		} );

		it( 'should set #styleDefinition', () => {
			expect( button.styleDefinition ).toEqual( {
				name: 'Red heading',
				element: 'h2',
				classes: [ 'red-heading', 'foo' ],
				previewTemplate: {
					tag: 'h2',
					attributes: {
						class: [ 'red-heading', 'foo' ]
					},
					children: [
						{ text: 'AaBbCcDdEeFfGgHhIiJj' }
					]
				}
			} );
		} );

		describe( 'preview', () => {
			beforeEach( () => {
				button.render();
			} );

			it( 'should be set as #previewView', () => {
				expect( button.previewView ).toBeInstanceOf( View );
			} );

			it( 'should be a div', () => {
				expect( button.previewView.element.tagName ).toBe( 'DIV' );
			} );

			it( 'should have CSS classes', () => {
				expect( button.previewView.element.classList.contains( 'ck' ) ).toBe( true );
				expect( button.previewView.element.classList.contains( 'ck-style-grid__button__preview' ) ).toBe( true );
			} );

			it( 'should use the .ck-content CSS class for easier integration (configuration)', () => {
				expect( button.previewView.element.classList.contains( 'ck-content' ) ).toBe( true );
			} );

			it( 'should exclude its content from the UI CSS reset for easier integration (configuration)', () => {
				expect( button.previewView.element.classList.contains( 'ck-reset_all-excluded' ) ).toBe( true );
			} );

			it( 'should exclude the presentational preview text from assistive technologies', () => {
				expect( button.previewView.element.getAttribute( 'aria-hidden' ) ).toBe( 'true' );
			} );

			it( 'should render the inner preview as the element specified in definition if previewable', () => {
				const previewElement = button.previewView.element.firstChild;

				expect( previewElement.tagName ).toBe( 'H2' );
				expect( previewElement.classList.contains( 'red-heading' ) ).toBe( true );
				expect( previewElement.classList.contains( 'foo' ) ).toBe( true );
				expect( previewElement.textContent ).toBe( 'AaBbCcDdEeFfGgHhIiJj' );
			} );

			it( 'should render the inner preview based on custom template', () => {
				const button = new StyleGridButtonView( locale, {
					name: 'Custom preview',
					element: 'li',
					classes: [ 'a', 'b' ],
					previewTemplate: {
						tag: 'ol',
						children: [
							{
								tag: 'li',
								attributes: {
									class: [ 'a', 'b' ]
								},
								children: [
									{ text: 'AaBbCcDdEeFfGgHhIiJj' }
								]
							}
						]
					}
				} );

				button.render();

				const previewElement = button.previewView.element.firstChild;
				const childElement = previewElement.firstChild;

				expect( previewElement.tagName ).toBe( 'OL' );
				expect( previewElement.classList.contains( 'a' ) ).toBe( false );
				expect( previewElement.classList.contains( 'b' ) ).toBe( false );

				expect( childElement.tagName ).toBe( 'LI' );
				expect( childElement.classList.contains( 'a' ) ).toBe( true );
				expect( childElement.classList.contains( 'b' ) ).toBe( true );
				expect( childElement.textContent ).toBe( 'AaBbCcDdEeFfGgHhIiJj' );

				button.destroy();
			} );
		} );

		it( 'should have a label', () => {
			expect( button.label ).toBe( 'Red heading' );
		} );

		it( 'should have a CSS class', () => {
			expect( button.class ).toBe( 'ck-style-grid__button' );
		} );

		it( 'should display text label', () => {
			expect( button.withText ).toBe( true );
		} );

		it( 'should have a role attribute', () => {
			button.render();

			expect( button.element.getAttribute( 'role' ) ).toBe( 'option' );
		} );
	} );
} );
