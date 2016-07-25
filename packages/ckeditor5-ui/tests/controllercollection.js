/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: ui */

import testUtils from '/tests/ckeditor5/_utils/utils.js';
import ControllerCollection from '/ckeditor5/ui/controllercollection.js';
import Controller from '/ckeditor5/ui/controller.js';
import Collection from '/ckeditor5/utils/collection.js';
import Model from '/ckeditor5/ui/model.js';
import View from '/ckeditor5/ui/view.js';
import Template from '/ckeditor5/ui/template.js';

testUtils.createSinonSandbox();

let ParentView, ItemController, ItemView;
let modelCollection;

describe( 'ControllerCollection', () => {
	beforeEach( () => {
		defineParentViewClass();
		defineItemControllerClass();
		defineItemViewClass();
		createModelCollection();
	} );

	describe( 'constructor', () => {
		it( 'should throw when no name is passed', () => {
			expect( () => {
				new ControllerCollection();
			} ).to.throw( /^ui-controllercollection-no-name/ );
		} );

		it( 'activates model collection synchronization', () => {
			const modelCollection = new Collection( {
				idProperty: 'uid'
			} );

			modelCollection.add( new Model( {
				uid: 'foo'
			} ) );

			const controllers = new ControllerCollection( 'synced', modelCollection, ItemController, ItemView );

			expect( controllers ).to.have.length( 1 );
		} );
	} );

	describe( 'add', () => {
		it( 'should add a child controller and return promise', () => {
			const parentController = new Controller();
			const childController = new Controller();
			const collection = new ControllerCollection( 'x' );

			parentController.collections.add( collection );

			const returned = collection.add( childController );

			expect( returned ).to.be.an.instanceof( Promise );
			expect( collection.get( 0 ) ).to.be.equal( childController );
		} );

		it( 'should add a child controller at given position', () => {
			const parentController = new Controller();
			const childController1 = new Controller();
			const childController2 = new Controller();
			const collection = new ControllerCollection( 'x' );

			parentController.collections.add( collection );

			collection.add( childController1 );
			collection.add( childController2, 0 );

			expect( collection.get( 0 ) ).to.be.equal( childController2 );
			expect( collection.get( 1 ) ).to.be.equal( childController1 );
		} );

		it( 'should initialize child controller if parent is ready', () => {
			const parentController = new Controller( null, new ParentView() );
			const childController = new Controller( null, new View() );
			const spy = testUtils.sinon.spy( childController, 'init' );
			const collection = new ControllerCollection( 'x' );

			parentController.collections.add( collection );
			collection.add( childController );
			collection.remove( childController );

			sinon.assert.notCalled( spy );

			return parentController.init()
				.then( () => {
					return collection.add( childController );
				} )
				.then( () => {
					sinon.assert.calledOnce( spy );
				} );
		} );

		it( 'should not initialize child controller twice', () => {
			const parentController = new Controller( null, new ParentView() );
			const childController = new Controller( null, new View() );
			const spy = testUtils.sinon.spy( childController, 'init' );
			const collection = new ControllerCollection( 'x' );

			parentController.collections.add( collection );

			return parentController.init()
				.then( () => {
					return childController.init();
				} )
				.then( () => {
					return collection.add( childController );
				} )
				.then( () => {
					sinon.assert.calledOnce( spy );
				} );
		} );
	} );

	describe( '_sync', () => {
		it( 'expands the initial collection of the models', () => {
			const controllers = new ControllerCollection( 'synced' );

			controllers._sync( modelCollection, ItemController, ItemView );

			expect( controllers ).to.have.length( 5 );
			expect( controllers.get( 0 ).model.uid ).to.equal( '0' );
			expect( controllers.get( 4 ).model.uid ).to.equal( '4' );
		} );

		it( 'uses the controller and view classes to expand the collection', () => {
			const controllers = new ControllerCollection( 'synced' );

			controllers._sync( modelCollection, ItemController, ItemView );

			expect( controllers.get( 0 ) ).to.be.instanceOf( ItemController );
			expect( controllers.get( 0 ).view ).to.be.instanceOf( ItemView );
		} );

		it( 'supports adding new models to the collection', () => {
			const controllers = new ControllerCollection( 'synced' );

			controllers._sync( modelCollection, ItemController, ItemView );

			modelCollection.add( new Model( { uid: '6' } ) );
			modelCollection.add( new Model( { uid: '5' } ), 5 );

			expect( controllers.get( 5 ).model.uid ).to.equal( '5' );
			expect( controllers.get( 6 ).model.uid ).to.equal( '6' );
			expect( controllers ).to.have.length( 7 );
		} );

		it( 'supports removing models from the collection', () => {
			const controllers = new ControllerCollection( 'synced' );

			controllers._sync( modelCollection, ItemController, ItemView );

			modelCollection.remove( 2 );
			modelCollection.remove( 3 );

			expect( controllers.map( c => c.id ) ).to.have.members( [ '0', '1', '3' ] );
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

function defineItemControllerClass() {
	ItemController = class extends Controller {
		constructor( model, view ) {
			super( model, view );

			view.model.bind( 'uid' ).to( model );
		}
	};
}

function defineItemViewClass() {
	ItemView = class extends View {
		constructor() {
			super();

			const bind = this.bind;

			this.template = new Template( {
				tag: 'li',

				attributes: {
					id: bind.to( 'uid' )
				}
			} );
		}
	};
}

function createModelCollection() {
	modelCollection = new Collection( { idProperty: 'uid' } );

	for ( let i = 0; i < 5; i++ ) {
		modelCollection.add( new Model( {
			uid: Number( i ).toString()
		} ) );
	}
}
