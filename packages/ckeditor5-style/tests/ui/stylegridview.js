/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { ViewCollection } from '@ckeditor/ckeditor5-ui';
import { Locale } from '@ckeditor/ckeditor5-utils';

import StyleGridButtonView from '../../src/ui/stylegridbuttonview';
import StyleGridView from '../../src/ui/stylegridview';

describe( 'StyleGridView', () => {
	let locale, grid;

	beforeEach( async () => {
		locale = new Locale();
		grid = new StyleGridView( locale, [
			{
				name: 'Red heading',
				element: 'h2',
				classes: [ 'red-heading' ]
			},
			{
				name: 'Large heading',
				element: 'h2',
				classes: [ 'large-heading' ]
			}
		] );
	} );

	afterEach( async () => {
		grid.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should set #children', () => {
			expect( grid.children ).to.be.instanceOf( ViewCollection );
		} );

		it( 'should set #activeStyles', () => {
			expect( grid.activeStyles ).to.deep.equal( [] );
		} );

		it( 'should set #enabledStyles', () => {
			expect( grid.enabledStyles ).to.deep.equal( [] );
		} );

		it( 'should delegate #execute from #children', () => {
			const spy = sinon.spy();

			grid.on( 'execute', spy );
			grid.children.first.fire( 'execute', 'foo' );

			sinon.assert.calledOnceWithExactly( spy, sinon.match.object, 'foo' );
		} );

		it( 'should create #children from style definitions', () => {
			for ( const child of grid.children ) {
				expect( child ).to.be.instanceOf( StyleGridButtonView );
			}

			expect( grid.children.map( ( { label } ) => label ) ).to.deep.equal( [ 'Red heading', 'Large heading' ] );
		} );

		it( 'should change #isOn state of #children depending on #activeStyles', () => {
			grid.activeStyles = [];

			expect( grid.children.map( ( { isOn } ) => isOn ) ).to.deep.equal( [ false, false ] );

			grid.activeStyles = [ 'Large heading' ];

			expect( grid.children.map( ( { isOn } ) => isOn ) ).to.deep.equal( [ false, true ] );
		} );

		it( 'should change #isEnabled state of #children depending on #enabledStyles', () => {
			grid.enabledStyles = [];

			expect( grid.children.map( ( { isEnabled } ) => isEnabled ) ).to.deep.equal( [ false, false ] );

			grid.enabledStyles = [ 'Large heading' ];

			expect( grid.children.map( ( { isEnabled } ) => isEnabled ) ).to.deep.equal( [ false, true ] );
		} );

		it( 'should be a <div>', () => {
			grid.render();

			expect( grid.element.tagName ).to.equal( 'DIV' );
		} );

		it( 'should have a static CSS class', () => {
			grid.render();

			expect( grid.element.classList.contains( 'ck' ) ).to.be.true;
			expect( grid.element.classList.contains( 'ck-style-grid' ) ).to.be.true;
		} );

		it( 'should have a role attribute', () => {
			grid.render();

			expect( grid.element.getAttribute( 'role' ) ).to.equal( 'listbox' );
		} );

		it( 'should have children in DOM', () => {
			grid.render();

			expect( grid.element.firstChild ).to.equal( grid.children.first.element );
			expect( grid.element.lastChild ).to.equal( grid.children.last.element );
		} );
	} );
} );
