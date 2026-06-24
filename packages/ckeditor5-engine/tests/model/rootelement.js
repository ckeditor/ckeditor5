/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { Model } from '../../src/model/model.js';
import { ModelElement } from '../../src/model/element.js';
import { ModelRootElement } from '../../src/model/rootelement.js';
import { count } from '@ckeditor/ckeditor5-utils';

describe( 'RootElement', () => {
	describe( 'constructor()', () => {
		it( 'should create attached root element without attributes', () => {
			const model = new Model();
			const doc = model.document;
			const root = new ModelRootElement( doc );

			expect( root ).toBeInstanceOf( ModelElement );
			expect( root.isAttached() ).toBe( true );
			expect( root ).toHaveProperty( 'document', doc );
			expect( count( root.getAttributes() ) ).toBe( 0 );
			expect( root.childCount ).toBe( 0 );
		} );
	} );

	describe( 'is()', () => {
		let root;

		beforeAll( () => {
			const model = new Model();
			const doc = model.document;

			root = new ModelRootElement( doc, '$root' );
		} );

		it( 'should return true for rootElement, element, element with same name and element name', () => {
			expect( root.is( 'element', '$root' ) ).toBe( true );
			expect( root.is( 'model:element', '$root' ) ).toBe( true );
			expect( root.is( 'element' ) ).toBe( true );
			expect( root.is( 'model:element' ) ).toBe( true );
			expect( root.is( 'rootElement', '$root' ) ).toBe( true );
			expect( root.is( 'model:rootElement', '$root' ) ).toBe( true );
			expect( root.is( 'rootElement' ) ).toBe( true );
			expect( root.is( 'model:rootElement' ) ).toBe( true );
			expect( root.is( 'node' ) ).toBe( true );
			expect( root.is( 'model:node' ) ).toBe( true );
		} );

		it( 'should return false for other accept values', () => {
			expect( root.is( 'element', '$graveyard' ) ).toBe( false );
			expect( root.is( 'model:element', '$graveyard' ) ).toBe( false );
			expect( root.is( 'rootElement', '$graveyard' ) ).toBe( false );
			expect( root.is( 'model:rootElement', '$graveyard' ) ).toBe( false );
			expect( root.is( '$graveyard' ) ).toBe( false );
			expect( root.is( '$text' ) ).toBe( false );
			expect( root.is( '$textProxy' ) ).toBe( false );
			expect( root.is( 'documentFragment' ) ).toBe( false );
			expect( root.is( 'view:element' ) ).toBe( false );
			expect( root.is( '$root' ) ).toBe( false );
			expect( root.is( 'model:$root' ) ).toBe( false );
			expect( root.is( 'node', '$root' ) ).toBe( false );
			expect( root.is( 'model:node', '$root' ) ).toBe( false );
		} );
	} );
} );
