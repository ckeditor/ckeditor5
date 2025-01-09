/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { LabelView } from '@ckeditor/ckeditor5-ui';
import { Locale } from '@ckeditor/ckeditor5-utils';

import StyleGridView from '../../src/ui/stylegridview.js';
import StyleGroupView from '../../src/ui/stylegroupview.js';

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
			expect( group.labelView ).to.be.instanceOf( LabelView );
			expect( group.labelView.text ).to.equal( 'Foo label' );
		} );

		it( 'should set #gridView', () => {
			expect( group.gridView ).to.be.instanceOf( StyleGridView );
			expect( group.gridView.children.first.label ).to.equal( 'Red heading' );
			expect( group.gridView.children.last.label ).to.equal( 'Large heading' );
		} );

		it( 'should be a <div>', () => {
			group.render();

			expect( group.element.tagName ).to.equal( 'DIV' );
		} );

		it( 'should have a static CSS class', () => {
			group.render();

			expect( group.element.classList.contains( 'ck-style-panel__style-group' ) ).to.be.true;
		} );

		it( 'should have children in DOM', () => {
			group.render();

			expect( group.element.firstChild ).to.equal( group.labelView.element );
			expect( group.element.lastChild ).to.equal( group.gridView.element );
		} );
	} );
} );
