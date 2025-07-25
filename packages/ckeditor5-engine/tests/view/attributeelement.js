/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ViewAttributeElement } from '../../src/view/attributeelement.js';
import { ViewElement } from '../../src/view/element.js';
import { ViewDocument } from '../../src/view/document.js';
import { _parseView } from '../../src/dev-utils/view.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';
import { StylesProcessor } from '../../src/view/stylesmap.js';

describe( 'ViewAttributeElement', () => {
	let document;

	beforeEach( () => {
		document = new ViewDocument( new StylesProcessor() );
	} );

	describe( 'constructor()', () => {
		it( 'should create element with default priority', () => {
			const el = new ViewAttributeElement( document, 'strong' );

			expect( el ).to.be.an.instanceof( ViewAttributeElement );
			expect( el ).to.be.an.instanceof( ViewElement );
			expect( el ).to.have.property( 'name' ).that.equals( 'strong' );
			expect( el ).to.have.property( 'priority' ).that.equals( ViewAttributeElement.DEFAULT_PRIORITY );
		} );
	} );

	describe( 'is()', () => {
		let el;

		before( () => {
			el = new ViewAttributeElement( document, 'span' );
		} );

		it( 'should return true for attributeElement/element, also with correct name and element name', () => {
			expect( el.is( 'attributeElement' ) ).to.be.true;
			expect( el.is( 'view:attributeElement' ) ).to.be.true;
			expect( el.is( 'attributeElement', 'span' ) ).to.be.true;
			expect( el.is( 'view:attributeElement', 'span' ) ).to.be.true;
			expect( el.is( 'element' ) ).to.be.true;
			expect( el.is( 'view:element' ) ).to.be.true;
			expect( el.is( 'element', 'span' ) ).to.be.true;
			expect( el.is( 'view:element', 'span' ) ).to.be.true;
		} );

		it( 'should return false for other accept values', () => {
			expect( el.is( 'attributeElement', 'p' ) ).to.be.false;
			expect( el.is( 'view:attributeElement', 'p' ) ).to.be.false;
			expect( el.is( 'element', 'p' ) ).to.be.false;
			expect( el.is( 'view:element', 'p' ) ).to.be.false;
			expect( el.is( 'element', 'p' ) ).to.be.false;
			expect( el.is( 'view:p' ) ).to.be.false;
			expect( el.is( '$text' ) ).to.be.false;
			expect( el.is( '$textProxy' ) ).to.be.false;
			expect( el.is( 'containerElement' ) ).to.be.false;
			expect( el.is( 'uiElement' ) ).to.be.false;
			expect( el.is( 'emptyElement' ) ).to.be.false;
			expect( el.is( 'rootElement' ) ).to.be.false;
			expect( el.is( 'documentFragment' ) ).to.be.false;
			expect( el.is( 'node', 'span' ) ).to.be.false;
			expect( el.is( 'view:node', 'span' ) ).to.be.false;
		} );
	} );

	describe( '_clone()', () => {
		it( 'should clone element with priority', () => {
			const el = new ViewAttributeElement( document, 'b' );
			el._priority = 7;

			const clone = el._clone();

			expect( clone ).to.not.equal( el );
			expect( clone.name ).to.equal( el.name );
			expect( clone.priority ).to.equal( el.priority );
		} );
	} );

	describe( 'isSimilar', () => {
		it( 'should return true if priorities are the same', () => {
			const b1 = new ViewAttributeElement( document, 'b' );
			b1._priority = 7;

			const b2 = new ViewAttributeElement( document, 'b' );
			b2._priority = 7;

			expect( b1.isSimilar( b2 ) ).to.be.true;
		} );

		it( 'should return false if priorities are different', () => {
			const b1 = new ViewAttributeElement( document, 'b' );
			b1._priority = 7;

			const b2 = new ViewAttributeElement( document, 'b' ); // default priority

			expect( b1.isSimilar( b2 ) ).to.be.false;
		} );

		it( 'should return true if ids are the same even if other properties are different', () => {
			const element1 = new ViewAttributeElement( document, 'b' );
			element1._id = 'xyz';

			const element2 = new ViewAttributeElement( document, 'b', { foo: 'bar' } );
			element2._id = 'xyz';

			const element3 = new ViewAttributeElement( document, 'span' );
			element3._id = 'xyz';

			expect( element1.isSimilar( element2 ) ).to.be.true;
			expect( element1.isSimilar( element3 ) ).to.be.true;
		} );

		it( 'should return false if ids are different even if other properties are same', () => {
			const element1 = new ViewAttributeElement( document, 'span', { foo: 'bar' } );
			element1._priority = 3;
			element1._id = 'foo';

			const element2 = new ViewAttributeElement( document, 'span', { foo: 'bar' } );
			element2._priority = 3;
			element2._id = 'bar';

			expect( element1.isSimilar( element2 ) ).to.be.false;
		} );
	} );

	// More tests are available in ViewDowncastWriter tests.
	describe( 'getElementsWithSameId', () => {
		it( 'should return a copy of _clonesGroup set', () => {
			const attributeA = new ViewAttributeElement( document, 'b' );
			const attributeB = new ViewAttributeElement( document, 'b' );

			attributeA._id = 'foo';
			attributeB._id = 'foo';

			attributeA._clonesGroup = attributeB._clonesGroup = new Set( [ attributeA, attributeB ] );

			expect( attributeA.getElementsWithSameId() ).to.deep.equal( attributeA._clonesGroup );
			expect( attributeA.getElementsWithSameId() ).not.to.equal( attributeA._clonesGroup );
			expect( attributeA.getElementsWithSameId() ).to.deep.equal( attributeB.getElementsWithSameId() );
		} );

		it( 'should throw if attribute element has no id', () => {
			const attribute = new ViewAttributeElement( document, 'b' );

			expectToThrowCKEditorError( () => {
				attribute.getElementsWithSameId();
			}, /attribute-element-get-elements-with-same-id-no-id/ );
		} );
	} );

	describe( 'getFillerOffset', () => {
		it( 'should return position 0 if it is the only element in the container', () => {
			const { selection } = _parseView( '<container:p><attribute:b>[]</attribute:b></container:p>' );
			const attribute = selection.getFirstPosition().parent;

			expect( attribute.getFillerOffset() ).to.equals( 0 );
		} );

		it( 'should return position 0 if it is the only nested element in the container', () => {
			const { selection } = _parseView(
				'<container:p><attribute:b><attribute:i>[]</attribute:i></attribute:b></container:p>' );
			const attribute = selection.getFirstPosition().parent;

			expect( attribute.getFillerOffset() ).to.equals( 0 );
		} );

		it( 'should return null if element contains another element', () => {
			const attribute = _parseView( '<attribute:b><attribute:i></attribute:i></attribute:b>' );

			expect( attribute.getFillerOffset() ).to.be.null;
		} );

		it( 'should return null if element contains text', () => {
			const attribute = _parseView( '<attribute:b>text</attribute:b>' );

			expect( attribute.getFillerOffset() ).to.be.null;
		} );

		it( 'should return null if container element contains text', () => {
			const { selection } = _parseView( '<container:p><attribute:b>[]</attribute:b>foo</container:p>' );
			const attribute = selection.getFirstPosition().parent;

			expect( attribute.getFillerOffset() ).to.be.null;
		} );

		it( 'should return null if it is the parent contains text', () => {
			const { selection } = _parseView(
				'<container:p><attribute:b><attribute:i>[]</attribute:i>foo</attribute:b></container:p>' );
			const attribute = selection.getFirstPosition().parent;

			expect( attribute.getFillerOffset() ).to.be.null;
		} );

		it( 'should return null if there is no parent container element', () => {
			const { selection } = _parseView( '<attribute:b><attribute:i>[]</attribute:i>foo</attribute:b>' );
			const attribute = selection.getFirstPosition().parent;

			expect( attribute.getFillerOffset() ).to.be.null;
		} );

		it( 'should return null if there is no parent', () => {
			const attribute = new ViewAttributeElement( document, 'b' );

			expect( attribute.getFillerOffset() ).to.be.null;
		} );

		it( 'should return offset after all children if it is the only nested element in the container and has UIElement inside', () => {
			const { selection } = _parseView(
				'<container:p><attribute:b><attribute:i>[]<ui:span></ui:span></attribute:i></attribute:b></container:p>'
			);
			const attribute = selection.getFirstPosition().parent;

			expect( attribute.getFillerOffset() ).to.equal( 1 );
		} );

		it( 'should return offset after all children if there is no parent container element and has UIElement inside', () => {
			const { selection } = _parseView( '<attribute:b>[]<ui:span></ui:span><ui:span></ui:span></attribute:b>' );
			const attribute = selection.getFirstPosition().parent;

			expect( attribute.getFillerOffset() ).to.equal( 2 );
		} );
	} );
} );
