/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: core, ui */

'use strict';

const modules = bender.amd.require( 'ckeditor',
	'ui/view',
	'ui/controller',
	'ui/region',
	'ckeditorerror',
	'model',
	'collection',
	'eventinfo'
);

let View, Controller, Model, CKEditorError, Collection;
let ParentView;

bender.tools.createSinonSandbox();

describe( 'Controller', () => {
	beforeEach( updateModuleReference );

	describe( 'constructor', () => {
		it( 'defines basic properties', () => {
			const controller = new Controller();

			expect( controller.model ).to.be.null;
			expect( controller.ready ).to.be.false;
			expect( controller.view ).to.be.null;
			expect( controller._collections.length ).to.be.equal( 0 );
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
			const spy = bender.sinon.spy( view, 'init' );

			return controller.init().then( () => {
				sinon.assert.calledOnce( spy );
			} );
		} );

		it( 'should initialize child controllers in own collections', () => {
			const parentController = new Controller();
			parentController.register( 'buttons', new Collection() );

			const childController1 = new Controller();
			const childController2 = new Controller();
			const spy1 = bender.sinon.spy( childController1, 'init' );
			const spy2 = bender.sinon.spy( childController2, 'init' );

			parentController.addChild( 'buttons', childController1 );
			parentController.addChild( 'buttons', childController2 );

			return parentController.init().then( () => {
				expect( parentController.getChild( 'buttons', 0 ) ).to.be.equal( childController1 );
				expect( parentController.getChild( 'buttons', 1 ) ).to.be.equal( childController2 );

				sinon.assert.calledOnce( spy1 );
				sinon.assert.calledOnce( spy2 );
			} );
		} );
	} );

	describe( 'register', () => {
		it( 'should throw when bad type of argument', () => {
			const controller = new Controller();

			controller.register( 'x', new Collection() );

			expect( () => {
				controller.register();
			} ).to.throw;
		} );

		it( 'should throw when already registered but no override flag', () => {
			const controller = new Controller();

			controller.register( 'x', new Collection() );

			expect( () => {
				controller.register( 'x', new Collection() );
			} ).to.throw( CKEditorError, /ui-controller-register-noverride/ );
		} );

		it( 'should register a collection', () => {
			const controller = new Controller();
			const collection = new Collection();

			controller.register( 'x', collection );

			expect( controller._collections.get( 'x' ) ).to.be.equal( collection );
		} );

		it( 'should override existing collection with override flag', () => {
			const controller = new Controller();
			const newCollection = new Collection();

			controller.register( 'x', new Collection() );
			controller.register( 'x', newCollection, true );

			expect( controller._collections.get( 'x' ) ).to.be.equal( newCollection );
		} );

		it( 'should override existing collection with the same collection', () => {
			const controller = new Controller();
			const newCollection = new Collection();

			controller.register( 'x', newCollection );
			controller.register( 'x', newCollection );

			expect( controller._collections.get( 'x' ) ).to.be.equal( newCollection );
		} );
	} );

	describe( 'addChild', () => {
		beforeEach( defineParentViewClass );

		it( 'should throw when no collection name', () => {
			const controller = new Controller();

			controller.register( 'x', new Collection() );

			expect( () => {
				controller.addChild();
			} ).to.throw( CKEditorError, /ui-controller-addchild-badcname/ );
		} );

		it( 'should throw when collection of given name does not exist', () => {
			const controller = new Controller();

			controller.register( 'x', new Collection() );

			expect( () => {
				controller.addChild( 'y', new Controller() );
			} ).to.throw( CKEditorError, /ui-controller-addchild-nocol/ );
		} );

		it( 'should throw when no controller is passed', () => {
			const controller = new Controller();

			controller.register( 'x', new Collection() );

			expect( () => {
				controller.addChild( 'x' );
			} ).to.throw( CKEditorError, /ui-controller-addchild-no-controller/ );
		} );

		it( 'should add a child controller to given collection and return promise', () => {
			const parentController = new Controller();
			const childController = new Controller();
			const collection = new Collection();

			parentController.register( 'x', collection );

			const returned = parentController.addChild( 'x', childController );

			expect( returned ).to.be.an.instanceof( Promise );
			expect( collection.get( 0 ) ).to.be.equal( childController );
		} );

		it( 'should add a child controller at given position', () => {
			const parentController = new Controller();
			const childController1 = new Controller();
			const childController2 = new Controller();
			const collection = new Collection();

			parentController.register( 'x', collection );

			parentController.addChild( 'x', childController1 );
			parentController.addChild( 'x', childController2, 0 );

			expect( collection.get( 0 ) ).to.be.equal( childController2 );
			expect( collection.get( 1 ) ).to.be.equal( childController1 );
		} );

		it( 'should add a child controller which has no view', () => {
			const parentController = new Controller( null, new ParentView() );
			const childController = new Controller();

			parentController.register( 'x', new Collection() );

			return parentController.init()
				.then( () => {
					return parentController.addChild( 'x', childController );
				} )
				.then( () => {
					expect( parentController.getChild( 'x', 0 ) ).to.be.equal( childController );
				} );
		} );

		it( 'should append child controller\'s view to parent controller\'s view', () => {
			const parentView = new ParentView();
			const parentController = new Controller( null, parentView );
			const childController = new Controller( null, new View() );

			const spy1 = bender.sinon.spy( parentView, 'addChild' );

			parentController.register( 'x', new Collection() );
			parentController.addChild( 'x', childController );

			sinon.assert.notCalled( spy1 );

			parentController.removeChild( 'x', childController );

			return parentController.init()
				.then( () => {
					return parentController.addChild( 'x', childController );
				} )
				.then( () => {
					sinon.assert.calledOnce( spy1 );
					sinon.assert.calledWithExactly( spy1, 'x', childController.view, undefined );
				} );
		} );

		it( 'should append child controller\'s view to parent controller\'s view at given index', () => {
			const parentController = new Controller( null, new ParentView() );

			const childView1 = new View();
			const childController1 = new Controller( null, childView1 );
			const childView2 = new View();
			const childController2 = new Controller( null, childView2 );

			parentController.register( 'x', new Collection() );

			return parentController.init()
				.then( () => {
					return parentController.addChild( 'x', childController1 ).then( () => {
						return parentController.addChild( 'x', childController2, 0 );
					} );
				} )
				.then( () => {
					expect( parentController.view.getChild( 'x', 0 ) ).to.be.equal( childView2 );
					expect( parentController.view.getChild( 'x', 1 ) ).to.be.equal( childView1 );
				} );
		} );

		it( 'should initialize child controller if parent is ready', () => {
			const parentController = new Controller( null, new ParentView() );
			const childController = new Controller( null, new View() );
			const spy = bender.sinon.spy( childController, 'init' );

			parentController.register( 'x', new Collection() );
			parentController.addChild( 'x', childController );
			parentController.removeChild( 'x', childController );

			sinon.assert.notCalled( spy );

			return parentController.init()
				.then( () => {
					return parentController.addChild( 'x', childController );
				} )
				.then( () => {
					sinon.assert.calledOnce( spy );
				} );
		} );

		it( 'should not initialize child controller twice', () => {
			const parentController = new Controller( null, new ParentView() );
			const childController = new Controller( null, new View() );
			const spy = bender.sinon.spy( childController, 'init' );

			parentController.register( 'x', new Collection() );

			return parentController.init()
				.then( () => {
					return childController.init();
				} )
				.then( () => {
					return parentController.addChild( 'x', childController );
				} )
				.then( () => {
					sinon.assert.calledOnce( spy );
				} );
		} );
	} );

	describe( 'removeChild', () => {
		beforeEach( defineParentViewClass );

		it( 'should throw when no collection name', () => {
			const controller = new Controller();

			controller.register( 'x', new Collection() );

			expect( () => {
				controller.removeChild();
			} ).to.throw( CKEditorError, /ui-controller-removechild-badcname/ );
		} );

		it( 'should throw when collection of given name does not exist', () => {
			const controller = new Controller();

			controller.register( 'x', new Collection() );

			expect( () => {
				controller.removeChild( 'y' );
			} ).to.throw( CKEditorError, /ui-controller-removechild-nocol/ );
		} );

		it( 'should throw when controller or wrong controller is passed', () => {
			const controller = new Controller();

			controller.register( 'x', new Collection() );

			expect( () => {
				controller.removeChild( 'x' );
			} ).to.throw( CKEditorError, /ui-controller-removechild-no-controller/ );
		} );

		it( 'should remove child controller and return it', () => {
			const parentController = new Controller();
			const childController = new Controller();
			const collection = new Collection();

			parentController.register( 'x', collection );

			parentController.addChild( 'x', childController );
			const returned = parentController.removeChild( 'x', childController );

			expect( returned ).to.be.equal( childController );
			expect( collection.length ).to.be.equal( 0 );
		} );

		it( 'should remove child controller\'s view from parent controller\'s view', () => {
			const parentView = new ParentView();
			const parentController = new Controller( null, parentView );
			const childController = new Controller( null, new View() );

			const spy = bender.sinon.spy( parentView, 'removeChild' );

			parentController.register( 'x', new Collection() );
			parentController.addChild( 'x', childController );

			sinon.assert.notCalled( spy );

			return parentController.init()
				.then( () => {
					parentController.removeChild( 'x', childController );
					sinon.assert.calledOnce( spy );
					sinon.assert.calledWithExactly( spy, 'x', childController.view );
				} );
		} );
	} );

	describe( 'getChild', () => {
		beforeEach( defineParentViewClass );

		it( 'should throw when collection of given name does not exist', () => {
			const controller = new Controller();

			controller.register( 'x', new Collection() );

			expect( () => {
				controller.getChild( 'y', 0 );
			} ).to.throw( CKEditorError, /ui-controller-getchild-nocol/ );
		} );

		it( 'should get child controller by index', () => {
			const parentController = new Controller();
			const childController = new Controller();
			const collection = new Collection();

			parentController.register( 'x', collection );
			parentController.addChild( 'x', childController );

			expect( parentController.getChild( 'x', 0 ) ).to.be.equal( childController );
		} );
	} );

	describe( 'destroy', () => {
		beforeEach( defineParentViewClass );

		it( 'should destroy the controller', () => {
			const view = new View();
			const controller = new Controller( null, view );
			const spy = bender.sinon.spy( view, 'destroy' );

			return controller.init()
				.then( () => {
					return controller.destroy();
				} )
				.then( () => {
					sinon.assert.calledOnce( spy );

					expect( controller.model ).to.be.null;
					expect( controller.ready ).to.be.null;
					expect( controller.view ).to.be.null;
					expect( controller._collections ).to.be.null;
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
					expect( controller._collections ).to.be.null;
				} );
		} );

		it( 'should destroy child controllers in collections with their views', () => {
			const parentController = new Controller( null, new ParentView() );
			const childView = new View();
			const childController = new Controller( null, childView );
			const spy = bender.sinon.spy( childView, 'destroy' );

			parentController.register( 'x', new Collection() );
			parentController.addChild( 'x', childController );

			return parentController.init()
				.then( () => {
					return parentController.destroy();
				} )
				.then( () => {
					sinon.assert.calledOnce( spy );
					expect( childController.model ).to.be.null;
					expect( childController.view ).to.be.null;
					expect( childController._collections ).to.be.null;
				} );
		} );

		it( 'should destroy child controllers in collections when they have no views', () => {
			const parentController = new Controller( null, new ParentView() );
			const childController = new Controller( null, null );

			parentController.register( 'x', new Collection() );
			parentController.addChild( 'x', childController );

			return parentController.init()
				.then( () => {
					return parentController.destroy();
				} )
				.then( () => {
					expect( childController.model ).to.be.null;
					expect( childController.view ).to.be.null;
					expect( childController._collections ).to.be.null;
				} );
		} );
	} );
} );

function updateModuleReference() {
	View = modules[ 'ui/view' ];
	Controller = modules[ 'ui/controller' ];
	Model = modules.model;
	Collection = modules.collection;
	CKEditorError = modules.ckeditorerror;
}

function defineParentViewClass() {
	ParentView = class extends View {
		constructor() {
			super();

			this.el = document.createElement( 'span' );
			this.register( 'x', true );
		}
	};
}
