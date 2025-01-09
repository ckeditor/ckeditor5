/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import AutomaticDecorators from '../../src/utils/automaticdecorators.js';

describe( 'Automatic Decorators', () => {
	let automaticDecorators;
	beforeEach( () => {
		automaticDecorators = new AutomaticDecorators();
	} );

	describe( 'constructor()', () => {
		it( 'initialise with empty Set', () => {
			expect( automaticDecorators._definitions ).to.be.instanceOf( Set );
		} );
	} );

	it( 'has length equal 0 after initialization', () => {
		expect( automaticDecorators.length ).to.equal( 0 );
	} );

	describe( 'add()', () => {
		const tests = [
			{
				mode: 'automatic',
				callback: () => {},
				attributes: {
					foo: 'bar'
				}
			},
			{
				mode: 'automatic',
				callback: () => {},
				attributes: {
					bar: 'baz'
				}
			},
			{
				mode: 'automatic',
				callback: () => {},
				attributes: {
					test1: 'one',
					test2: 'two',
					test3: 'three'
				}
			}
		];
		it( 'can accept single object', () => {
			expect( automaticDecorators.length ).to.equal( 0 );

			automaticDecorators.add( tests[ 0 ] );
			expect( automaticDecorators.length ).to.equal( 1 );

			const firstValue = automaticDecorators._definitions.values().next().value;

			expect( firstValue ).to.deep.include( {
				mode: 'automatic',
				attributes: {
					foo: 'bar'
				}
			} );
			expect( firstValue ).to.have.property( 'callback' );
			expect( firstValue.callback ).to.be.a( 'function' );
		} );

		it( 'can accept array of objects', () => {
			expect( automaticDecorators.length ).to.equal( 0 );

			automaticDecorators.add( tests );

			expect( automaticDecorators.length ).to.equal( 3 );

			const setIterator = automaticDecorators._definitions.values();
			setIterator.next();
			setIterator.next();
			const thirdValue = setIterator.next().value;

			expect( thirdValue ).to.deep.include( {
				mode: 'automatic',
				attributes: {
					test1: 'one',
					test2: 'two',
					test3: 'three'
				}
			} );
			expect( thirdValue ).to.have.property( 'callback' );
			expect( thirdValue.callback ).to.be.a( 'function' );
		} );
	} );

	describe( 'getDispatcher()', () => {
		it( 'should return a dispatcher function', () => {
			expect( automaticDecorators.getDispatcher() ).to.be.a( 'function' );
		} );
	} );

	describe( 'getDispatcherForLinkedImage()', () => {
		it( 'should return a dispatcher function', () => {
			expect( automaticDecorators.getDispatcherForLinkedImage() ).to.be.a( 'function' );
		} );
	} );
} );
