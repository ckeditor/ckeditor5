/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { global } from '../../src/dom/global.js';
import { ResizeObserver } from '../../src/dom/resizeobserver.js';

describe( 'ResizeObserver()', () => {
	let elementA, elementB;

	beforeEach( () => {
		// Make sure other tests of the editor do not affect tests that follow.
		// Without it, if an instance of ResizeObserver already exists somewhere undestroyed
		// in DOM, any DOM mock will have no effect.
		ResizeObserver._observerInstance = null;

		elementA = document.createElement( 'div' );
		elementA.id = 'A';
		elementB = document.createElement( 'div' );
		elementB.id = 'B';

		document.body.appendChild( elementA );
		document.body.appendChild( elementB );
	} );

	afterEach( () => {
		// Make it look like the module was loaded from scratch.
		ResizeObserver._observerInstance = null;
		ResizeObserver._elementCallbacks = null;
		vi.restoreAllMocks();

		elementA.remove();
		elementB.remove();
	} );

	describe( 'constructor()', () => {
		it( 'should use the native implementation if available', () => {
			const spy = vi.fn();

			vi.spyOn( global.window, 'ResizeObserver' ).mockImplementation( function() {
				return {
					observe: spy,
					unobserve: vi.fn()
				};
			} );

			const observer = new ResizeObserver( elementA, () => {} );

			expect( spy ).toHaveBeenCalledTimes( 1 );

			observer.destroy();
		} );

		it( 'should re-use the same native observer instance over and over again', () => {
			const elementA = document.createElement( 'div' );
			const elementB = document.createElement( 'div' );

			vi.spyOn( global.window, 'ResizeObserver' ).mockImplementation( function() {
				return {
					observe() {},
					unobserve() {}
				};
			} );

			const observerA = new ResizeObserver( elementA, () => {} );
			const observerB = new ResizeObserver( elementB, () => {} );

			expect( global.window.ResizeObserver ).toHaveBeenCalledTimes( 1 );

			observerA.destroy();
			observerB.destroy();
		} );

		it( 'should react to resizing of an element', () => {
			const callbackA = vi.fn();
			let resizeCallback;

			vi.spyOn( global.window, 'ResizeObserver' ).mockImplementation( function( callback ) {
				resizeCallback = callback;

				return {
					observe() {},
					unobserve() {}
				};
			} );

			const observerA = new ResizeObserver( elementA, callbackA );

			resizeCallback( [
				{ target: elementA }
			] );

			expect( callbackA ).toHaveBeenCalledTimes( 1 );
			expect( callbackA ).toHaveBeenNthCalledWith( 1, { target: elementA } );

			observerA.destroy();
		} );

		it( 'should be able to observe the same element along with other observers', () => {
			const callbackA = vi.fn();
			const callbackB = vi.fn();
			let resizeCallback;

			vi.spyOn( global.window, 'ResizeObserver' ).mockImplementation( function( callback ) {
				resizeCallback = callback;

				return {
					observe() {},
					unobserve() {}
				};
			} );

			const observerA = new ResizeObserver( elementA, callbackA );
			const observerB = new ResizeObserver( elementA, callbackB );

			resizeCallback( [
				{ target: elementA }
			] );

			expect( callbackA ).toHaveBeenCalledTimes( 1 );
			expect( callbackA ).toHaveBeenCalledWith( { target: elementA } );
			expect( callbackB ).toHaveBeenCalledTimes( 1 );
			expect( callbackB ).toHaveBeenCalledWith( { target: elementA } );

			observerA.destroy();
			observerB.destroy();
		} );

		it( 'should not be affected by other observers being destroyed', () => {
			const callbackA = vi.fn();
			const callbackB = vi.fn();
			let resizeCallback;

			vi.spyOn( global.window, 'ResizeObserver' ).mockImplementation( function( callback ) {
				resizeCallback = callback;

				return {
					observe() {},
					unobserve() {}
				};
			} );

			const observerA = new ResizeObserver( elementA, callbackA );
			const observerB = new ResizeObserver( elementA, callbackB );

			resizeCallback( [
				{ target: elementA }
			] );

			expect( callbackA ).toHaveBeenCalledTimes( 1 );
			expect( callbackA ).toHaveBeenCalledWith( { target: elementA } );
			expect( callbackB ).toHaveBeenCalledTimes( 1 );
			expect( callbackB ).toHaveBeenCalledWith( { target: elementA } );

			observerB.destroy();

			resizeCallback( [
				{ target: elementA }
			] );

			expect( callbackA ).toHaveBeenCalledTimes( 2 );
			expect( callbackA ).toHaveBeenNthCalledWith( 2, { target: elementA } );
			expect( callbackB ).toHaveBeenCalledTimes( 1 );
			expect( callbackB ).toHaveBeenCalledWith( { target: elementA } );

			observerA.destroy();
		} );
	} );

	describe( 'element', () => {
		it( 'should return observed element', () => {
			const observer = new ResizeObserver( elementA, () => {} );

			expect( observer.element ).toBe( elementA );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should make the observer stop responding to resize of an element', () => {
			const callbackA = vi.fn();
			let resizeCallback;

			vi.spyOn( global.window, 'ResizeObserver' ).mockImplementation( function( callback ) {
				resizeCallback = callback;

				return {
					observe() {},
					unobserve() {}
				};
			} );

			const observerA = new ResizeObserver( elementA, callbackA );

			resizeCallback( [
				{ target: elementA }
			] );

			expect( callbackA ).toHaveBeenCalledTimes( 1 );

			observerA.destroy();

			resizeCallback( [
				{ target: elementA }
			] );

			expect( callbackA ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should not throw if called multiple times', () => {
			const callbackA = vi.fn();
			const observerA = new ResizeObserver( elementA, callbackA );

			expect( () => {
				observerA.destroy();
				observerA.destroy();
			} ).not.toThrow();
		} );
	} );
} );
