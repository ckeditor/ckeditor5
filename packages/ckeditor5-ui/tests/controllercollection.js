/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */
/* bender-tags: ui */

import testUtils from '/tests/core/_utils/utils.js';
import ControllerCollection from '/ckeditor5/ui/controllercollection.js';
import Controller from '/ckeditor5/ui/controller.js';
import Collection from '/ckeditor5/utils/collection.js';
import Model from '/ckeditor5/ui/model.js';
import View from '/ckeditor5/ui/view.js';
import Template from '/ckeditor5/ui/template.js';

testUtils.createSinonSandbox();

let ParentView, ItemController, ItemView;
let models;

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

		it( 'accepts locale', () => {
			const locale = {};
			const collection = new ControllerCollection( 'foo', locale );

			expect( collection.locale ).to.equal( locale );
		} );
	} );

	describe( 'add', () => {
		it( 'should add a child controller and return promise', () => {
			const parentController = new Controller();
			const childController = new Controller();
			const collection = parentController.addCollection( 'x' );

			const returned = collection.add( childController );

			expect( returned ).to.be.an.instanceof( Promise );
			expect( collection.get( 0 ) ).to.be.equal( childController );
		} );

		it( 'should add a child controller at given position', () => {
			const parentController = new Controller();
			const childController1 = new Controller();
			const childController2 = new Controller();
			const collection = parentController.addCollection( 'x' );

			collection.add( childController1 );
			collection.add( childController2, 0 );

			expect( collection.get( 0 ) ).to.be.equal( childController2 );
			expect( collection.get( 1 ) ).to.be.equal( childController1 );
		} );

		it( 'should initialize child controller if parent is ready', () => {
			const parentController = new Controller( null, new ParentView() );
			const childController = new Controller( null, new View() );
			const spy = testUtils.sinon.spy( childController, 'init' );
			const collection = parentController.addCollection( 'x' );

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
			const collection = parentController.addCollection( 'x' );

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

	describe( 'bind', () => {
		it( 'returns object', () => {
			expect( new ControllerCollection( 'foo' ).bind( {} ) ).to.be.an( 'object' );
		} );

		it( 'provides "as" interface', () => {
			const bind = new ControllerCollection( 'foo' ).bind( {} );

			expect( bind ).to.have.keys( 'as' );
			expect( bind.as ).to.be.a( 'function' );
		} );

		describe( 'as', () => {
			it( 'does not chain', () => {
				const controllers = new ControllerCollection( 'synced' );
				const returned = controllers.bind( models ).as( ItemController, ItemView );

				expect( returned ).to.be.undefined;
			} );

			describe( 'standard factory', () => {
				it( 'expands the initial collection of the models', () => {
					const controllers = new ControllerCollection( 'synced' );

					controllers.bind( models ).as( ItemController, ItemView );

					expect( controllers ).to.have.length( 5 );
					expect( controllers.get( 0 ).model.uid ).to.equal( '0' );
					expect( controllers.get( 4 ).model.uid ).to.equal( '4' );
				} );

				it( 'uses the controller and view classes to expand the collection', () => {
					const controllers = new ControllerCollection( 'synced' );

					controllers.bind( models ).as( ItemController, ItemView );

					expect( controllers.get( 0 ) ).to.be.instanceOf( ItemController );
					expect( controllers.get( 0 ).view ).to.be.instanceOf( ItemView );
				} );

				it( 'supports adding new models to the collection', () => {
					const controllers = new ControllerCollection( 'synced' );

					controllers.bind( models ).as( ItemController, ItemView );

					models.add( new Model( { uid: '6' } ) );
					models.add( new Model( { uid: '5' } ), 5 );

					expect( controllers.get( 5 ).model.uid ).to.equal( '5' );
					expect( controllers.get( 6 ).model.uid ).to.equal( '6' );
					expect( controllers ).to.have.length( 7 );
				} );

				it( 'supports removing models from the collection', () => {
					const controllers = new ControllerCollection( 'synced' );

					controllers.bind( models ).as( ItemController, ItemView );

					models.remove( 2 );
					models.remove( 3 );

					expect( controllers.map( c => c.model.uid ) ).to.have.members( [ '0', '1', '3' ] );
				} );

				it( 'passes controller collection\'s locale to the views', () => {
					const locale = {};
					const controllers = new ControllerCollection( 'synced', locale );

					controllers.bind( models ).as( ItemController, ItemView );

					expect( controllers.get( 0 ).view.locale ).to.equal( locale );
				} );
			} );

			describe( 'custom factory', () => {
				it( 'expands the initial collection of the models', () => {
					const controllers = new ControllerCollection( 'synced' );

					controllers.bind( models ).as( ( model, locale ) => {
						return new ItemController( model, new ItemView( locale ) );
					} );

					expect( controllers ).to.have.length( 5 );
					expect( controllers.get( 0 ).model.uid ).to.equal( '0' );
					expect( controllers.get( 4 ).model.uid ).to.equal( '4' );
				} );

				it( 'uses the controller and view classes to expand the collection', () => {
					const controllers = new ControllerCollection( 'synced' );

					controllers.bind( models ).as( ( model, locale ) => {
						return new ItemController( model, new ItemView( locale ) );
					} );

					expect( controllers.get( 0 ) ).to.be.instanceOf( ItemController );
					expect( controllers.get( 0 ).view ).to.be.instanceOf( ItemView );
				} );

				it( 'supports adding new models to the collection', () => {
					const controllers = new ControllerCollection( 'synced' );

					controllers.bind( models ).as( ( model, locale ) => {
						return new ItemController( model, new ItemView( locale ) );
					} );

					models.add( new Model( { uid: '6' } ) );
					models.add( new Model( { uid: '5' } ), 5 );

					expect( controllers.get( 5 ).model.uid ).to.equal( '5' );
					expect( controllers.get( 6 ).model.uid ).to.equal( '6' );
					expect( controllers ).to.have.length( 7 );
				} );

				it( 'supports removing models from the collection', () => {
					const controllers = new ControllerCollection( 'synced' );

					controllers.bind( models ).as( ( model, locale ) => {
						return new ItemController( model, new ItemView( locale ) );
					} );

					models.remove( 2 );
					models.remove( 3 );

					expect( controllers.map( c => c.model.uid ) ).to.have.members( [ '0', '1', '3' ] );
				} );

				it( 'passes controller collection\'s locale to the views', () => {
					const locale = {};
					const controllers = new ControllerCollection( 'synced', locale );

					controllers.bind( models ).as( ( model, locale ) => {
						return new ItemController( model, new ItemView( locale ) );
					} );

					expect( controllers.get( 0 ).view.locale ).to.equal( locale );
				} );
			} );

			describe( 'custom data format with custom factory', () => {
				it( 'expands the initial collection of the models', () => {
					const controllers = new ControllerCollection( 'synced' );
					const data = new Collection();

					data.add( { foo: 'a' } );
					data.add( { foo: 'b' } );

					controllers.bind( data ).as( ( item, locale ) => {
						const model = new Model( {
							custom: item.foo
						} );

						return new ItemController( model, new ItemView( locale ) );
					} );

					expect( controllers ).to.have.length( 2 );
					expect( controllers.get( 0 ).model.custom ).to.equal( 'a' );
					expect( controllers.get( 1 ).model.custom ).to.equal( 'b' );
					expect( controllers.get( 0 ) ).to.be.instanceOf( ItemController );
					expect( controllers.get( 0 ).view ).to.be.instanceOf( ItemView );
				} );
			} );
		} );
	} );

	describe( 'delegate', () => {
		it( 'should throw when event names are not strings', () => {
			const collection = new ControllerCollection( 'foo' );

			expect( () => {
				collection.delegate();
			} ).to.throwCKEditorError( /ui-controllercollection-delegate-wrong-events/ );

			expect( () => {
				collection.delegate( new Date() );
			} ).to.throwCKEditorError( /ui-controllercollection-delegate-wrong-events/ );

			expect( () => {
				collection.delegate( 'color', new Date() );
			} ).to.throwCKEditorError( /ui-controllercollection-delegate-wrong-events/ );
		} );

		it( 'returns object', () => {
			expect( new ControllerCollection( 'foo' ).delegate( 'foo' ) ).to.be.an( 'object' );
		} );

		it( 'provides "to" interface', () => {
			const delegate = new ControllerCollection( 'foo' ).delegate( 'foo' );

			expect( delegate ).to.have.keys( 'to' );
			expect( delegate.to ).to.be.a( 'function' );
		} );

		describe( 'to', () => {
			it( 'does not chain', () => {
				const collection = new ControllerCollection( 'foo' );
				const returned = collection.delegate( 'foo' ).to( {} );

				expect( returned ).to.be.undefined;
			} );

			it( 'forwards an event to another observable – existing controller', ( done ) => {
				const target = new Model();
				const collection = new ControllerCollection( 'foo' );
				const model = new Model();

				collection.add( new Controller( model ) );
				collection.delegate( 'foo' ).to( target );

				target.on( 'foo', ( ...args ) => {
					assertDelegated( args, {
						expectedName: 'foo',
						expectedSource: model,
						expectedPath: [ model, target ],
						expectedData: []
					} );

					done();
				} );

				model.fire( 'foo' );
			} );

			it( 'forwards an event to another observable – new controller', ( done ) => {
				const target = new Model();
				const collection = new ControllerCollection( 'foo' );
				const model = new Model();

				collection.delegate( 'foo' ).to( target );
				collection.add( new Controller( model ) );

				target.on( 'foo', ( ...args ) => {
					assertDelegated( args, {
						expectedName: 'foo',
						expectedSource: model,
						expectedPath: [ model, target ],
						expectedData: []
					} );

					done();
				} );

				model.fire( 'foo' );
			} );

			it( 'forwards multiple events to another observable', () => {
				const target = new Model();
				const collection = new ControllerCollection( 'foo' );
				const modelA = new Model();
				const modelB = new Model();
				const modelC = new Model();
				const spyFoo = sinon.spy();
				const spyBar = sinon.spy();
				const spyBaz = sinon.spy();

				collection.delegate( 'foo', 'bar', 'baz' ).to( target );
				collection.add( new Controller( modelA ) );
				collection.add( new Controller( modelB ) );
				collection.add( new Controller( modelC ) );

				target.on( 'foo', spyFoo );
				target.on( 'bar', spyBar );
				target.on( 'baz', spyBaz );

				modelA.fire( 'foo' );

				sinon.assert.calledOnce( spyFoo );
				sinon.assert.notCalled( spyBar );
				sinon.assert.notCalled( spyBaz );

				assertDelegated( spyFoo.args[ 0 ], {
					expectedName: 'foo',
					expectedSource: modelA,
					expectedPath: [ modelA, target ],
					expectedData: []
				} );

				modelB.fire( 'bar' );

				sinon.assert.calledOnce( spyFoo );
				sinon.assert.calledOnce( spyBar );
				sinon.assert.notCalled( spyBaz );

				assertDelegated( spyBar.args[ 0 ], {
					expectedName: 'bar',
					expectedSource: modelB,
					expectedPath: [ modelB, target ],
					expectedData: []
				} );

				modelC.fire( 'baz' );

				sinon.assert.calledOnce( spyFoo );
				sinon.assert.calledOnce( spyBar );
				sinon.assert.calledOnce( spyBaz );

				assertDelegated( spyBaz.args[ 0 ], {
					expectedName: 'baz',
					expectedSource: modelC,
					expectedPath: [ modelC, target ],
					expectedData: []
				} );

				modelC.fire( 'not-delegated' );

				sinon.assert.calledOnce( spyFoo );
				sinon.assert.calledOnce( spyBar );
				sinon.assert.calledOnce( spyBaz );
			} );

			it( 'does not forward events which are not supposed to be delegated', () => {
				const target = new Model();
				const collection = new ControllerCollection( 'foo' );
				const model = new Model();
				const spyFoo = sinon.spy();
				const spyBar = sinon.spy();
				const spyBaz = sinon.spy();

				collection.delegate( 'foo', 'bar', 'baz' ).to( target );
				collection.add( new Controller( model ) );

				target.on( 'foo', spyFoo );
				target.on( 'bar', spyBar );
				target.on( 'baz', spyBaz );

				model.fire( 'foo' );
				model.fire( 'bar' );
				model.fire( 'baz' );
				model.fire( 'not-delegated' );

				sinon.assert.callOrder( spyFoo, spyBar, spyBaz );
				sinon.assert.callCount( spyFoo, 1 );
				sinon.assert.callCount( spyBar, 1 );
				sinon.assert.callCount( spyBaz, 1 );
			} );

			it( 'stops forwarding when controller removed from the collection', () => {
				const target = new Model();
				const collection = new ControllerCollection( 'foo' );
				const model = new Model();
				const spy = sinon.spy();

				collection.delegate( 'foo' ).to( target );
				target.on( 'foo', spy );

				collection.add( new Controller( model ) );
				model.fire( 'foo' );

				sinon.assert.callCount( spy, 1 );

				collection.remove( 0 );
				model.fire( 'foo' );

				sinon.assert.callCount( spy, 1 );
			} );

			it( 'supports deep event delegation', ( done ) => {
				const collection = new ControllerCollection( 'foo' );
				const target = new Model();
				const modelA = new Model();
				const modelAA = new Model();
				const data = {};

				const controllerA = new Controller( modelA );
				const controllerAA = new Controller( modelAA );
				const barCollection = controllerA.addCollection( 'bar' );

				collection.add( controllerA );
				collection.delegate( 'foo' ).to( target );

				barCollection.add( controllerAA );
				barCollection.delegate( 'foo' ).to( modelA );

				target.on( 'foo', ( ...args ) => {
					assertDelegated( args, {
						expectedName: 'foo',
						expectedSource: modelAA,
						expectedPath: [ modelAA, modelA, target ],
						expectedData: [ data ]
					} );

					done();
				} );

				modelAA.fire( 'foo', data );
			} );
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
		constructor( locale ) {
			super( locale );

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
	models = new Collection( { idProperty: 'uid' } );

	for ( let i = 0; i < 5; i++ ) {
		models.add( new Model( {
			uid: Number( i ).toString()
		} ) );
	}
}

function assertDelegated( evtArgs, { expectedName, expectedSource, expectedPath, expectedData } ) {
	const evtInfo = evtArgs[ 0 ];

	expect( evtInfo.name ).to.equal( expectedName );
	expect( evtInfo.source ).to.equal( expectedSource );
	expect( evtInfo.path ).to.deep.equal( expectedPath );
	expect( evtArgs.slice( 1 ) ).to.deep.equal( expectedData );
}
