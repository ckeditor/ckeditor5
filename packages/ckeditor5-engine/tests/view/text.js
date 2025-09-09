/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ViewNode } from '../../src/view/node.js';
import { ViewText } from '../../src/view/text.js';
import { ViewDocument } from '../../src/view/document.js';
import { StylesProcessor } from '../../src/view/stylesmap.js';
import { ViewContainerElement, ViewRootEditableElement } from '../../src/index.js';

describe( 'Text', () => {
	let document;

	beforeEach( () => {
		document = new ViewDocument( new StylesProcessor() );
	} );

	describe( 'constructor()', () => {
		it( 'should create element without attributes', () => {
			const text = new ViewText( document, 'foo' );

			expect( text ).to.be.an.instanceof( ViewNode );
			expect( text.data ).to.equal( 'foo' );
			expect( text ).to.have.property( 'parent' ).that.is.null;
		} );
	} );

	describe( 'is()', () => {
		let text;

		before( () => {
			text = new ViewText( document, 'foo' );
		} );

		it( 'should return true for node, text', () => {
			expect( text.is( 'node' ) ).to.be.true;
			expect( text.is( 'view:node' ) ).to.be.true;
			expect( text.is( '$text' ) ).to.be.true;
			expect( text.is( 'view:$text' ) ).to.be.true;
			expect( text.is( 'text' ) ).to.be.true;
			expect( text.is( 'view:text' ) ).to.be.true;
		} );

		it( 'should return false for other accept values', () => {
			expect( text.is( '$textProxy' ) ).to.be.false;
			expect( text.is( 'view:$textProxy' ) ).to.be.false;
			expect( text.is( 'element' ) ).to.be.false;
			expect( text.is( 'view:element' ) ).to.be.false;
			expect( text.is( 'containerElement' ) ).to.be.false;
			expect( text.is( 'attributeElement' ) ).to.be.false;
			expect( text.is( 'uiElement' ) ).to.be.false;
			expect( text.is( 'emptyElement' ) ).to.be.false;
			expect( text.is( 'rootElement' ) ).to.be.false;
			expect( text.is( 'documentFragment' ) ).to.be.false;
			expect( text.is( 'model:$text' ) ).to.be.false;
			expect( text.is( 'model:node' ) ).to.be.false;
		} );
	} );

	describe( '_clone()', () => {
		it( 'should return new text with same data', () => {
			const text = new ViewText( document, 'foo bar' );
			const clone = text._clone();

			expect( clone ).to.not.equal( text );
			expect( clone.data ).to.equal( text.data );
		} );
	} );

	describe( 'isSimilar', () => {
		const text = new ViewText( document, 'foo' );

		it( 'should return false when comparing to non-text', () => {
			expect( text.isSimilar( null ) ).to.be.false;
			expect( text.isSimilar( {} ) ).to.be.false;
		} );

		it( 'should return true when the same text node is provided', () => {
			expect( text.isSimilar( text ) ).to.be.true;
		} );

		it( 'should return true when data is the same', () => {
			const other = new ViewText( document, 'foo' );

			expect( text.isSimilar( other ) ).to.be.true;
		} );

		it( 'should return false when data is not the same', () => {
			const other = text._clone();
			other._data = 'not-foo';

			expect( text.isSimilar( other ) ).to.be.false;
		} );
	} );

	describe( 'setText', () => {
		it( 'should change the text', () => {
			const text = new ViewText( document, 'foo' );
			text._data = 'bar';

			expect( text.data ).to.equal( 'bar' );
		} );

		it( 'works when using addition assignment operator (+=)', () => {
			const foo = new ViewText( document, 'foo' );
			const bar = new ViewText( document, 'bar' );

			foo._data += bar.data;
			expect( foo.data ).to.equal( 'foobar' );
		} );
	} );

	describe( 'toJSON()', () => {
		it( 'should provide node type, root name, path, text data', () => {
			const text = new ViewText( document, 'foo' );
			const paragraph = new ViewContainerElement( document, 'p', null );
			const root = new ViewRootEditableElement( document, 'div' );
			paragraph._appendChild( text );
			root._appendChild( paragraph );

			const json = JSON.stringify( text );
			const parsed = JSON.parse( json );

			expect( parsed ).to.deep.equal( {
				data: 'foo',
				path: [ 0, 0 ],
				root: 'main',
				type: 'Text'
			} );
		} );
	} );
} );
