/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AutomaticLinkDecorators } from '../../src/utils/automaticdecorators.js';

describe( 'Automatic Decorators', () => {
	let automaticDecorators;
	beforeEach( () => {
		automaticDecorators = new AutomaticLinkDecorators();
	} );

	describe( 'constructor()', () => {
		it( 'initialise with empty Set', () => {
			expect( automaticDecorators._definitions ).toBeInstanceOf( Set );
		} );
	} );

	it( 'has length equal 0 after initialization', () => {
		expect( automaticDecorators.length ).toBe( 0 );
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
			expect( automaticDecorators.length ).toBe( 0 );

			automaticDecorators.add( tests[ 0 ] );
			expect( automaticDecorators.length ).toBe( 1 );

			const firstValue = automaticDecorators._definitions.values().next().value;

			expect( firstValue ).toMatchObject( {
				mode: 'automatic',
				attributes: {
					foo: 'bar'
				}
			} );
			expect( firstValue ).toHaveProperty( 'callback' );
			expect( typeof firstValue.callback ).toBe( 'function' );
		} );

		it( 'can accept array of objects', () => {
			expect( automaticDecorators.length ).toBe( 0 );

			automaticDecorators.add( tests );

			expect( automaticDecorators.length ).toBe( 3 );

			const setIterator = automaticDecorators._definitions.values();
			setIterator.next();
			setIterator.next();
			const thirdValue = setIterator.next().value;

			expect( thirdValue ).toMatchObject( {
				mode: 'automatic',
				attributes: {
					test1: 'one',
					test2: 'two',
					test3: 'three'
				}
			} );
			expect( thirdValue ).toHaveProperty( 'callback' );
			expect( typeof thirdValue.callback ).toBe( 'function' );
		} );
	} );

	describe( 'getDispatcher()', () => {
		it( 'should return a dispatcher function', () => {
			expect( typeof automaticDecorators.getDispatcher() ).toBe( 'function' );
		} );
	} );

	describe( 'getDispatcherForLinkedImage()', () => {
		it( 'should return a dispatcher function', () => {
			expect( typeof automaticDecorators.getDispatcherForLinkedImage() ).toBe( 'function' );
		} );
	} );
} );
