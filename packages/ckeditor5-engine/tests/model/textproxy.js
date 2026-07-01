/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ModelElement } from '../../src/model/element.js';
import { ModelText } from '../../src/model/text.js';
import { ModelTextProxy } from '../../src/model/textproxy.js';
import { Model } from '../../src/model/model.js';

import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

describe( 'ModelTextProxy', () => {
	let model, doc, element, textProxy, root, textProxyNoParent, text, textNoParent;

	beforeEach( () => {
		model = new Model();
		doc = model.document;
		root = doc.createRoot();
		element = new ModelElement( 'div' );
		root._insertChild( 0, element );

		text = new ModelText( 'foobar', { foo: 'bar' } );
		element._insertChild( 0, [ new ModelText( 'abc' ), text ] );
		textProxy = new ModelTextProxy( text, 2, 3 );

		textNoParent = new ModelText( 'abcxyz' );
		textProxyNoParent = new ModelTextProxy( textNoParent, 1, 1 );
	} );

	it( 'should have data property', () => {
		expect( textProxy ).toHaveProperty( 'data', 'oba' );
		expect( textProxyNoParent ).toHaveProperty( 'data', 'b' );
	} );

	it( 'should have root property', () => {
		expect( textProxy ).toHaveProperty( 'root', root );
		expect( textProxyNoParent ).toHaveProperty( 'root', textNoParent );
	} );

	it( 'should have parent property', () => {
		expect( textProxy ).toHaveProperty( 'parent', element );
		expect( textProxyNoParent ).toHaveProperty( 'parent', null );
	} );

	it( 'should have textNode property', () => {
		expect( textProxy ).toHaveProperty( 'textNode', text );
		expect( textProxyNoParent ).toHaveProperty( 'textNode', textNoParent );
	} );

	it( 'should have startOffset property', () => {
		expect( textProxy.startOffset ).toBe( 5 );
		expect( textProxyNoParent.startOffset ).toBeNull();
	} );

	it( 'should have offsetSize property', () => {
		expect( textProxy.offsetSize ).toBe( 3 );
		expect( textProxyNoParent.offsetSize ).toBe( 1 );
	} );

	it( 'should have endOffset property', () => {
		expect( textProxy.endOffset ).toBe( 8 );
		expect( textProxyNoParent.endOffset ).toBeNull();
	} );

	it( 'should have offsetInText property', () => {
		expect( textProxy.offsetInText ).toBe( 2 );
		expect( textProxyNoParent.offsetInText ).toBe( 1 );
	} );

	it( 'should have isPartial property', () => {
		const startTextProxy = new ModelTextProxy( text, 0, 4 );
		const fullTextProxy = new ModelTextProxy( text, 0, 6 );

		expect( textProxy.isPartial ).toBe( true );
		expect( startTextProxy.isPartial ).toBe( true );
		expect( fullTextProxy.isPartial ).toBe( false );
	} );

	it( 'should throw if wrong offsetInText is passed', () => {
		expectToThrowCKEditorError( () => {
			new ModelTextProxy( text, -1, 2 ); // eslint-disable-line no-new
		}, /model-textproxy-wrong-offsetintext/, model );

		expectToThrowCKEditorError( () => {
			new ModelTextProxy( text, 9, 1 ); // eslint-disable-line no-new
		}, /model-textproxy-wrong-offsetintext/, model );
	} );

	it( 'should throw if wrong length is passed', () => {
		expectToThrowCKEditorError( () => {
			new ModelTextProxy( text, 2, -1 ); // eslint-disable-line no-new
		}, /model-textproxy-wrong-length/, model );

		expectToThrowCKEditorError( () => {
			new ModelTextProxy( text, 2, 9 ); // eslint-disable-line no-new
		}, /model-textproxy-wrong-length/, model );
	} );

	describe( 'is()', () => {
		it( 'should return true for $textProxy', () => {
			expect( textProxy.is( '$textProxy' ) ).toBe( true );
			expect( textProxy.is( 'model:$textProxy' ) ).toBe( true );
			expect( textProxy.is( 'textProxy' ) ).toBe( true );
			expect( textProxy.is( 'model:textProxy' ) ).toBe( true );
		} );

		it( 'should return false for other accept values', () => {
			expect( textProxy.is( 'node' ) ).toBe( false );
			expect( textProxy.is( 'model:node' ) ).toBe( false );
			expect( textProxy.is( '$text' ) ).toBe( false );
			expect( textProxy.is( 'element' ) ).toBe( false );
			expect( textProxy.is( 'model:element', 'imageBlock' ) ).toBe( false );
			expect( textProxy.is( 'documentFragment' ) ).toBe( false );
			expect( textProxy.is( 'rootElement' ) ).toBe( false );
		} );
	} );

	describe( 'getPath', () => {
		it( 'should return path to the text proxy', () => {
			expect( textProxy.getPath() ).toEqual( [ 0, 5 ] );
			expect( textProxyNoParent.getPath() ).toEqual( [] );
		} );
	} );

	describe( 'getAncestors', () => {
		it( 'should return proper array of ancestor nodes', () => {
			expect( textProxy.getAncestors() ).toEqual( [ root, element ] );
		} );

		it( 'should include itself if includeSelf option is set to true', () => {
			expect( textProxy.getAncestors( { includeSelf: true } ) ).toEqual( [ root, element, textProxy ] );
		} );

		it( 'should reverse order if parentFirst option is set to true', () => {
			expect( textProxy.getAncestors( { includeSelf: true, parentFirst: true } ) ).toEqual( [ textProxy, element, root ] );
		} );
	} );

	describe( 'attributes interface', () => {
		describe( 'hasAttribute', () => {
			it( 'should return true if text proxy has attribute with given key', () => {
				expect( textProxy.hasAttribute( 'foo' ) ).toBe( true );
			} );

			it( 'should return false if text proxy does not have attribute with given key', () => {
				expect( textProxy.hasAttribute( 'abc' ) ).toBe( false );
			} );
		} );

		describe( 'getAttribute', () => {
			it( 'should return attribute with given key if text proxy has given attribute', () => {
				expect( textProxy.getAttribute( 'foo' ) ).toBe( 'bar' );
			} );

			it( 'should return undefined if text proxy does not have given attribute', () => {
				expect( textProxy.getAttribute( 'bar' ) ).toBeUndefined();
			} );
		} );

		describe( 'getAttributes', () => {
			it( 'should return an iterator that iterates over all attributes set on the text proxy', () => {
				expect( Array.from( textProxy.getAttributes() ) ).toEqual( [ [ 'foo', 'bar' ] ] );
				expect( Array.from( textProxyNoParent.getAttributes() ) ).toEqual( [] );
			} );
		} );

		describe( 'getAttributeKeys', () => {
			it( 'should return an iterator that iterates over all attribute keys set on the text proxy', () => {
				expect( Array.from( textProxy.getAttributeKeys() ) ).toEqual( [ 'foo' ] );
				expect( Array.from( textProxyNoParent.getAttributeKeys() ) ).toEqual( [] );
			} );
		} );
	} );
} );
