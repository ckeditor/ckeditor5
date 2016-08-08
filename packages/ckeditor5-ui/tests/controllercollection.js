/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: ui */

import testUtils from '/tests/core/_utils/utils.js';
import ControllerCollection from '/ckeditor5/ui/controllercollection.js';
import Controller from '/ckeditor5/ui/controller.js';
import Collection from '/ckeditor5/utils/collection.js';
import Model from '/ckeditor5/ui/model.js';
import View from '/ckeditor5/ui/view.js';
import Template from '/ckeditor5/ui/template.js';
import CKEditorError from '/ckeditor5/utils/ckeditorerror.js';

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

	describe( 'pipe', () => {
		it( 'should throw when event names are not strings', () => {
			const collection = new ControllerCollection( 'foo' );

			expect( () => {
				collection.pipe();
			} ).to.throw( CKEditorError, /ui-controllercollection-pipe-wrong-events/ );

			expect( () => {
				collection.pipe( new Date() );
			} ).to.throw( CKEditorError, /ui-controllercollection-pipe-wrong-events/ );

			expect( () => {
				collection.pipe( 'color', new Date() );
			} ).to.throw( CKEditorError, /ui-controllercollection-pipe-wrong-events/ );
		} );

		it( 'returns object', () => {
			expect( new ControllerCollection( 'foo' ).pipe( 'foo' ) ).to.be.an( 'object' );
		} );

		it( 'provides "to" interface', () => {
			const pipe = new ControllerCollection( 'foo' ).pipe( 'foo' );

			expect( pipe ).to.have.keys( 'to' );
			expect( pipe.to ).to.be.a( 'function' );
		} );

		describe( 'to', () => {
			it( 'does not chain', () => {
				const collection = new ControllerCollection( 'foo' );
				const returned = collection.pipe( 'foo' ).to( {} );

				expect( returned ).to.be.undefined;
			} );

			it( 'forwards an event to another observable – existing controller', ( done ) => {
				const target = new Model();
				const collection = new ControllerCollection( 'foo' );
				const model = new Model();

				collection.add( new Controller( model ) );
				collection.pipe( 'foo' ).to( target );

				target.on( 'foo', ( ...args ) => {
					assertPipe( args, 'foo', target, model );
					done();
				} );

				model.fire( 'foo' );
			} );

			it( 'forwards an event to another observable – new controller', ( done ) => {
				const target = new Model();
				const collection = new ControllerCollection( 'foo' );
				const model = new Model();

				collection.pipe( 'foo' ).to( target );
				collection.add( new Controller( model ) );

				target.on( 'foo', ( ...args ) => {
					assertPipe( args, 'foo', target, model );
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

				collection.pipe( 'foo', 'bar', 'baz' ).to( target );
				collection.add( new Controller( modelA ) );
				collection.add( new Controller( modelB ) );
				collection.add( new Controller( modelC ) );

				const evts = [];

				function recordEvent( ...args ) {
					evts.push( args );
				}

				target.on( 'foo', recordEvent );
				target.on( 'bar', recordEvent );
				target.on( 'baz', recordEvent );

				modelA.fire( 'foo' );

				expect( evts ).to.have.length( 1 );
				assertPipe( evts[ 0 ], 'foo', target, modelA );

				modelB.fire( 'bar' );

				expect( evts ).to.have.length( 2 );
				assertPipe( evts[ 1 ], 'bar', target, modelB );

				modelC.fire( 'baz' );

				expect( evts ).to.have.length( 3 );
				assertPipe( evts[ 2 ], 'baz', target, modelC );
			} );

			it( 'does not forward events which are not supposed to be piped', () => {
				const target = new Model();
				const collection = new ControllerCollection( 'foo' );
				const model = new Model();

				collection.pipe( 'foo', 'bar', 'baz' ).to( target );
				collection.add( new Controller( model ) );

				let firedCounter = 0;
				target.on( 'foo', () => ++firedCounter );
				target.on( 'bar', () => ++firedCounter );
				target.on( 'baz', () => ++firedCounter );

				model.fire( 'foo' );
				model.fire( 'baz' );
				model.fire( 'baz' );
				model.fire( 'not-piped' );

				expect( firedCounter ).to.equal( 3 );
			} );

			it( 'stops forwarding when controller removed from the collection', () => {
				const target = new Model();
				const collection = new ControllerCollection( 'foo' );
				const model = new Model();

				collection.pipe( 'foo' ).to( target );
				collection.add( new Controller( model ) );

				let firedCounter = 0;
				target.on( 'foo', () => ++firedCounter );

				model.fire( 'foo' );
				collection.remove( 0 );
				model.fire( 'foo' );

				expect( firedCounter ).to.equal( 1 );
			} );

			it( 'supports deep event piping', ( done ) => {
				const collection = new ControllerCollection( 'foo' );
				const target = new Model();
				const modelA = new Model();
				const modelAA = new Model();

				const controllerA = new Controller( modelA );
				const controllerAA = new Controller( modelAA );
				const barCollection = controllerA.addCollection( 'bar' );

				collection.add( controllerA );
				collection.pipe( 'foo' ).to( target );

				barCollection.add( controllerAA );
				barCollection.pipe( 'foo' ).to( modelA );

				target.on( 'foo', ( ...args ) => {
					assertPipe( args, 'foo', target, modelA, modelAA );
					done();
				} );

				modelAA.fire( 'foo' );
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

function assertPipe( evtArgs, expectedName, ...observables ) {
	let pipeNumber = 0;

	for ( let observable of observables ) {
		expect( evtArgs[ pipeNumber ].name ).to.equal( expectedName );
		expect( evtArgs[ pipeNumber ].source ).to.equal( observable );

		++pipeNumber;
	}
}
