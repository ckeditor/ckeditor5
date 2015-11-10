/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document, HTMLElement */
/* bender-tags: core, ui */

'use strict';

const modules = bender.amd.require( 'ckeditor', 'ui/view', 'ui/region', 'ckeditorerror', 'model', 'eventinfo' );
let View, TestView;
let view;

bender.tools.createSinonSandbox();

beforeEach( updateModuleReference );

describe( 'constructor', function() {
	beforeEach( function() {
		setTestViewClass();
		setTestViewInstance();
	} );

	it( 'accepts the model', function() {
		setTestViewInstance( { a: 'foo', b: 42 } );

		expect( view.model ).to.be.an.instanceof( modules.model );
		expect( view ).to.have.deep.property( 'model.a', 'foo' );
		expect( view ).to.have.deep.property( 'model.b', 42 );
	} );
} );

describe( 'instance', function() {
	beforeEach( function() {
		setTestViewClass();
		setTestViewInstance();
	} );

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
	beforeEach( createViewInstanceWithTemplate );

	it( 'returns a function that passes arguments', function() {
		setTestViewInstance( { a: 'foo' } );

		let spy = bender.sinon.spy();
		let callback = view.bind( 'a', spy );

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
				attrs: {
					'class': this.bind( 'foo' )
				},
				text: 'abc'
			};
		} );

		setTestViewInstance( { foo: 'bar' } );

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

		setTestViewInstance( { foo: 'bar' } );

		expect( view.el.outerHTML ).to.be.equal( '<p>bar<b>baz</b></p>' );

		// TODO: A solution to avoid nuking the children?
		view.model.foo = 'qux';
		expect( view.el.outerHTML ).to.be.equal( '<p>qux</p>' );
	} );

	it( 'allows binding to the model with value processing', function() {
		let callback = ( el, value ) =>
			( value > 0 ? 'positive' : 'negative' );

		setTestViewClass( function() {
			return {
				tag: 'p',
				attrs: {
					'class': this.bind( 'foo', callback )
				},
				text: this.bind( 'foo', callback )
			};
		} );

		setTestViewInstance( { foo: 3 } );
		expect( view.el.outerHTML ).to.be.equal( '<p class="positive">positive</p>' );

		view.model.foo = -7;
		expect( view.el.outerHTML ).to.be.equal( '<p class="negative">negative</p>' );
	} );

	it( 'allows binding to the model with custom callback', function() {
		setTestViewClass( function() {
			return {
				tag: 'p',
				attrs: {
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

		setTestViewInstance( { foo: 'moo' } );
		expect( view.el.outerHTML ).to.be.equal( '<p>moo</p>' );

		view.model.foo = 'changed';
		expect( view.el.outerHTML ).to.be.equal( '<p class="changed">changed</p>' );
	} );
} );

describe( 'on', function() {
	it( 'accepts plain binding', function() {
		let spy = bender.sinon.spy();

		setTestViewClass( function() {
			return {
				tag: 'p',
				on: {
					x: 'a',
				}
			};
		} );

		setTestViewInstance();

		view.on( 'a', spy );

		dispatchEvent( view.el, 'x' );
		sinon.assert.calledWithExactly( spy,
			sinon.match.has( 'name', 'a' ),
			sinon.match.has( 'target', view.el )
		);
	} );

	it( 'accepts an array of event bindings', function() {
		let spy1 = bender.sinon.spy();
		let spy2 = bender.sinon.spy();

		setTestViewClass( function() {
			return {
				tag: 'p',
				on: {
					x: [ 'a', 'b' ]
				}
			};
		} );

		setTestViewInstance();

		view.on( 'a', spy1 );
		view.on( 'b', spy2 );

		dispatchEvent( view.el, 'x' );
		sinon.assert.calledWithExactly( spy1,
			sinon.match.has( 'name', 'a' ),
			sinon.match.has( 'target', view.el )
		);
		sinon.assert.calledWithExactly( spy2,
			sinon.match.has( 'name', 'b' ),
			sinon.match.has( 'target', view.el )
		);
	} );

	it( 'accepts DOM selectors', function() {
		let spy1 = bender.sinon.spy();
		let spy2 = bender.sinon.spy();
		let spy3 = bender.sinon.spy();

		setTestViewClass( function() {
			return {
				tag: 'p',
				children: [
					{
						tag: 'span',
						attrs: {
							'class': 'y',
						},
						on: {
							'test@p': 'c'
						}
					},
					{
						tag: 'div',
						children: [
							{
								tag: 'span',
								attrs: {
									'class': 'y',
								}
							}
						],
					}
				],
				on: {
					'test@.y': 'a',
					'test@div': 'b'
				}
			};
		} );

		setTestViewInstance();

		view.on( 'a', spy1 );
		view.on( 'b', spy2 );
		view.on( 'c', spy3 );

		// Test "test@p".
		dispatchEvent( view.el, 'test' );

		sinon.assert.callCount( spy1, 0 );
		sinon.assert.callCount( spy2, 0 );
		sinon.assert.callCount( spy3, 0 );

		// Test "test@.y".
		dispatchEvent( view.el.firstChild, 'test' );

		expect( spy1.firstCall.calledWithExactly(
			sinon.match.has( 'name', 'a' ),
			sinon.match.has( 'target', view.el.firstChild )
		) ).to.be.true;

		sinon.assert.callCount( spy2, 0 );
		sinon.assert.callCount( spy3, 0 );

		// Test "test@div".
		dispatchEvent( view.el.lastChild, 'test' );

		sinon.assert.callCount( spy1, 1 );

		expect( spy2.firstCall.calledWithExactly(
			sinon.match.has( 'name', 'b' ),
			sinon.match.has( 'target', view.el.lastChild )
		) ).to.be.true;

		sinon.assert.callCount( spy3, 0 );

		// Test "test@.y".
		dispatchEvent( view.el.lastChild.firstChild, 'test' );

		expect( spy1.secondCall.calledWithExactly(
			sinon.match.has( 'name', 'a' ),
			sinon.match.has( 'target', view.el.lastChild.firstChild )
		) ).to.be.true;

		sinon.assert.callCount( spy2, 1 );
		sinon.assert.callCount( spy3, 0 );
	} );

	it( 'accepts function callbacks', function() {
		let spy1 = bender.sinon.spy();
		let spy2 = bender.sinon.spy();

		setTestViewClass( function() {
			return {
				tag: 'p',
				children: [
					{
						tag: 'span'
					}
				],
				on: {
					x: spy1,
					'y@span': [ spy2, 'c' ],
				}
			};
		} );

		setTestViewInstance();

		dispatchEvent( view.el, 'x' );
		dispatchEvent( view.el.firstChild, 'y' );

		sinon.assert.calledWithExactly( spy1,
			sinon.match.has( 'target', view.el )
		);

		sinon.assert.calledWithExactly( spy2,
			sinon.match.has( 'target', view.el.firstChild )
		);
	} );

	it( 'supports event delegation', function() {
		let spy = bender.sinon.spy();

		setTestViewClass( function() {
			return {
				tag: 'p',
				children: [
					{
						tag: 'span'
					}
				],
				on: {
					x: 'a',
				}
			};
		} );

		setTestViewInstance();

		view.on( 'a', spy );

		dispatchEvent( view.el.firstChild, 'x' );
		sinon.assert.calledWithExactly( spy,
			sinon.match.has( 'name', 'a' ),
			sinon.match.has( 'target', view.el.firstChild )
		);
	} );

	it( 'works for future elements', function() {
		let spy = bender.sinon.spy();

		setTestViewClass( function() {
			return {
				tag: 'p',
				on: {
					'test@div': 'a'
				}
			};
		} );

		setTestViewInstance();

		view.on( 'a', spy );

		let div = document.createElement( 'div' );
		view.el.appendChild( div );

		dispatchEvent( div, 'test' );
		sinon.assert.calledWithExactly( spy, sinon.match.has( 'name', 'a' ), sinon.match.has( 'target', div ) );
	} );
} );

describe( 'render', function() {
	beforeEach( createViewInstanceWithTemplate );

	it( 'creates an element from template', function() {
		setTestViewInstance( { a: 1 } );

		expect( view.el ).to.be.an.instanceof( HTMLElement );
		expect( view.el.nodeName ).to.be.equal( 'A' );
	} );
} );

describe( 'destroy', function() {
	beforeEach( createViewInstanceWithTemplate );

	it( 'detaches the model', function() {
		expect( view.model ).to.be.an.instanceof( modules.model );

		view.destroy();

		expect( view.model ).to.be.null;
	} );

	it( 'detaches the element', function() {
		// Append the views's element to some container.
		let container = document.createElement( 'div' );
		container.appendChild( view.el );

		expect( view.el.nodeName ).to.be.equal( 'A' );
		expect( view.el ).to.be.an.instanceof( HTMLElement );
		expect( view.el.parentNode ).to.be.equal( container );

		view.destroy();

		expect( view.el ).to.be.an.instanceof( HTMLElement );
		expect( view.el.parentNode ).to.be.null;
	} );

	it( 'destroys child regions', function() {
		const Region = modules[ 'ui/region' ];
		let region = new Region( 'test' );
		let spy = bender.sinon.spy( region, 'destroy' );

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

		setTestViewInstance( { foo: 'bar' } );

		// Keep the reference after the view is destroyed.
		let model = view.model;

		expect( view.el.outerHTML ).to.be.equal( '<p>bar</p>' );

		model.foo = 'baz';
		expect( view.el.outerHTML ).to.be.equal( '<p>baz</p>' );

		view.destroy();

		model.foo = 'abc';
		expect( view.el.outerHTML ).to.be.equal( '<p>baz</p>' );
	} );
} );

function updateModuleReference() {
	View = modules[ 'ui/view' ];
}

function createViewInstanceWithTemplate() {
	setTestViewClass( () => ( { tag: 'a' } ) );
	setTestViewInstance();
}

function setTestViewClass( template ) {
	TestView = class V extends View {
		constructor( model ) {
			super( model );

			if ( template ) {
				this.template = template.call( this );
			}
		}
	};
}

function setTestViewInstance( model ) {
	view = new TestView( model );

	if ( view.template ) {
		document.body.appendChild( view.el );
	}
}

function dispatchEvent( el, domEvtName ) {
	if ( !el.parentNode ) {
		throw new Error( 'To dispatch an event, element must be in DOM. Otherwise #target is null.' );
	}

	el.dispatchEvent( new Event( domEvtName, {
		bubbles: true
	} ) );
}
