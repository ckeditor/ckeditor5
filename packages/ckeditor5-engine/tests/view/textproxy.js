/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ViewTextProxy } from '../../src/view/textproxy.js';
import { ViewText } from '../../src/view/text.js';
import { ViewContainerElement } from '../../src/view/containerelement.js';
import { ViewDocumentFragment } from '../../src/view/documentfragment.js';
import { ViewRootEditableElement } from '../../src/view/rooteditableelement.js';

import { createViewDocumentMock } from '../../tests/view/_utils/createdocumentmock.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';
import { ViewDocument } from '../../src/view/document.js';
import { StylesProcessor } from '../../src/view/stylesmap.js';

describe( 'TextProxy', () => {
	let text, parent, wrapper, textProxy, document;

	beforeEach( () => {
		document = new ViewDocument( new StylesProcessor() );
		text = new ViewText( document, 'abcdefgh' );
		parent = new ViewContainerElement( document, 'p', [], [ text ] );
		wrapper = new ViewContainerElement( document, 'div', [], parent );

		textProxy = new ViewTextProxy( text, 2, 3 );
	} );

	describe( 'constructor()', () => {
		it( 'should create ViewTextProxy instance with specified properties', () => {
			expect( textProxy.parent ).toBe( parent );
			expect( textProxy.data ).toBe( 'cde' );
			expect( textProxy.textNode ).toBe( text );
			expect( textProxy.offsetInText ).toBe( 2 );
		} );

		it( 'should have isPartial property', () => {
			const startTextProxy = new ViewTextProxy( text, 0, 4 );
			const fullTextProxy = new ViewTextProxy( text, 0, 8 );

			expect( textProxy.isPartial ).toBe( true );
			expect( startTextProxy.isPartial ).toBe( true );
			expect( fullTextProxy.isPartial ).toBe( false );
		} );

		it( 'should throw if wrong offsetInText is passed', () => {
			expectToThrowCKEditorError( () => {
				new ViewTextProxy( text, -1, 2 ); // eslint-disable-line no-new
			}, /view-textproxy-wrong-offsetintext/ );

			expectToThrowCKEditorError( () => {
				new ViewTextProxy( text, 9, 1 ); // eslint-disable-line no-new
			}, /view-textproxy-wrong-offsetintext/ );
		} );

		it( 'should throw if wrong length is passed', () => {
			expectToThrowCKEditorError( () => {
				new ViewTextProxy( text, 2, -1 ); // eslint-disable-line no-new
			}, /view-textproxy-wrong-length/ );

			expectToThrowCKEditorError( () => {
				new ViewTextProxy( text, 2, 9 ); // eslint-disable-line no-new
			}, /view-textproxy-wrong-length/ );
		} );
	} );

	describe( 'is()', () => {
		it( 'should return true for $textProxy', () => {
			expect( textProxy.is( '$textProxy' ) ).toBe( true );
			expect( textProxy.is( 'view:$textProxy' ) ).toBe( true );
			expect( textProxy.is( 'textProxy' ) ).toBe( true );
			expect( textProxy.is( 'view:textProxy' ) ).toBe( true );
		} );

		it( 'should return false for other accept values', () => {
			expect( textProxy.is( 'node' ) ).toBe( false );
			expect( textProxy.is( 'view:node' ) ).toBe( false );
			expect( textProxy.is( '$text' ) ).toBe( false );
			expect( textProxy.is( 'view:$text' ) ).toBe( false );
			expect( textProxy.is( 'element' ) ).toBe( false );
			expect( textProxy.is( 'containerElement' ) ).toBe( false );
			expect( textProxy.is( 'attributeElement' ) ).toBe( false );
			expect( textProxy.is( 'uiElement' ) ).toBe( false );
			expect( textProxy.is( 'emptyElement' ) ).toBe( false );
			expect( textProxy.is( 'rootElement' ) ).toBe( false );
			expect( textProxy.is( 'documentFragment' ) ).toBe( false );
			expect( textProxy.is( 'model:$textProxy' ) ).toBe( false );
		} );
	} );

	describe( 'offsetSize', () => {
		it( 'should be equal to the number of characters in text proxy', () => {
			expect( textProxy.offsetSize ).toBe( 3 );
		} );
	} );

	describe( 'getDocument', () => {
		it( 'should return Document attached to the parent element', () => {
			const root = new ViewRootEditableElement( document, 'div' );

			wrapper.parent = root;

			expect( textProxy.document ).toBe( document );
		} );

		it( 'should return Document if element is inside DocumentFragment', () => {
			new ViewDocumentFragment( document, [ wrapper ] ); // eslint-disable-line no-new

			expect( textProxy.document ).toBe( document );
		} );
	} );

	describe( 'getRoot', () => {
		it( 'should return root element', () => {
			const docMock = createViewDocumentMock();
			const root = new ViewRootEditableElement( docMock, 'div' );

			wrapper.parent = root;

			expect( textProxy.root ).toBe( root );
		} );
	} );

	describe( 'getAncestors', () => {
		it( 'should return array of ancestors', () => {
			const result = textProxy.getAncestors();

			expect( Array.isArray( result ) ).toBe( true );
			expect( result ).toHaveLength( 2 );
			expect( result[ 0 ] ).toBe( wrapper );
			expect( result[ 1 ] ).toBe( parent );
		} );

		it( 'should return array of ancestors starting from parent `parentFirst`', () => {
			const result = textProxy.getAncestors( { parentFirst: true } );

			expect( result.length ).toBe( 2 );
			expect( result[ 0 ] ).toBe( parent );
			expect( result[ 1 ] ).toBe( wrapper );
		} );

		it( 'should return array including node itself `includeSelf`', () => {
			const result = textProxy.getAncestors( { includeSelf: true } );

			expect( Array.isArray( result ) ).toBe( true );
			expect( result ).toHaveLength( 3 );
			expect( result[ 0 ] ).toBe( wrapper );
			expect( result[ 1 ] ).toBe( parent );
			expect( result[ 2 ] ).toBe( text );
		} );

		it( 'should return array of ancestors including node itself `includeSelf` starting from parent `parentFirst`', () => {
			const result = textProxy.getAncestors( { includeSelf: true, parentFirst: true } );

			expect( result.length ).toBe( 3 );
			expect( result[ 0 ] ).toBe( text );
			expect( result[ 1 ] ).toBe( parent );
			expect( result[ 2 ] ).toBe( wrapper );
		} );
	} );
} );
