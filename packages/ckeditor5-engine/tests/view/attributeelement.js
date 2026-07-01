/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ViewAttributeElement } from '../../src/view/attributeelement.js';
import { ViewElement } from '../../src/view/element.js';
import { ViewDocument } from '../../src/view/document.js';
import { _parseView } from '../../src/dev-utils/view.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';
import { StylesProcessor } from '../../src/view/stylesmap.js';
import { ViewContainerElement, ViewRootEditableElement, ViewText } from '../../src/index.js';

describe( 'ViewAttributeElement', () => {
	let document;

	beforeEach( () => {
		document = new ViewDocument( new StylesProcessor() );
	} );

	describe( 'constructor()', () => {
		it( 'should create element with default priority', () => {
			const el = new ViewAttributeElement( document, 'strong' );

			expect( el ).toBeInstanceOf( ViewAttributeElement );
			expect( el ).toBeInstanceOf( ViewElement );
			expect( el ).toHaveProperty( 'name', 'strong' );
			expect( el ).toHaveProperty( 'priority', ViewAttributeElement.DEFAULT_PRIORITY );
		} );
	} );

	describe( 'is()', () => {
		let el;

		beforeEach( () => {
			el = new ViewAttributeElement( document, 'span' );
		} );

		it( 'should return true for attributeElement/element, also with correct name and element name', () => {
			expect( el.is( 'attributeElement' ) ).toBe( true );
			expect( el.is( 'view:attributeElement' ) ).toBe( true );
			expect( el.is( 'attributeElement', 'span' ) ).toBe( true );
			expect( el.is( 'view:attributeElement', 'span' ) ).toBe( true );
			expect( el.is( 'element' ) ).toBe( true );
			expect( el.is( 'view:element' ) ).toBe( true );
			expect( el.is( 'element', 'span' ) ).toBe( true );
			expect( el.is( 'view:element', 'span' ) ).toBe( true );
		} );

		it( 'should return false for other accept values', () => {
			expect( el.is( 'attributeElement', 'p' ) ).toBe( false );
			expect( el.is( 'view:attributeElement', 'p' ) ).toBe( false );
			expect( el.is( 'element', 'p' ) ).toBe( false );
			expect( el.is( 'view:element', 'p' ) ).toBe( false );
			expect( el.is( 'element', 'p' ) ).toBe( false );
			expect( el.is( 'view:p' ) ).toBe( false );
			expect( el.is( '$text' ) ).toBe( false );
			expect( el.is( '$textProxy' ) ).toBe( false );
			expect( el.is( 'containerElement' ) ).toBe( false );
			expect( el.is( 'uiElement' ) ).toBe( false );
			expect( el.is( 'emptyElement' ) ).toBe( false );
			expect( el.is( 'rootElement' ) ).toBe( false );
			expect( el.is( 'documentFragment' ) ).toBe( false );
			expect( el.is( 'node', 'span' ) ).toBe( false );
			expect( el.is( 'view:node', 'span' ) ).toBe( false );
		} );
	} );

	describe( '_clone()', () => {
		it( 'should clone element with priority', () => {
			const el = new ViewAttributeElement( document, 'b' );
			el._priority = 7;

			const clone = el._clone();

			expect( clone ).not.toBe( el );
			expect( clone.name ).toBe( el.name );
			expect( clone.priority ).toBe( el.priority );
		} );
	} );

	describe( 'isSimilar', () => {
		it( 'should return true if priorities are the same', () => {
			const b1 = new ViewAttributeElement( document, 'b' );
			b1._priority = 7;

			const b2 = new ViewAttributeElement( document, 'b' );
			b2._priority = 7;

			expect( b1.isSimilar( b2 ) ).toBe( true );
		} );

		it( 'should return false if priorities are different', () => {
			const b1 = new ViewAttributeElement( document, 'b' );
			b1._priority = 7;

			const b2 = new ViewAttributeElement( document, 'b' ); // default priority

			expect( b1.isSimilar( b2 ) ).toBe( false );
		} );

		it( 'should return true if ids are the same even if other properties are different', () => {
			const element1 = new ViewAttributeElement( document, 'b' );
			element1._id = 'xyz';

			const element2 = new ViewAttributeElement( document, 'b', { foo: 'bar' } );
			element2._id = 'xyz';

			const element3 = new ViewAttributeElement( document, 'span' );
			element3._id = 'xyz';

			expect( element1.isSimilar( element2 ) ).toBe( true );
			expect( element1.isSimilar( element3 ) ).toBe( true );
		} );

		it( 'should return false if ids are different even if other properties are same', () => {
			const element1 = new ViewAttributeElement( document, 'span', { foo: 'bar' } );
			element1._priority = 3;
			element1._id = 'foo';

			const element2 = new ViewAttributeElement( document, 'span', { foo: 'bar' } );
			element2._priority = 3;
			element2._id = 'bar';

			expect( element1.isSimilar( element2 ) ).toBe( false );
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

			expect( attributeA.getElementsWithSameId() ).toEqual( attributeA._clonesGroup );
			expect( attributeA.getElementsWithSameId() ).not.toBe( attributeA._clonesGroup );
			expect( attributeA.getElementsWithSameId() ).toEqual( attributeB.getElementsWithSameId() );
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

			expect( attribute.getFillerOffset() ).toBe( 0 );
		} );

		it( 'should return position 0 if it is the only nested element in the container', () => {
			const { selection } = _parseView(
				'<container:p><attribute:b><attribute:i>[]</attribute:i></attribute:b></container:p>' );
			const attribute = selection.getFirstPosition().parent;

			expect( attribute.getFillerOffset() ).toBe( 0 );
		} );

		it( 'should return null if element contains another element', () => {
			const attribute = _parseView( '<attribute:b><attribute:i></attribute:i></attribute:b>' );

			expect( attribute.getFillerOffset() ).toBeNull();
		} );

		it( 'should return null if element contains text', () => {
			const attribute = _parseView( '<attribute:b>text</attribute:b>' );

			expect( attribute.getFillerOffset() ).toBeNull();
		} );

		it( 'should return null if container element contains text', () => {
			const { selection } = _parseView( '<container:p><attribute:b>[]</attribute:b>foo</container:p>' );
			const attribute = selection.getFirstPosition().parent;

			expect( attribute.getFillerOffset() ).toBeNull();
		} );

		it( 'should return null if it is the parent contains text', () => {
			const { selection } = _parseView(
				'<container:p><attribute:b><attribute:i>[]</attribute:i>foo</attribute:b></container:p>' );
			const attribute = selection.getFirstPosition().parent;

			expect( attribute.getFillerOffset() ).toBeNull();
		} );

		it( 'should return null if there is no parent container element', () => {
			const { selection } = _parseView( '<attribute:b><attribute:i>[]</attribute:i>foo</attribute:b>' );
			const attribute = selection.getFirstPosition().parent;

			expect( attribute.getFillerOffset() ).toBeNull();
		} );

		it( 'should return null if there is no parent', () => {
			const attribute = new ViewAttributeElement( document, 'b' );

			expect( attribute.getFillerOffset() ).toBeNull();
		} );

		it( 'should return offset after all children if it is the only nested element in the container and has UIElement inside', () => {
			const { selection } = _parseView(
				'<container:p><attribute:b><attribute:i>[]<ui:span></ui:span></attribute:i></attribute:b></container:p>'
			);
			const attribute = selection.getFirstPosition().parent;

			expect( attribute.getFillerOffset() ).toBe( 1 );
		} );

		it( 'should return offset after all children if there is no parent container element and has UIElement inside', () => {
			const { selection } = _parseView( '<attribute:b>[]<ui:span></ui:span><ui:span></ui:span></attribute:b>' );
			const attribute = selection.getFirstPosition().parent;

			expect( attribute.getFillerOffset() ).toBe( 2 );
		} );
	} );

	describe( 'toJSON()', () => {
		it( 'should provide node type, root name, path, child nodes', () => {
			const text = new ViewText( document, 'foo' );
			const strong = new ViewAttributeElement( document, 'strong', null, new ViewText( document, 'bar' ) );
			const paragraph = new ViewContainerElement( document, 'p', null );
			const root = new ViewRootEditableElement( document, 'div' );
			paragraph._appendChild( text );
			paragraph._appendChild( strong );
			root._appendChild( paragraph );

			const json = JSON.stringify( strong );
			const parsed = JSON.parse( json );

			expect( parsed ).toEqual( {
				name: 'strong',
				path: [ 0, 1 ],
				root: 'main',
				type: 'AttributeElement',
				children: [
					{
						data: 'bar',
						path: [ 0, 1, 0 ],
						root: 'main',
						type: 'Text'
					}
				]
			} );
		} );
	} );
} );
