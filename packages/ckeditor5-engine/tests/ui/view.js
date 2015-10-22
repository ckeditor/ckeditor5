/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document, HTMLElement */
/* bender-tags: core, ui */

'use strict';

var modules = bender.amd.require( 'ckeditor', 'ui/view', 'ui/region', 'ckeditorerror', 'model' );
var View, TestView;
var view;

bender.tools.createSinonSandbox();
beforeEach( createViewInstance );

describe( 'constructor', function() {
	it( 'accepts the model', function() {
		expect( view.model ).to.be.an.instanceof( modules.model );

		expect( view ).to.have.deep.property( 'model.a', 'foo' );
		expect( view ).to.have.deep.property( 'model.b', 42 );
	} );
} );

describe( 'instance', function() {
	it( 'has no default element', function() {
		expect( () => view.el ).to.throw( modules.ckeditorerror );
	} );

	it( 'has no default template', function() {
		expect( view.template ).to.be.undefined();
	} );

	it( 'has no default regions', function() {
		expect( view.regions ).to.have.length( 0 );
	} );
} );

describe( 'bind', function() {
	it( 'returns a function that passes arguments', function() {
		var spy = bender.sinon.spy();
		var callback = view.bind( 'a', spy );

		expect( spy.called ).to.be.false;

		callback( 'el', 'updater' );
		sinon.assert.calledOnce( spy );
		sinon.assert.calledWithExactly( spy, 'el', 'foo' );

		view.model.a = 'bar';
		sinon.assert.calledTwice( spy );
		expect( spy.secondCall.calledWithExactly( 'el', 'bar' ) ).to.be.true;
	} );

	it( 'allows binding attribute to the model', function() {
		class TestView extends View {
			constructor( model ) {
				super( model );

				this.template = {
					tag: 'p',
					attributes: {
						'class': this.bind( 'foo' )
					},
					text: 'abc'
				};
			}
		}

		view = new TestView( { foo: 'bar' } );
		expect( view.el.outerHTML ).to.be.equal( '<p class="bar">abc</p>' );

		view.model.foo = 'baz';
		expect( view.el.outerHTML ).to.be.equal( '<p class="baz">abc</p>' );
	} );

	it( 'allows binding "text" to the model', function() {
		class TestView extends View {
			constructor( model ) {
				super( model );

				this.template = {
					tag: 'p',
					children: [
						{
							tag: 'b',
							text: 'baz'
						}
					],
					text: this.bind( 'foo' )
				};
			}
		}

		view = new TestView( { foo: 'bar' } );

		expect( view.el.outerHTML ).to.be.equal( '<p>bar<b>baz</b></p>' );

		// TODO: A solution to avoid nuking the children?
		view.model.foo = 'qux';
		expect( view.el.outerHTML ).to.be.equal( '<p>qux</p>' );
	} );

	it( 'allows binding to the model with value processing', function() {
		class TestView extends View {
			constructor( model ) {
				super( model );

				var callback = ( el, value ) =>
					( value > 0 ? 'positive' : 'negative' );

				this.template = {
					tag: 'p',
					attributes: {
						'class': this.bind( 'foo', callback )
					},
					text: this.bind( 'foo', callback )
				};
			}
		}

		view = new TestView( { foo: 3 } );
		expect( view.el.outerHTML ).to.be.equal( '<p class="positive">positive</p>' );

		view.model.foo = -7;
		expect( view.el.outerHTML ).to.be.equal( '<p class="negative">negative</p>' );
	} );

	it( 'allows binding to the model with custom callback', function() {
		class TestView extends View {
			constructor( model ) {
				super( model );

				this.template = {
					tag: 'p',
					attributes: {
						'class': this.bind( 'foo', ( el, value ) => {
							el.innerHTML = value;

							if ( value == 'changed' ) {
								return value;
							}
						} )
					},
					text: 'bar'
				};
			}
		}

		view = new TestView( { foo: 'moo' } );
		expect( view.el.outerHTML ).to.be.equal( '<p>moo</p>' );

		view.model.foo = 'changed';
		expect( view.el.outerHTML ).to.be.equal( '<p class="changed">changed</p>' );
	} );
} );

describe( 'render', function() {
	it( 'creates an element from template', function() {
		view = new TestView( { a: 1 } );

		expect( view.el ).to.be.an.instanceof( HTMLElement );
		expect( view.el.nodeName ).to.be.equal( 'A' );
	} );
} );

describe( 'destroys', function() {
	it( 'destroys the view', function() {
		view = new TestView( { a: 1 } );

		// Append the views's element to some container.
		var container = document.createElement( 'div' );
		container.appendChild( view.el );

		expect( view.el.nodeName ).to.be.equal( 'A' );
		expect( view.el ).to.be.an.instanceof( HTMLElement );
		expect( view.el.parentNode ).to.be.equal( container );
		expect( view.model ).to.be.an.instanceof( modules.model );

		view.destroy();

		expect( view.el ).to.be.an.instanceof( HTMLElement );
		expect( view.el.parentNode ).to.be.null;
		expect( view.model ).to.be.null;
	} );

	it( 'destroys child regions', function() {
		var Region = modules[ 'ui/region' ];
		var region = new Region();
		var spy = bender.sinon.spy( region, 'destroy' );

		view.regions.add( region );
		view.destroy();

		expect( view.regions ).to.have.length( 0 );
		expect( spy.calledOnce ).to.be.true;
	} );
} );

function createViewInstance() {
	View = modules[ 'ui/view' ];
	view = new View( { a: 'foo', b: 42 } );

	class T extends View {
		constructor() {
			super();
			this.template = { tag: 'a' };
		}
	}

	TestView = T;
}
