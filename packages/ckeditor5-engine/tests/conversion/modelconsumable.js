/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ModelConsumable from '../../src/conversion/modelconsumable';
import ModelElement from '../../src/model/element';
import ModelTextProxy from '../../src/model/textproxy';
import ModelText from '../../src/model/text';

describe( 'ModelConsumable', () => {
	let modelConsumable, modelElement;

	beforeEach( () => {
		modelConsumable = new ModelConsumable();
		modelElement = new ModelElement( 'paragraph', null, new ModelText( 'foobar' ) );
	} );

	describe( 'add', () => {
		it( 'should add consumable value from given element of given type', () => {
			modelConsumable.add( modelElement, 'type' );

			expect( modelConsumable.test( modelElement, 'type' ) ).to.be.true;
		} );

		it( 'should store multiple values for one element', () => {
			modelConsumable.add( modelElement, 'typeA' );
			modelConsumable.add( modelElement, 'typeB' );
			modelConsumable.add( modelElement, 'typeC' );

			expect( modelConsumable.test( modelElement, 'typeA' ) ).to.be.true;
			expect( modelConsumable.test( modelElement, 'typeB' ) ).to.be.true;
			expect( modelConsumable.test( modelElement, 'typeC' ) ).to.be.true;
		} );

		it( 'should correctly add text proxy instances', () => {
			const modelTextProxy = new ModelTextProxy( modelElement.getChild( 0 ), 1, 3 );

			modelConsumable.add( modelTextProxy, 'type' );

			expect( modelConsumable.test( modelTextProxy, 'type' ) ).to.be.true;
		} );

		it( 'should normalize type name', () => {
			modelConsumable.add( modelElement, 'foo:bar:baz:abc' );

			expect( modelConsumable.test( modelElement, 'foo:bar:baz:abc' ) ).to.be.true;
			expect( modelConsumable.test( modelElement, 'foo:bar:baz' ) ).to.be.true;
			expect( modelConsumable.test( modelElement, 'foo:bar' ) ).to.be.true;
			expect( modelConsumable.test( modelElement, 'foo:bar:xxx' ) ).to.be.true;

			expect( modelConsumable.test( modelElement, 'foo:xxx' ) ).to.be.null;
		} );
	} );

	describe( 'consume', () => {
		it( 'should remove consumable value of given type for given element and return true', () => {
			modelConsumable.add( modelElement, 'type' );

			const result = modelConsumable.consume( modelElement, 'type' );

			expect( result ).to.be.true;
			expect( modelConsumable.test( modelElement, 'type' ) ).to.be.false;
		} );

		it( 'should return false if given type of consumable was not added for given element', () => {
			const result = modelConsumable.consume( modelElement, 'type' );

			expect( result ).to.be.false;
		} );

		it( 'should correctly consume text proxy instances', () => {
			const proxy1To4 = new ModelTextProxy( modelElement.getChild( 0 ), 1, 3 );
			const proxy1To5 = new ModelTextProxy( modelElement.getChild( 0 ), 1, 4 );
			const proxyOther1To4 = new ModelTextProxy( new ModelText( 'abcdef' ), 1, 3 );

			modelConsumable.add( proxy1To4, 'type' );

			expect( modelConsumable.consume( proxy1To5, 'type' ) ).to.be.false;
			expect( modelConsumable.consume( proxyOther1To4, 'type' ) ).to.be.false;

			const equalProxy1To4 = new ModelTextProxy( modelElement.getChild( 0 ), 1, 3 );
			const result = modelConsumable.consume( equalProxy1To4, 'type' );

			expect( result ).to.be.true;
			expect( modelConsumable.test( proxy1To4, 'type' ) ).to.be.false;
		} );

		it( 'should normalize type name', () => {
			modelConsumable.add( modelElement, 'foo:bar:baz:abc' );
			const result = modelConsumable.consume( modelElement, 'foo:bar:baz' );

			expect( result ).to.be.true;

			expect( modelConsumable.test( modelElement, 'foo:bar:baz:abc' ) ).to.be.false;
			expect( modelConsumable.test( modelElement, 'foo:bar:baz' ) ).to.be.false;
			expect( modelConsumable.test( modelElement, 'foo:bar' ) ).to.be.false;
		} );
	} );

	describe( 'revert', () => {
		it( 'should re-add consumable value if it was already consumed and return true', () => {
			modelConsumable.add( modelElement, 'type' );
			modelConsumable.consume( modelElement, 'type' );

			const result = modelConsumable.revert( modelElement, 'type' );

			expect( result ).to.be.true;
			expect( modelConsumable.test( modelElement, 'type' ) ).to.be.true;
		} );

		it( 'should return false if consumable value has not been yet consumed', () => {
			modelConsumable.add( modelElement, 'type' );

			const result = modelConsumable.revert( modelElement, 'type' );

			expect( result ).to.be.false;
		} );

		it( 'should return null if consumable value of given type has never been added for given element', () => {
			const result = modelConsumable.revert( modelElement, 'type' );

			expect( result ).to.be.null;
		} );

		it( 'should correctly revert text proxy instances', () => {
			const modelTextProxy = new ModelTextProxy( modelElement.getChild( 0 ), 1, 3 );

			modelConsumable.add( modelTextProxy, 'type' );
			modelConsumable.consume( modelTextProxy, 'type' );

			const result = modelConsumable.revert( modelTextProxy, 'type' );

			expect( result ).to.be.true;
			expect( modelConsumable.test( modelTextProxy, 'type' ) ).to.be.true;
		} );

		it( 'should normalize type name', () => {
			modelConsumable.add( modelElement, 'foo:bar:baz:abc' );
			modelConsumable.consume( modelElement, 'foo:bar:baz' );

			const result = modelConsumable.revert( modelElement, 'foo:bar:baz' );

			expect( result ).to.be.true;

			expect( modelConsumable.test( modelElement, 'foo:bar:baz:abc' ) ).to.be.true;
			expect( modelConsumable.test( modelElement, 'foo:bar:baz' ) ).to.be.true;
			expect( modelConsumable.test( modelElement, 'foo:bar' ) ).to.be.true;
		} );
	} );

	describe( 'test', () => {
		it( 'should return null if consumable value of given type has never been added for given element', () => {
			expect( modelConsumable.test( modelElement, 'typeA' ) ).to.be.null;

			modelConsumable.add( modelElement, 'typeA' );

			expect( modelConsumable.test( modelElement, 'typeB' ) ).to.be.null;
		} );

		it( 'should correctly test for text proxy instances', () => {
			const proxy1To4 = new ModelTextProxy( modelElement.getChild( 0 ), 1, 3 );
			const proxy1To5 = new ModelTextProxy( modelElement.getChild( 0 ), 1, 4 );
			const proxyOther1To4 = new ModelTextProxy( new ModelText( 'abcdef' ), 1, 3 );
			const equalProxy1To4 = new ModelTextProxy( modelElement.getChild( 0 ), 1, 3 );

			modelConsumable.add( proxy1To4, 'type' );

			expect( modelConsumable.test( proxy1To4, 'type' ) ).to.be.true;
			expect( modelConsumable.test( proxy1To4, 'otherType' ) ).to.be.null;
			expect( modelConsumable.test( proxy1To5, 'type' ) ).to.be.null;
			expect( modelConsumable.test( proxyOther1To4, 'type' ) ).to.be.null;
			expect( modelConsumable.test( equalProxy1To4, 'type' ) ).to.be.true;
		} );
	} );
} );
