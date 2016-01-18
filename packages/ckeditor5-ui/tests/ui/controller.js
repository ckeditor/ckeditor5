/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: ui */

'use strict';

import testUtils from '/tests/_utils/utils.js';
import View from '/ckeditor5/core/ui/view.js';
import Controller from '/ckeditor5/core/ui/controller.js';
import ControllerCollection from '/ckeditor5/core/ui/controllercollection.js';
import CKEditorError from '/ckeditor5/core/ckeditorerror.js';
import Model from '/ckeditor5/core/model.js';
import EventInfo from '/ckeditor5/core/eventinfo.js';

let ParentController, ParentView;

testUtils.createSinonSandbox();

describe( 'Controller', () => {
	describe( 'constructor', () => {
		it( 'defines basic properties', () => {
			const controller = new Controller();

			expect( controller.model ).to.be.null;
			expect( controller.ready ).to.be.false;
			expect( controller.view ).to.be.null;
			expect( controller.collections.length ).to.be.equal( 0 );
		} );

		it( 'should accept model and view', () => {
			const model = new Model();
			const view = new View();
			const controller = new Controller( model, view );

			expect( controller.model ).to.be.equal( model );
			expect( controller.view ).to.be.equal( view );
		} );
	} );

	describe( 'init', () => {
		it( 'should throw when already initialized', () => {
			const controller = new Controller();

			return controller.init()
				.then( () => {
					controller.init();

					throw new Error( 'This should not be executed.' );
				} )
				.catch( ( err ) => {
					expect( err ).to.be.instanceof( CKEditorError );
					expect( err.message ).to.match( /ui-controller-init-re/ );
				} );
		} );

		it( 'should set #ready flag', () => {
			const controller = new Controller();

			return controller.init().then( () => {
				expect( controller.ready ).to.be.true;
			} );
		} );

		it( 'should initialize own view', () => {
			const view = new View();
			const controller = new Controller( null, view );
			const spy = testUtils.sinon.spy( view, 'init' );

			return controller.init().then( () => {
				sinon.assert.calledOnce( spy );
			} );
		} );

		it( 'should initialize child controllers in own collections', () => {
			const parentController = new Controller();
			const buttonCollection = new ControllerCollection( 'buttons' );
			parentController.collections.add( buttonCollection );

			const childController1 = new Controller();
			const childController2 = new Controller();
			const spy1 = testUtils.sinon.spy( childController1, 'init' );
			const spy2 = testUtils.sinon.spy( childController2, 'init' );

			buttonCollection.add( childController1 );
			buttonCollection.add( childController2 );

			return parentController.init().then( () => {
				expect( buttonCollection.get( 0 ) ).to.be.equal( childController1 );
				expect( buttonCollection.get( 1 ) ).to.be.equal( childController2 );

				sinon.assert.calledOnce( spy1 );
				sinon.assert.calledOnce( spy2 );
			} );
		} );
	} );

	describe( 'collections', () => {
		describe( 'add', () => {
			beforeEach( defineParentViewClass );
			beforeEach( defineParentControllerClass );

			it( 'should add a child controller which has no view', () => {
				const parentController = new ParentController( null, new ParentView() );
				const collection = parentController.collections.get( 'x' );
				const childController = new Controller();

				return parentController.init()
					.then( () => {
						return collection.add( childController );
					} )
					.then( () => {
						expect( collection.get( 0 ) ).to.be.equal( childController );
					} );
			} );

			it( 'should append child controller\'s view to parent controller\'s view', () => {
				const parentView = new ParentView();
				const parentController = new ParentController( null, parentView );
				const collection = parentController.collections.get( 'x' );
				const childController = new Controller( null, new View() );
				const spy = testUtils.sinon.spy();

				parentView.regions.get( 'x' ).views.on( 'add', spy );

				collection.add( childController );

				sinon.assert.notCalled( spy );

				collection.remove( childController );

				return parentController.init()
					.then( () => {
						return collection.add( childController );
					} )
					.then( () => {
						sinon.assert.calledOnce( spy );
						sinon.assert.calledWithExactly( spy,
							sinon.match.instanceOf( EventInfo ), childController.view, 0 );
					} );
			} );

			it( 'should append child controller\'s view to parent controller\'s view at given index', () => {
				const parentController = new ParentController( null, new ParentView() );
				const collection = parentController.collections.get( 'x' );

				const childView1 = new View();
				const childController1 = new Controller( null, childView1 );
				const childView2 = new View();
				const childController2 = new Controller( null, childView2 );

				return parentController.init()
					.then( () => {
						return collection.add( childController1 ).then( () => {
							return collection.add( childController2, 0 );
						} );
					} )
					.then( () => {
						const region = parentController.view.regions.get( 'x' );

						expect( region.views.get( 0 ) ).to.be.equal( childView2 );
						expect( region.views.get( 1 ) ).to.be.equal( childView1 );
					} );
			} );
		} );

		describe( 'remove', () => {
			beforeEach( defineParentViewClass );

			it( 'should remove child controller\'s view from parent controller\'s view', () => {
				const parentView = new ParentView();
				const parentController = new ParentController( null, parentView );
				const collection = parentController.collections.get( 'x' );
				const childController = new Controller( null, new View() );
				const spy = testUtils.sinon.spy();
				parentView.regions.get( 'x' ).views.on( 'remove', spy );

				collection.add( childController );

				sinon.assert.notCalled( spy );

				return parentController.init()
					.then( () => {
						collection.remove( childController );
						sinon.assert.calledOnce( spy );
						sinon.assert.calledWithExactly( spy,
							sinon.match.instanceOf( EventInfo ), childController.view );
					} );
			} );
		} );
	} );

	describe( 'destroy', () => {
		beforeEach( defineParentViewClass );
		beforeEach( defineParentControllerClass );

		it( 'should destroy the controller', () => {
			const view = new View();
			const controller = new Controller( null, view );
			const spy = testUtils.sinon.spy( view, 'destroy' );

			return controller.init()
				.then( () => {
					return controller.destroy();
				} )
				.then( () => {
					sinon.assert.calledOnce( spy );

					expect( controller.model ).to.be.null;
					expect( controller.ready ).to.be.null;
					expect( controller.view ).to.be.null;
					expect( controller.collections ).to.be.null;
				} );
		} );

		it( 'should destroy the controller which has no view', () => {
			const controller = new Controller( null, null );

			return controller.init()
				.then( () => {
					return controller.destroy();
				} )
				.then( () => {
					expect( controller.model ).to.be.null;
					expect( controller.view ).to.be.null;
					expect( controller.collections ).to.be.null;
				} );
		} );

		it( 'should destroy child controllers in collections with their views', () => {
			const parentController = new ParentController( null, new ParentView() );
			const collection = parentController.collections.get( 'x' );
			const childView = new View();
			const childController = new Controller( null, childView );
			const spy = testUtils.sinon.spy( childView, 'destroy' );

			collection.add( childController );

			return parentController.init()
				.then( () => {
					return parentController.destroy();
				} )
				.then( () => {
					sinon.assert.calledOnce( spy );
					expect( childController.model ).to.be.null;
					expect( childController.view ).to.be.null;
					expect( childController.collections ).to.be.null;
				} );
		} );

		it( 'should destroy child controllers in collections when they have no views', () => {
			const parentController = new ParentController( null, new ParentView() );
			const collection = parentController.collections.get( 'x' );
			const childController = new Controller( null, null );

			collection.add( childController );

			return parentController.init()
				.then( () => {
					return parentController.destroy();
				} )
				.then( () => {
					expect( childController.model ).to.be.null;
					expect( childController.view ).to.be.null;
					expect( childController.collections ).to.be.null;
				} );
		} );
	} );
} );

function defineParentViewClass() {
	ParentView = class extends View {
		constructor() {
			super();

			this.el = document.createElement( 'span' );
			this.register( 'x', true );
		}
	};
}

function defineParentControllerClass() {
	ParentController = class extends Controller {
		constructor( ...args ) {
			super( ...args );

			this.collections.add( new ControllerCollection( 'x' ) );
		}
	};
}
