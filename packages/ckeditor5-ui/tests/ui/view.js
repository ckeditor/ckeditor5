/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document, HTMLElement */

'use strict';

var modules = bender.amd.require( 'ckeditor', 'ui/view' );
var view;

describe( 'plain view', function() {
	beforeEach( 'Create a test view instance', function() {
		var View = modules[ 'ui/view' ];

		view = new View( {
			a: 'foo',
			b: 42
		} );
	} );

	it( 'accepts the model', function() {
		expect( view ).to.have.deep.property( 'model.a', 'foo' );
		expect( view ).to.have.deep.property( 'model.b', 42 );
	} );

	it( 'has no default element', function() {
		expect( view.el ).to.be.null();
	} );

	it( 'has no default template', function() {
		expect( view.template ).to.be.undefined();
	} );

	it( 'has no default regions', function() {
		expect( view.regions.length ).to.be.equal( 0 );
	} );
} );

describe( 'rich view', function() {
	beforeEach( 'Create a test view instance', function() {
		var View = modules[ 'ui/view' ];
		var Component = class extends View {
				constructor( model ) {
					super( model );

					this.template = {
						tag: 'p',
						attributes: {
							'class': 'a',
							x: this.bind( this.model, 'plain' )
						},
						text: 'b',
						children: [
							{
								tag: 'b',
								text: 'c',
								attributes: {
									y: this.bind( this.model, 'augmented', function( el, value ) {
										return ( value > 0 ? 'positive' : 'negative' );
									} )
								}
							},
							{
								tag: 'i',
								text: 'd',
								attributes: {
									z: this.bind( this.model, 'custom', function( el, value ) {
										el.innerHTML = value;

										if ( value == 'foo' ) {
											return value;
										}
									} )
								}
							}
						]
					};
				}
			};

		view = new Component( {
			plain: 'z',
			augmented: 7,
			custom: 'moo'
		} );
	} );

	it( 'renders the element', function() {
		expect( view.el ).to.be.instanceof( HTMLElement );
		expect( view.el.parentNode ).to.be.null();

		expect( getOuterHtml( view.el ) ).to.be.equal( '<p class="a" x="z">b<b y="positive">c</b><i>moo</i></p>' );
	} );

	it( 'reacts to changes in model', function() {
		view.model.plain = 'x';
		expect( getOuterHtml( view.el ) ).to.be.equal( '<p class="a" x="x">b<b y="positive">c</b><i>moo</i></p>' );

		view.model.augmented = 2;
		expect( getOuterHtml( view.el ) ).to.be.equal( '<p class="a" x="x">b<b y="positive">c</b><i>moo</i></p>' );

		view.model.augmented = -2;
		expect( getOuterHtml( view.el ) ).to.be.equal( '<p class="a" x="x">b<b y="negative">c</b><i>moo</i></p>' );

		view.model.custom = 'foo';
		expect( getOuterHtml( view.el ) ).to.be.equal( '<p class="a" x="x">b<b y="negative">c</b><i z="foo">foo</i></p>' );
	} );
} );

function getOuterHtml( el ) {
	var container = document.createElement( 'div' );
	container.appendChild( el.cloneNode( 1 ) );

	return container.innerHTML;
}
