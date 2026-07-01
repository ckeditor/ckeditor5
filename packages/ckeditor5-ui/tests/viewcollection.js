/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { View } from '../src/view.js';
import { ViewCollection } from '../src/viewcollection.js';
import { normalizeHtml } from '@ckeditor/ckeditor5-utils/tests/_utils/normalizehtml.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

let collection;

describe( 'ViewCollection', () => {
	afterEach( () => {
		vi.restoreAllMocks();
	} );

	beforeEach( createTestCollection );

	describe( 'constructor()', () => {
		it( 'sets basic properties and attributes', () => {
			expect( collection._parentElement ).toBeNull();
			expect( collection._idProperty ).toBe( 'viewUid' );
		} );

		it( 'allows setting initial collection items', () => {
			const view1 = new View();
			const view2 = new View();
			const collection = new ViewCollection( [ view1, view2 ] );

			expect( collection ).toHaveLength( 2 );
			expect( collection.get( 0 ) ).toBe( view1 );
			expect( collection.get( 1 ) ).toBe( view2 );
		} );

		describe( 'child view management in DOM', () => {
			it( 'manages view#element of the children in DOM', () => {
				const parentElement = document.createElement( 'p' );
				collection.setParent( parentElement );

				const viewA = new View();

				expect( () => {
					collection.add( viewA );
					collection.remove( viewA );
				} ).not.toThrow();

				expect( () => {
					collection.add( viewA );
					collection.remove( viewA );
				} ).not.toThrow();

				viewA.element = document.createElement( 'b' );
				collection.add( viewA );

				expect( normalizeHtml( parentElement.outerHTML ) ).toBe( '<p><b></b></p>' );

				const viewB = new View();
				viewB.element = document.createElement( 'i' );

				collection.add( viewB, 0 );
				expect( normalizeHtml( parentElement.outerHTML ) ).toBe( '<p><i></i><b></b></p>' );

				collection.remove( viewA );
				expect( normalizeHtml( parentElement.outerHTML ) ).toBe( '<p><i></i></p>' );

				collection.remove( viewB );
				expect( normalizeHtml( parentElement.outerHTML ) ).toBe( '<p></p>' );
			} );

			// #145
			it( 'always keeps the collection synchronized with DOM', () => {
				const view = new View();
				const viewA = getView( 'A' );
				const viewB = getView( 'B' );

				function getView( text ) {
					const view = new View();

					view.setTemplate( {
						tag: 'li',
						children: [
							{
								text
							}
						]
					} );

					return view;
				}

				// Fill the collection with children.
				collection.add( viewA );
				collection.add( viewB );

				// Put the collection in the template.
				view.setTemplate( {
					tag: 'ul',
					children: collection
				} );

				const viewC = getView( 'C' );

				// Modify the collection, while the view#element has already
				// been rendered but the view has **not** been inited yet.
				collection.add( viewC );
				collection.remove( 1 );

				view.render();

				expect( view.element.childNodes ).toHaveLength( 2 );
				expect( view.element.childNodes[ 0 ] ).toBe( viewA.element );
				expect( view.element.childNodes[ 1 ] ).toBe( viewC.element );
			} );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'calls #destroy on all views in the collection', () => {
			const viewA = new View();
			const viewB = new View();

			const spyA = vi.spyOn( viewA, 'destroy' );
			const spyB = vi.spyOn( viewB, 'destroy' );

			collection.add( viewA );
			collection.add( viewB );

			collection.destroy();
			expect( spyA ).toHaveBeenCalledOnce();
			expect( spyB ).toHaveBeenCalledOnce();
			expect( spyA.mock.invocationCallOrder[ 0 ] ).toBeLessThan( spyB.mock.invocationCallOrder[ 0 ] );
		} );
	} );

	describe( 'add()', () => {
		it( 'renders the new view in the collection', () => {
			const view = new View();
			const spy = vi.spyOn( view, 'render' );

			expect( view.isRendered ).toBe( false );

			collection.add( view );
			expect( view.isRendered ).toBe( true );
			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'works for a view with a Number view#id attribute', () => {
			const view = new View();

			view.set( 'id', 1 );

			collection.add( view );
			expect( view.id ).toBe( 1 );
			expect( view.viewUid ).toBeTypeOf( 'string' );
		} );
	} );

	describe( 'setParent()', () => {
		it( 'sets #_parentElement', () => {
			const el = {};
			expect( collection._parentElement ).toBeNull();

			collection.setParent( el );
			expect( collection._parentElement ).toBe( el );
		} );

		it( 'udpates initial collection items in DOM', () => {
			const view1 = new View();
			view1.element = document.createElement( 'i' );
			vi.spyOn( view1, 'render' );

			const view2 = new View();
			view2.element = document.createElement( 'b' );
			vi.spyOn( view2, 'render' );

			const collection = new ViewCollection( [ view1, view2 ] );
			const parentElement = document.createElement( 'div' );

			expect( collection ).toHaveLength( 2 );
			expect( collection.get( 0 ) ).toBe( view1 );
			expect( collection.get( 1 ) ).toBe( view2 );

			collection.setParent( parentElement );
			expect( normalizeHtml( parentElement.outerHTML ) ).toBe( '<div><i></i><b></b></div>' );
			expect( view1.render ).toHaveBeenCalledOnce();
			expect( view2.render ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'delegate()', () => {
		it( 'should throw when event names are not strings', () => {
			expectToThrowCKEditorError( () => {
				collection.delegate();
			}, /ui-viewcollection-delegate-wrong-events/ );

			expectToThrowCKEditorError( () => {
				collection.delegate( new Date() );
			}, /ui-viewcollection-delegate-wrong-events/ );

			expectToThrowCKEditorError( () => {
				collection.delegate( 'color', new Date() );
			}, /ui-viewcollection-delegate-wrong-events/ );
		} );

		it( 'returns object', () => {
			expect( collection.delegate( 'foo' ) ).toBeTypeOf( 'object' );
		} );

		it( 'provides "to()" interface', () => {
			const delegate = collection.delegate( 'foo' );

			expect( delegate ).toHaveProperty( 'to' );
			expect( delegate.to ).toBeTypeOf( 'function' );
		} );

		describe( 'to()', () => {
			it( 'does not chain', () => {
				const returned = collection.delegate( 'foo' ).to( {} );

				expect( returned ).toBeUndefined();
			} );

			it( 'forwards an event to another observable – existing view', () => {
				const target = new View();
				const view = new View();
				let capturedArgs;

				collection.add( view );
				collection.delegate( 'foo' ).to( target );

				target.on( 'foo', ( ...args ) => {
					capturedArgs = args;
				} );

				view.fire( 'foo' );

				expect( capturedArgs ).toBeDefined();
				assertDelegated( capturedArgs, {
					expectedName: 'foo',
					expectedSource: view,
					expectedPath: [ view, target ],
					expectedData: []
				} );
			} );

			it( 'forwards an event to another observable – new view', () => {
				const target = new View();
				const view = new View();
				let capturedArgs;

				collection.delegate( 'foo' ).to( target );
				collection.add( view );

				target.on( 'foo', ( ...args ) => {
					capturedArgs = args;
				} );

				view.fire( 'foo' );

				expect( capturedArgs ).toBeDefined();
				assertDelegated( capturedArgs, {
					expectedName: 'foo',
					expectedSource: view,
					expectedPath: [ view, target ],
					expectedData: []
				} );
			} );

			it( 'forwards multiple events to another observable', () => {
				const target = new View();
				const viewA = new View();
				const viewB = new View();
				const viewC = new View();
				const spyFoo = vi.fn();
				const spyBar = vi.fn();
				const spyBaz = vi.fn();

				collection.delegate( 'foo', 'bar', 'baz' ).to( target );
				collection.add( viewA );
				collection.add( viewB );
				collection.add( viewC );

				target.on( 'foo', spyFoo );
				target.on( 'bar', spyBar );
				target.on( 'baz', spyBaz );

				viewA.fire( 'foo' );

				expect( spyFoo ).toHaveBeenCalledOnce();
				expect( spyBar ).not.toHaveBeenCalled();
				expect( spyBaz ).not.toHaveBeenCalled();

				assertDelegated( spyFoo.mock.calls[ 0 ], {
					expectedName: 'foo',
					expectedSource: viewA,
					expectedPath: [ viewA, target ],
					expectedData: []
				} );

				viewB.fire( 'bar' );

				expect( spyFoo ).toHaveBeenCalledOnce();
				expect( spyBar ).toHaveBeenCalledOnce();
				expect( spyBaz ).not.toHaveBeenCalled();

				assertDelegated( spyBar.mock.calls[ 0 ], {
					expectedName: 'bar',
					expectedSource: viewB,
					expectedPath: [ viewB, target ],
					expectedData: []
				} );

				viewC.fire( 'baz' );

				expect( spyFoo ).toHaveBeenCalledOnce();
				expect( spyBar ).toHaveBeenCalledOnce();
				expect( spyBaz ).toHaveBeenCalledOnce();

				assertDelegated( spyBaz.mock.calls[ 0 ], {
					expectedName: 'baz',
					expectedSource: viewC,
					expectedPath: [ viewC, target ],
					expectedData: []
				} );

				viewC.fire( 'not-delegated' );

				expect( spyFoo ).toHaveBeenCalledOnce();
				expect( spyBar ).toHaveBeenCalledOnce();
				expect( spyBaz ).toHaveBeenCalledOnce();
			} );

			it( 'does not forward events which are not supposed to be delegated', () => {
				const target = new View();
				const view = new View();
				const spyFoo = vi.fn();
				const spyBar = vi.fn();
				const spyBaz = vi.fn();

				collection.delegate( 'foo', 'bar', 'baz' ).to( target );
				collection.add( view );

				target.on( 'foo', spyFoo );
				target.on( 'bar', spyBar );
				target.on( 'baz', spyBaz );

				view.fire( 'foo' );
				view.fire( 'bar' );
				view.fire( 'baz' );
				view.fire( 'not-delegated' );

				expect( spyFoo.mock.invocationCallOrder[ 0 ] ).toBeLessThan( spyBar.mock.invocationCallOrder[ 0 ] );
				expect( spyBar.mock.invocationCallOrder[ 0 ] ).toBeLessThan( spyBaz.mock.invocationCallOrder[ 0 ] );
				expect( spyFoo ).toHaveBeenCalledTimes( 1 );
				expect( spyBar ).toHaveBeenCalledTimes( 1 );
				expect( spyBaz ).toHaveBeenCalledTimes( 1 );
			} );

			it( 'stops forwarding when view removed from the collection', () => {
				const target = new View();
				const view = new View();
				const spy = vi.fn();

				collection.delegate( 'foo' ).to( target );
				target.on( 'foo', spy );

				collection.add( view );
				view.fire( 'foo' );

				expect( spy ).toHaveBeenCalledTimes( 1 );

				collection.remove( 0 );
				view.fire( 'foo' );

				expect( spy ).toHaveBeenCalledTimes( 1 );
			} );

			it( 'supports deep event delegation', () => {
				const target = new View();
				const viewA = new View();
				const viewAA = new View();
				const data = {};
				let capturedArgs;

				const deepCollection = viewA.createCollection();

				collection.add( viewA );
				collection.delegate( 'foo' ).to( target );

				deepCollection.add( viewAA );
				deepCollection.delegate( 'foo' ).to( viewA );

				target.on( 'foo', ( ...args ) => {
					capturedArgs = args;
				} );

				viewAA.fire( 'foo', data );

				expect( capturedArgs ).toBeDefined();
				assertDelegated( capturedArgs, {
					expectedName: 'foo',
					expectedSource: viewAA,
					expectedPath: [ viewAA, viewA, target ],
					expectedData: [ data ]
				} );
			} );
		} );
	} );
} );

function createTestCollection() {
	collection = new ViewCollection();
}

function assertDelegated( evtArgs, { expectedName, expectedSource, expectedPath, expectedData } ) {
	const evtInfo = evtArgs[ 0 ];

	expect( evtInfo.name ).toBe( expectedName );
	expect( evtInfo.source ).toBe( expectedSource );
	expect( evtInfo.path ).toEqual( expectedPath );
	expect( evtArgs.slice( 1 ) ).toEqual( expectedData );
}
