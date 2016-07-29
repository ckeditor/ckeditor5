/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: ui */

import testUtils from '/tests/ckeditor5/_utils/utils.js';
import View from '/ckeditor5/ui/view.js';
import Controller from '/ckeditor5/ui/controller.js';
import ControllerCollection from '/ckeditor5/ui/controllercollection.js';
import CKEditorError from '/ckeditor5/utils/ckeditorerror.js';
import Model from '/ckeditor5/ui/model.js';
import EventInfo from '/ckeditor5/utils/eventinfo.js';

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

		it( 'should set #ready flag and fire #ready event', () => {
			const controller = new Controller();
			const spy = sinon.spy( () => {
				expect( controller ).to.have.property( 'ready', true );
			} );

			controller.on( 'ready', spy );

			return controller.init().then( () => {
				expect( spy.calledOnce ).to.be.true;
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

	describe( 'add', () => {
		beforeEach( defineParentControllerClass );

		it( 'should add a controller to specific collection', () => {
			const parentController = new ParentController();
			const child1 = new Controller();
			const child2 = new Controller();
			const collection = parentController.collections.get( 'x' );

			parentController.add( 'x', child1 );
			parentController.add( 'x', child2 );

			expect( collection ).to.have.length( 2 );
			expect( collection.get( 0 ) ).to.be.equal( child1 );
			expect( collection.get( 1 ) ).to.be.equal( child2 );
		} );

		it( 'should add a controller at specific index', () => {
			const parentController = new ParentController();
			const child1 = new Controller();
			const child2 = new Controller();
			const collection = parentController.collections.get( 'x' );

			parentController.add( 'x', child1 );
			parentController.add( 'x', child2, 0 );

			expect( collection ).to.have.length( 2 );
			expect( collection.get( 0 ) ).to.be.equal( child2 );
			expect( collection.get( 1 ) ).to.be.equal( child1 );
		} );
	} );

	describe( 'remove', () => {
		beforeEach( defineParentControllerClass );

		it( 'should remove a controller from specific collection – by instance', () => {
			const parentController = new ParentController();
			const child1 = new Controller();
			const child2 = new Controller();
			const child3 = new Controller();
			const collection = parentController.collections.get( 'x' );

			parentController.add( 'x', child1 );
			parentController.add( 'x', child2 );
			parentController.add( 'x', child3 );

			const removed = parentController.remove( 'x', child2 );

			expect( collection ).to.have.length( 2 );
			expect( collection.get( 0 ) ).to.be.equal( child1 );
			expect( collection.get( 1 ) ).to.be.equal( child3 );
			expect( removed ).to.be.equal( child2 );
		} );

		it( 'should remove a controller from specific collection – by index', () => {
			const parentController = new ParentController();
			const child1 = new Controller();
			const child2 = new Controller();
			const child3 = new Controller();
			const collection = parentController.collections.get( 'x' );

			parentController.add( 'x', child1 );
			parentController.add( 'x', child2 );
			parentController.add( 'x', child3 );

			const removed = parentController.remove( 'x', 1 );

			expect( collection ).to.have.length( 2 );
			expect( collection.get( 0 ) ).to.be.equal( child1 );
			expect( collection.get( 1 ) ).to.be.equal( child3 );
			expect( removed ).to.be.equal( child2 );
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

		// See #11
		it( 'should correctly destroy multiple controller collections', () => {
			const parentController = new Controller();
			const controllerCollectionCollection = parentController.collections; // Yep... it's correct :D.
			const childControllers = [];
			const collections = [ 'a', 'b', 'c' ].map( name => {
				const collection = new ControllerCollection( name );
				const childController = new Controller();

				childController.destroy = sinon.spy();

				parentController.collections.add( collection );
				collection.add( childController );
				childControllers.push( childController );

				return collection;
			} );

			return parentController.init()
				.then( () => {
					return parentController.destroy();
				} )
				.then( () => {
					expect( controllerCollectionCollection ).to.have.lengthOf( 0, 'parentController.collections is empty' );
					expect( collections.map( collection => collection.length ) )
						.to.deep.equal( [ 0, 0, 0 ], 'all collections are empty' );
					expect( childControllers.map( controller => controller.destroy.calledOnce ) )
						.to.deep.equal( [ true, true, true ], 'all child controllers were destroyed' );
				} );
		} );

		// See #11
		it( 'should correctly destroy collections with multiple child controllers', () => {
			const parentController = new Controller();
			const controllerCollectionCollection = parentController.collections; // Yep... it's correct :D.
			const controllerCollection = new ControllerCollection( 'foo' );
			const childControllers = [];

			parentController.collections.add( controllerCollection );

			for ( let i = 0; i < 3; i++ ) {
				const childController = new Controller();

				childController.destroy = sinon.spy();

				childControllers.push( childController );
				parentController.add( 'foo', childController );
			}

			return parentController.init()
				.then( () => {
					return parentController.destroy();
				} )
				.then( () => {
					expect( controllerCollectionCollection ).to.have.lengthOf( 0, 'parentController.collections is empty' );
					expect( controllerCollection ).to.have.lengthOf( 0, 'child controller collection is empty' );
					expect( childControllers.map( controller => controller.destroy.calledOnce ) )
						.to.deep.equal( [ true, true, true ], 'all child controllers were destroyed' );
				} );
		} );
	} );

	describe( 'addCollection', () => {
		it( 'should add a new collection', () => {
			const controller = new Controller();

			controller.addCollection( 'foo' );

			expect( controller.collections ).to.have.length( 1 );
			expect( controller.collections.get( 'foo' ).name ).to.equal( 'foo' );
		} );

		it( 'should return the collection which has been created (chaining)', () => {
			const controller = new Controller();
			const returned = controller.addCollection( 'foo' );

			expect( returned ).to.be.instanceOf( ControllerCollection );
		} );

		it( 'should pass locale to controller collection', () => {
			const locale = {};
			const view = new View( locale );

			expect( new Controller( {}, view ).addCollection( 'foo' ).locale ).to.equal( locale );
		} );
	} );
} );

function defineParentViewClass() {
	ParentView = class extends View {
		constructor() {
			super();

			this.element = document.createElement( 'span' );
			this.register( 'x', true );
		}
	};
}

function defineParentControllerClass() {
	ParentController = class extends Controller {
		constructor( ...args ) {
			super( ...args );

			this.addCollection( 'x' );
		}
	};
}
