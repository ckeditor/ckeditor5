/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ModelConsumable } from '../../src/conversion/modelconsumable.js';
import { ModelElement } from '../../src/model/element.js';
import { ModelTextProxy } from '../../src/model/textproxy.js';
import { ModelText } from '../../src/model/text.js';

describe( 'ModelConsumable', () => {
	let modelConsumable, modelElement;

	beforeEach( () => {
		modelConsumable = new ModelConsumable();
		modelElement = new ModelElement( 'paragraph', null, new ModelText( 'foobar' ) );
	} );

	describe( 'add()', () => {
		it( 'should add consumable value from given element of given type', () => {
			modelConsumable.add( modelElement, 'type' );

			expect( modelConsumable.test( modelElement, 'type' ) ).toBe( true );
		} );

		it( 'should store multiple values for one element', () => {
			modelConsumable.add( modelElement, 'typeA' );
			modelConsumable.add( modelElement, 'typeB' );
			modelConsumable.add( modelElement, 'typeC' );

			expect( modelConsumable.test( modelElement, 'typeA' ) ).toBe( true );
			expect( modelConsumable.test( modelElement, 'typeB' ) ).toBe( true );
			expect( modelConsumable.test( modelElement, 'typeC' ) ).toBe( true );
		} );

		it( 'should correctly add text proxy instances', () => {
			const modelTextProxy = new ModelTextProxy( modelElement.getChild( 0 ), 1, 3 );

			modelConsumable.add( modelTextProxy, 'type' );

			expect( modelConsumable.test( modelTextProxy, 'type' ) ).toBe( true );
		} );

		it( 'should normalize type name', () => {
			modelConsumable.add( modelElement, 'foo:bar:baz:abc' );

			expect( modelConsumable.test( modelElement, 'foo:bar:baz:abc' ) ).toBe( true );
			expect( modelConsumable.test( modelElement, 'foo:bar:baz' ) ).toBe( true );
			expect( modelConsumable.test( modelElement, 'foo:bar' ) ).toBe( true );
			expect( modelConsumable.test( modelElement, 'foo:bar:xxx' ) ).toBe( true );

			expect( modelConsumable.test( modelElement, 'foo:xxx' ) ).toBeNull();
		} );

		it( 'should normalize type name for inserts', () => {
			modelConsumable.add( modelElement, 'insert:foo' );

			expect( modelConsumable.test( modelElement, 'insert:foo' ) ).toBe( true );
			expect( modelConsumable.test( modelElement, 'insert' ) ).toBe( true );
		} );

		it( 'should not normalize type name for markers', () => {
			modelConsumable.add( modelElement, 'addMarker:foo:bar:baz:abc' );
			modelConsumable.add( modelElement, 'removeMarker:foo:bar:baz:abc' );

			expect( modelConsumable.test( modelElement, 'addMarker:foo:bar:baz:abc' ) ).toBe( true );
			expect( modelConsumable.test( modelElement, 'addMarker:foo:bar:baz' ) ).toBeNull();
			expect( modelConsumable.test( modelElement, 'addMarker:foo:bar' ) ).toBeNull();
			expect( modelConsumable.test( modelElement, 'addMarker:foo:bar:xxx' ) ).toBeNull();
			expect( modelConsumable.test( modelElement, 'addMarker:foo:xxx' ) ).toBeNull();

			expect( modelConsumable.test( modelElement, 'removeMarker:foo:bar:baz:abc' ) ).toBe( true );
			expect( modelConsumable.test( modelElement, 'removeMarker:foo:bar:baz' ) ).toBeNull();
			expect( modelConsumable.test( modelElement, 'removeMarker:foo:bar' ) ).toBeNull();
			expect( modelConsumable.test( modelElement, 'removeMarker:foo:bar:xxx' ) ).toBeNull();
			expect( modelConsumable.test( modelElement, 'removeMarker:foo:xxx' ) ).toBeNull();
		} );
	} );

	describe( 'consume()', () => {
		it( 'should remove consumable value of given type for given element and return true', () => {
			modelConsumable.add( modelElement, 'type' );

			const result = modelConsumable.consume( modelElement, 'type' );

			expect( result ).toBe( true );
			expect( modelConsumable.test( modelElement, 'type' ) ).toBe( false );
		} );

		it( 'should return false if given type of consumable was not added for given element', () => {
			const result = modelConsumable.consume( modelElement, 'type' );

			expect( result ).toBe( false );
		} );

		it( 'should correctly consume text proxy instances', () => {
			const proxy1To4 = new ModelTextProxy( modelElement.getChild( 0 ), 1, 3 );
			const proxy1To5 = new ModelTextProxy( modelElement.getChild( 0 ), 1, 4 );
			const proxyOther1To4 = new ModelTextProxy( new ModelText( 'abcdef' ), 1, 3 );

			modelConsumable.add( proxy1To4, 'type' );

			expect( modelConsumable.consume( proxy1To5, 'type' ) ).toBe( false );
			expect( modelConsumable.consume( proxyOther1To4, 'type' ) ).toBe( false );

			const equalProxy1To4 = new ModelTextProxy( modelElement.getChild( 0 ), 1, 3 );
			const result = modelConsumable.consume( equalProxy1To4, 'type' );

			expect( result ).toBe( true );
			expect( modelConsumable.test( proxy1To4, 'type' ) ).toBe( false );
		} );

		it( 'should normalize type name', () => {
			modelConsumable.add( modelElement, 'foo:bar:baz:abc' );
			const result = modelConsumable.consume( modelElement, 'foo:bar:baz' );

			expect( result ).toBe( true );

			expect( modelConsumable.test( modelElement, 'foo:bar:baz:abc' ) ).toBe( false );
			expect( modelConsumable.test( modelElement, 'foo:bar:baz' ) ).toBe( false );
			expect( modelConsumable.test( modelElement, 'foo:bar' ) ).toBe( false );
		} );

		it( 'should normalize type name for inserts', () => {
			modelConsumable.add( modelElement, 'insert' );
			const result = modelConsumable.consume( modelElement, 'insert:foo' );

			expect( result ).toBe( true );

			expect( modelConsumable.test( modelElement, 'insert:foo' ) ).toBe( false );
			expect( modelConsumable.test( modelElement, 'insert' ) ).toBe( false );
		} );

		it( 'should not normalize type names for markers', () => {
			modelConsumable.add( modelElement, 'addMarker:foo:bar:baz' );
			modelConsumable.add( modelElement, 'removeMarker:foo:bar:baz' );

			const addResult = modelConsumable.consume( modelElement, 'addMarker:foo:bar:baz' );
			const removeResult = modelConsumable.consume( modelElement, 'removeMarker:foo:bar:baz' );

			expect( addResult ).toBe( true );
			expect( removeResult ).toBe( true );

			expect( modelConsumable.test( modelElement, 'addMarker:foo:bar:baz:abc' ) ).toBeNull();
			expect( modelConsumable.test( modelElement, 'addMarker:foo:bar:baz' ) ).toBe( false );
			expect( modelConsumable.test( modelElement, 'addMarker:foo:bar' ) ).toBeNull();
			expect( modelConsumable.test( modelElement, 'addMarker:foo' ) ).toBeNull();

			expect( modelConsumable.test( modelElement, 'removeMarker:foo:bar:baz:abc' ) ).toBeNull();
			expect( modelConsumable.test( modelElement, 'removeMarker:foo:bar:baz' ) ).toBe( false );
			expect( modelConsumable.test( modelElement, 'removeMarker:foo:bar' ) ).toBeNull();
			expect( modelConsumable.test( modelElement, 'removeMarker:foo' ) ).toBeNull();
		} );
	} );

	describe( 'revert()', () => {
		it( 'should re-add consumable value if it was already consumed and return true', () => {
			modelConsumable.add( modelElement, 'type' );
			modelConsumable.consume( modelElement, 'type' );

			const result = modelConsumable.revert( modelElement, 'type' );

			expect( result ).toBe( true );
			expect( modelConsumable.test( modelElement, 'type' ) ).toBe( true );
		} );

		it( 'should return false if consumable value has not been yet consumed', () => {
			modelConsumable.add( modelElement, 'type' );

			const result = modelConsumable.revert( modelElement, 'type' );

			expect( result ).toBe( false );
		} );

		it( 'should return null if consumable value of given type has never been added for given element', () => {
			const result = modelConsumable.revert( modelElement, 'type' );

			expect( result ).toBeNull();
		} );

		it( 'should correctly revert text proxy instances', () => {
			const modelTextProxy = new ModelTextProxy( modelElement.getChild( 0 ), 1, 3 );

			modelConsumable.add( modelTextProxy, 'type' );
			modelConsumable.consume( modelTextProxy, 'type' );

			const result = modelConsumable.revert( modelTextProxy, 'type' );

			expect( result ).toBe( true );
			expect( modelConsumable.test( modelTextProxy, 'type' ) ).toBe( true );
		} );

		it( 'should normalize type name', () => {
			modelConsumable.add( modelElement, 'foo:bar:baz:abc' );
			modelConsumable.consume( modelElement, 'foo:bar:baz' );

			const result = modelConsumable.revert( modelElement, 'foo:bar:baz' );

			expect( result ).toBe( true );

			expect( modelConsumable.test( modelElement, 'foo:bar:baz:abc' ) ).toBe( true );
			expect( modelConsumable.test( modelElement, 'foo:bar:baz' ) ).toBe( true );
			expect( modelConsumable.test( modelElement, 'foo:bar' ) ).toBe( true );
		} );
	} );

	describe( 'test()', () => {
		it( 'should return null if consumable value of given type has never been added for given element', () => {
			expect( modelConsumable.test( modelElement, 'typeA' ) ).toBeNull();

			modelConsumable.add( modelElement, 'typeA' );

			expect( modelConsumable.test( modelElement, 'typeB' ) ).toBeNull();
		} );

		it( 'should correctly test for text proxy instances', () => {
			const proxy1To4 = new ModelTextProxy( modelElement.getChild( 0 ), 1, 3 );
			const proxy1To5 = new ModelTextProxy( modelElement.getChild( 0 ), 1, 4 );
			const proxyOther1To4 = new ModelTextProxy( new ModelText( 'abcdef' ), 1, 3 );
			const equalProxy1To4 = new ModelTextProxy( modelElement.getChild( 0 ), 1, 3 );

			modelConsumable.add( proxy1To4, 'type' );

			expect( modelConsumable.test( proxy1To4, 'type' ) ).toBe( true );
			expect( modelConsumable.test( proxy1To4, 'otherType' ) ).toBeNull();
			expect( modelConsumable.test( proxy1To5, 'type' ) ).toBeNull();
			expect( modelConsumable.test( proxyOther1To4, 'type' ) ).toBeNull();
			expect( modelConsumable.test( equalProxy1To4, 'type' ) ).toBe( true );
		} );
	} );

	describe( 'verifyAllConsumed()', () => {
		it( 'should not throw if all events were consumed', () => {
			modelConsumable.add( modelElement, 'insert:paragraph' );
			modelConsumable.add( modelElement, 'attribute:foo:paragraph' );
			modelConsumable.add( new ModelTextProxy( modelElement.getChild( 0 ), 0, 6 ), 'insert:$text' );
			modelConsumable.add( new ModelTextProxy( modelElement.getChild( 0 ), 0, 3 ), 'insert:$text' );
			modelConsumable.add( new ModelTextProxy( modelElement.getChild( 0 ), 3, 3 ), 'insert:$text' );

			modelConsumable.consume( modelElement, 'insert:paragraph' );
			modelConsumable.consume( modelElement, 'attribute:foo:paragraph' );
			modelConsumable.consume( new ModelTextProxy( modelElement.getChild( 0 ), 0, 6 ), 'insert:$text' );
			modelConsumable.consume( new ModelTextProxy( modelElement.getChild( 0 ), 0, 3 ), 'insert:$text' );
			modelConsumable.consume( new ModelTextProxy( modelElement.getChild( 0 ), 3, 3 ), 'insert:$text' );

			expect( () => modelConsumable.verifyAllConsumed( 'insert' ) ).to.not.throw();
		} );

		it( 'should not throw if all events from specified group were consumed', () => {
			modelConsumable.add( modelElement, 'insert:paragraph' );
			modelConsumable.add( modelElement, 'attribute:foo:paragraph' );
			modelConsumable.add( new ModelTextProxy( modelElement.getChild( 0 ), 0, 6 ), 'insert:$text' );
			modelConsumable.add( new ModelTextProxy( modelElement.getChild( 0 ), 0, 3 ), 'insert:$text' );
			modelConsumable.add( new ModelTextProxy( modelElement.getChild( 0 ), 3, 3 ), 'insert:$text' );

			modelConsumable.consume( modelElement, 'insert:paragraph' );
			modelConsumable.consume( new ModelTextProxy( modelElement.getChild( 0 ), 0, 6 ), 'insert:$text' );
			modelConsumable.consume( new ModelTextProxy( modelElement.getChild( 0 ), 0, 3 ), 'insert:$text' );
			modelConsumable.consume( new ModelTextProxy( modelElement.getChild( 0 ), 3, 3 ), 'insert:$text' );

			expect( () => modelConsumable.verifyAllConsumed( 'insert' ) ).to.not.throw();
		} );

		it( 'should throw if some element event was not consumed', () => {
			modelConsumable.add( modelElement, 'insert:paragraph' );
			modelConsumable.add( new ModelTextProxy( modelElement.getChild( 0 ), 0, 6 ), 'insert:$text' );

			modelConsumable.consume( new ModelTextProxy( modelElement.getChild( 0 ), 0, 6 ), 'insert:$text' );

			expect( () => modelConsumable.verifyAllConsumed( 'insert' ) )
				.toThrow( 'conversion-model-consumable-not-consumed' );
		} );

		it( 'should throw if some text node event was not consumed', () => {
			modelConsumable.add( modelElement, 'insert:paragraph' );
			modelConsumable.add( new ModelTextProxy( modelElement.getChild( 0 ), 0, 6 ), 'insert:$text' );

			modelConsumable.consume( modelElement, 'insert:paragraph' );

			expect( () => modelConsumable.verifyAllConsumed( 'insert' ) )
				.toThrow( 'conversion-model-consumable-not-consumed' );
		} );
	} );
} );
