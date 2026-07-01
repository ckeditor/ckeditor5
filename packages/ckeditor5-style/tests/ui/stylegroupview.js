/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { LabelView } from '@ckeditor/ckeditor5-ui';
import { Locale } from '@ckeditor/ckeditor5-utils';

import { StyleGridView } from '../../src/ui/stylegridview.js';
import { StyleGroupView } from '../../src/ui/stylegroupview.js';

describe( 'StyleGroupView', () => {
	let locale, group;

	beforeEach( async () => {
		locale = new Locale();
		group = new StyleGroupView( locale, 'Foo label', [
			{
				name: 'Red heading',
				element: 'h2',
				classes: [ 'red-heading' ],
				previewTemplate: {
					tag: 'h2',
					attributes: {
						class: 'red-heading'
					},
					children: [
						{ text: 'AaBbCcDdEeFfGgHhIiJj' }
					]
				}
			},
			{
				name: 'Large heading',
				element: 'h2',
				classes: [ 'large-heading' ],
				previewTemplate: {
					tag: 'h2',
					attributes: {
						class: 'large-heading'
					},
					children: [
						{ text: 'AaBbCcDdEeFfGgHhIiJj' }
					]
				}
			}
		] );
	} );

	afterEach( async () => {
		group.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should set #labelView', () => {
			expect( group.labelView ).toBeInstanceOf( LabelView );
			expect( group.labelView.text ).toBe( 'Foo label' );
		} );

		it( 'should set #gridView', () => {
			expect( group.gridView ).toBeInstanceOf( StyleGridView );
			expect( group.gridView.children.first.label ).toBe( 'Red heading' );
			expect( group.gridView.children.last.label ).toBe( 'Large heading' );
		} );

		it( 'should be a <div>', () => {
			group.render();

			expect( group.element.tagName ).toBe( 'DIV' );
		} );

		it( 'should have a static CSS class', () => {
			group.render();

			expect( group.element.classList.contains( 'ck-style-panel__style-group' ) ).toBe( true );
		} );

		it( 'should have children in DOM', () => {
			group.render();

			expect( group.element.firstChild ).toBe( group.labelView.element );
			expect( group.element.lastChild ).toBe( group.gridView.element );
		} );
	} );
} );
