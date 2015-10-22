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
		setTestViewClass( function() {
			return {
				tag: 'p',
				attributes: {
					'class': this.bind( 'foo' )
				},
				text: 'abc'
			};
		} );

		view = new TestView( { foo: 'bar' } );

		expect( view.el.outerHTML ).to.be.equal( '<p class="bar">abc</p>' );

		view.model.foo = 'baz';
		expect( view.el.outerHTML ).to.be.equal( '<p class="baz">abc</p>' );
	} );

	it( 'allows binding "text" to the model', function() {
		setTestViewClass( function() {
			return {
				tag: 'p',
				children: [
					{
						tag: 'b',
						text: 'baz'
					}
				],
				text: this.bind( 'foo' )
			};
		} );

		view = new TestView( { foo: 'bar' } );

		expect( view.el.outerHTML ).to.be.equal( '<p>bar<b>baz</b></p>' );

		// TODO: A solution to avoid nuking the children?
		view.model.foo = 'qux';
		expect( view.el.outerHTML ).to.be.equal( '<p>qux</p>' );
	} );

	it( 'allows binding to the model with value processing', function() {
		var callback = ( el, value ) =>
			( value > 0 ? 'positive' : 'negative' );

		setTestViewClass( function() {
			return {
				tag: 'p',
				attributes: {
					'class': this.bind( 'foo', callback )
				},
				text: this.bind( 'foo', callback )
			};
		} );

		view = new TestView( { foo: 3 } );
		expect( view.el.outerHTML ).to.be.equal( '<p class="positive">positive</p>' );

		view.model.foo = -7;
		expect( view.el.outerHTML ).to.be.equal( '<p class="negative">negative</p>' );
	} );

	it( 'allows binding to the model with custom callback', function() {
		setTestViewClass( function() {
			return {
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
		} );

		view = new TestView( { foo: 'moo' } );
		expect( view.el.outerHTML ).to.be.equal( '<p>moo</p>' );

		view.model.foo = 'changed';
		expect( view.el.outerHTML ).to.be.equal( '<p class="changed">changed</p>' );
	} );
} );

describe( 'listeners', function() {
	it( 'accept plain definitions', function() {
		setTestViewClass( function() {
			return {
				tag: 'p',
				listeners: {
					x: 'a',
					y: [ 'b', 'c' ],
				}
			};
		} );

		view = new TestView();

		view.el.dispatchEvent( new Event( 'x' ) );
		view.el.dispatchEvent( new Event( 'y' ) );
	} );

	it( 'accept definition with selectors', function() {
		setTestViewClass( function() {
			return {
				tag: 'p',
				children: [
					{
						tag: 'span',
						'class': '.y'
					},
					{
						tag: 'div',
						children: [
							{
								tag: 'span',
								'class': '.y'
							}
						],
					}
				],
				listeners: {
					'x@.y': 'a',
					'y@div': 'b'
				}
			};
		} );

		view = new TestView();

		view.el.childNodes[ 0 ].dispatchEvent( new Event( 'x' ) );
		view.el.childNodes[ 1 ].dispatchEvent( new Event( 'x' ) ); // false
		view.el.childNodes[ 1 ].childNodes[ 0 ].dispatchEvent( new Event( 'x' ) );

		view.el.childNodes[ 0 ].dispatchEvent( new Event( 'y' ) ); // false
		view.el.childNodes[ 1 ].dispatchEvent( new Event( 'y' ) );
		view.el.childNodes[ 1 ].childNodes[ 0 ].dispatchEvent( new Event( 'y' ) ); // false
	} );
} );

describe( 'render', function() {
	it( 'creates an element from template', function() {
		view = new TestView( { a: 1 } );

		expect( view.el ).to.be.an.instanceof( HTMLElement );
		expect( view.el.nodeName ).to.be.equal( 'A' );
	} );
} );

describe( 'destroy', function() {
	it( 'detaches the model', function() {
		expect( view.model ).to.be.an.instanceof( modules.model );

		view.destroy();

		expect( view.model ).to.be.null;
	} );

	it( 'detaches the element', function() {
		view = new TestView();

		// Append the views's element to some container.
		var container = document.createElement( 'div' );
		container.appendChild( view.el );

		expect( view.el.nodeName ).to.be.equal( 'A' );
		expect( view.el ).to.be.an.instanceof( HTMLElement );
		expect( view.el.parentNode ).to.be.equal( container );

		view.destroy();

		expect( view.el ).to.be.an.instanceof( HTMLElement );
		expect( view.el.parentNode ).to.be.null;
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

	it( 'detaches bound model listeners', function() {
		setTestViewClass( function() {
			return {
				tag: 'p',
				text: this.bind( 'foo' )
			};
		} );

		view = new TestView( { foo: 'bar' } );
		var model = view.model;

		expect( view.el.outerHTML ).to.be.equal( '<p>bar</p>' );

		model.foo = 'baz';
		expect( view.el.outerHTML ).to.be.equal( '<p>baz</p>' );

		view.destroy();

		model.foo = 'abc';
		expect( view.el.outerHTML ).to.be.equal( '<p>baz</p>' );
	} );
} );

function createViewInstance() {
	View = modules[ 'ui/view' ];
	view = new View( { a: 'foo', b: 42 } );

	setTestViewClass( () => {
		return { tag: 'a' };
	} );
}

function setTestViewClass( template ) {
	TestView = class V extends View {
		constructor( model ) {
			super( model );
			this.template = template.call( this );
		}
	};
}
