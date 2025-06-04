/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import View from '../src/view.js';
import ViewCollection from '../src/viewcollection.js';
import normalizeHtml from '@ckeditor/ckeditor5-utils/tests/_utils/normalizehtml.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

let collection;

describe( 'ViewCollection', () => {
	testUtils.createSinonSandbox();

	beforeEach( createTestCollection );

	describe( 'constructor()', () => {
		it( 'sets basic properties and attributes', () => {
			expect( collection._parentElement ).to.be.null;
			expect( collection._idProperty ).to.equal( 'viewUid' );
		} );

		it( 'allows setting initial collection items', () => {
			const view1 = new View();
			const view2 = new View();
			const collection = new ViewCollection( [ view1, view2 ] );

			expect( collection ).to.have.length( 2 );
			expect( collection.get( 0 ) ).to.equal( view1 );
			expect( collection.get( 1 ) ).to.equal( view2 );
		} );

		describe( 'child view management in DOM', () => {
			it( 'manages view#element of the children in DOM', () => {
				const parentElement = document.createElement( 'p' );
				collection.setParent( parentElement );

				const viewA = new View();

				expect( () => {
					collection.add( viewA );
					collection.remove( viewA );
				} ).to.not.throw();

				expect( () => {
					collection.add( viewA );
					collection.remove( viewA );
				} ).to.not.throw();

				viewA.element = document.createElement( 'b' );
				collection.add( viewA );

				expect( normalizeHtml( parentElement.outerHTML ) ).to.equal( '<p><b></b></p>' );

				const viewB = new View();
				viewB.element = document.createElement( 'i' );

				collection.add( viewB, 0 );
				expect( normalizeHtml( parentElement.outerHTML ) ).to.equal( '<p><i></i><b></b></p>' );

				collection.remove( viewA );
				expect( normalizeHtml( parentElement.outerHTML ) ).to.equal( '<p><i></i></p>' );

				collection.remove( viewB );
				expect( normalizeHtml( parentElement.outerHTML ) ).to.equal( '<p></p>' );
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

				expect( view.element.childNodes ).to.have.length( 2 );
				expect( view.element.childNodes[ 0 ] ).to.equal( viewA.element );
				expect( view.element.childNodes[ 1 ] ).to.equal( viewC.element );
			} );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'calls #destroy on all views in the collection', () => {
			const viewA = new View();
			const viewB = new View();

			const spyA = testUtils.sinon.spy( viewA, 'destroy' );
			const spyB = testUtils.sinon.spy( viewB, 'destroy' );

			collection.add( viewA );
			collection.add( viewB );

			collection.destroy();
			sinon.assert.calledOnce( spyA );
			sinon.assert.calledOnce( spyB );
			sinon.assert.callOrder( spyA, spyB );
		} );
	} );

	describe( 'add()', () => {
		it( 'renders the new view in the collection', () => {
			const view = new View();
			const spy = testUtils.sinon.spy( view, 'render' );

			expect( view.isRendered ).to.be.false;

			collection.add( view );
			expect( view.isRendered ).to.be.true;
			sinon.assert.calledOnce( spy );
		} );

		it( 'works for a view with a Number view#id attribute', () => {
			const view = new View();

			view.set( 'id', 1 );

			collection.add( view );
			expect( view.id ).to.equal( 1 );
			expect( view.viewUid ).to.be.a( 'string' );
		} );
	} );

	describe( 'setParent()', () => {
		it( 'sets #_parentElement', () => {
			const el = {};
			expect( collection._parentElement ).to.be.null;

			collection.setParent( el );
			expect( collection._parentElement ).to.equal( el );
		} );

		it( 'udpates initial collection items in DOM', () => {
			const view1 = new View();
			view1.element = document.createElement( 'i' );
			sinon.spy( view1, 'render' );

			const view2 = new View();
			view2.element = document.createElement( 'b' );
			sinon.spy( view2, 'render' );

			const collection = new ViewCollection( [ view1, view2 ] );
			const parentElement = document.createElement( 'div' );

			expect( collection ).to.have.length( 2 );
			expect( collection.get( 0 ) ).to.equal( view1 );
			expect( collection.get( 1 ) ).to.equal( view2 );

			collection.setParent( parentElement );
			expect( normalizeHtml( parentElement.outerHTML ) ).to.equal( '<div><i></i><b></b></div>' );
			sinon.assert.calledOnce( view1.render );
			sinon.assert.calledOnce( view2.render );
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
			expect( collection.delegate( 'foo' ) ).to.be.an( 'object' );
		} );

		it( 'provides "to()" interface', () => {
			const delegate = collection.delegate( 'foo' );

			expect( delegate ).to.have.keys( 'to' );
			expect( delegate.to ).to.be.a( 'function' );
		} );

		describe( 'to()', () => {
			it( 'does not chain', () => {
				const returned = collection.delegate( 'foo' ).to( {} );

				expect( returned ).to.be.undefined;
			} );

			it( 'forwards an event to another observable – existing view', done => {
				const target = new View();
				const view = new View();

				collection.add( view );
				collection.delegate( 'foo' ).to( target );

				target.on( 'foo', ( ...args ) => {
					assertDelegated( args, {
						expectedName: 'foo',
						expectedSource: view,
						expectedPath: [ view, target ],
						expectedData: []
					} );

					done();
				} );

				view.fire( 'foo' );
			} );

			it( 'forwards an event to another observable – new view', done => {
				const target = new View();
				const view = new View();

				collection.delegate( 'foo' ).to( target );
				collection.add( view );

				target.on( 'foo', ( ...args ) => {
					assertDelegated( args, {
						expectedName: 'foo',
						expectedSource: view,
						expectedPath: [ view, target ],
						expectedData: []
					} );

					done();
				} );

				view.fire( 'foo' );
			} );

			it( 'forwards multiple events to another observable', () => {
				const target = new View();
				const viewA = new View();
				const viewB = new View();
				const viewC = new View();
				const spyFoo = sinon.spy();
				const spyBar = sinon.spy();
				const spyBaz = sinon.spy();

				collection.delegate( 'foo', 'bar', 'baz' ).to( target );
				collection.add( viewA );
				collection.add( viewB );
				collection.add( viewC );

				target.on( 'foo', spyFoo );
				target.on( 'bar', spyBar );
				target.on( 'baz', spyBaz );

				viewA.fire( 'foo' );

				sinon.assert.calledOnce( spyFoo );
				sinon.assert.notCalled( spyBar );
				sinon.assert.notCalled( spyBaz );

				assertDelegated( spyFoo.args[ 0 ], {
					expectedName: 'foo',
					expectedSource: viewA,
					expectedPath: [ viewA, target ],
					expectedData: []
				} );

				viewB.fire( 'bar' );

				sinon.assert.calledOnce( spyFoo );
				sinon.assert.calledOnce( spyBar );
				sinon.assert.notCalled( spyBaz );

				assertDelegated( spyBar.args[ 0 ], {
					expectedName: 'bar',
					expectedSource: viewB,
					expectedPath: [ viewB, target ],
					expectedData: []
				} );

				viewC.fire( 'baz' );

				sinon.assert.calledOnce( spyFoo );
				sinon.assert.calledOnce( spyBar );
				sinon.assert.calledOnce( spyBaz );

				assertDelegated( spyBaz.args[ 0 ], {
					expectedName: 'baz',
					expectedSource: viewC,
					expectedPath: [ viewC, target ],
					expectedData: []
				} );

				viewC.fire( 'not-delegated' );

				sinon.assert.calledOnce( spyFoo );
				sinon.assert.calledOnce( spyBar );
				sinon.assert.calledOnce( spyBaz );
			} );

			it( 'does not forward events which are not supposed to be delegated', () => {
				const target = new View();
				const view = new View();
				const spyFoo = sinon.spy();
				const spyBar = sinon.spy();
				const spyBaz = sinon.spy();

				collection.delegate( 'foo', 'bar', 'baz' ).to( target );
				collection.add( view );

				target.on( 'foo', spyFoo );
				target.on( 'bar', spyBar );
				target.on( 'baz', spyBaz );

				view.fire( 'foo' );
				view.fire( 'bar' );
				view.fire( 'baz' );
				view.fire( 'not-delegated' );

				sinon.assert.callOrder( spyFoo, spyBar, spyBaz );
				sinon.assert.callCount( spyFoo, 1 );
				sinon.assert.callCount( spyBar, 1 );
				sinon.assert.callCount( spyBaz, 1 );
			} );

			it( 'stops forwarding when view removed from the collection', () => {
				const target = new View();
				const view = new View();
				const spy = sinon.spy();

				collection.delegate( 'foo' ).to( target );
				target.on( 'foo', spy );

				collection.add( view );
				view.fire( 'foo' );

				sinon.assert.callCount( spy, 1 );

				collection.remove( 0 );
				view.fire( 'foo' );

				sinon.assert.callCount( spy, 1 );
			} );

			it( 'supports deep event delegation', done => {
				const target = new View();
				const viewA = new View();
				const viewAA = new View();
				const data = {};

				const deepCollection = viewA.createCollection();

				collection.add( viewA );
				collection.delegate( 'foo' ).to( target );

				deepCollection.add( viewAA );
				deepCollection.delegate( 'foo' ).to( viewA );

				target.on( 'foo', ( ...args ) => {
					assertDelegated( args, {
						expectedName: 'foo',
						expectedSource: viewAA,
						expectedPath: [ viewAA, viewA, target ],
						expectedData: [ data ]
					} );

					done();
				} );

				viewAA.fire( 'foo', data );
			} );
		} );
	} );
} );

function createTestCollection() {
	collection = new ViewCollection();
}

function assertDelegated( evtArgs, { expectedName, expectedSource, expectedPath, expectedData } ) {
	const evtInfo = evtArgs[ 0 ];

	expect( evtInfo.name ).to.equal( expectedName );
	expect( evtInfo.source ).to.equal( expectedSource );
	expect( evtInfo.path ).to.deep.equal( expectedPath );
	expect( evtArgs.slice( 1 ) ).to.deep.equal( expectedData );
}
