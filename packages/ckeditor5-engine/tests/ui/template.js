/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: core, ui */
/* global document, HTMLElement */

'use strict';

var modules = bender.amd.require( 'ckeditor', 'ui/view', 'ui/template' );

describe( 'Template', function() {
	var View;
	var Template;

	beforeEach( 'Create a test view instance', function() {
		View = modules[ 'ui/view' ];
		Template = modules[ 'ui/template' ];
	} );

	it( 'accepts the definition', function() {
		var def = {
			tag: 'p'
		};

		expect( new Template( def ).def ).to.equal( def );
	} );

	it( 'renders the element', function() {
		var el = new Template( {
			tag: 'p',
			attributes: {
				'class': [ 'a', 'b' ],
				x: 'bar'
			},
			text: 'foo'
		} ).render();

		expect( el ).to.be.instanceof( HTMLElement );
		expect( el.parentNode ).to.be.null();

		expect( getOuterHtml( el ) ).to.be.equal( '<p class="a b" x="bar">foo</p>' );
	} );

	it( 'renders element\'s children', function() {
		var el = new Template( {
			tag: 'p',
			attributes: {
				a: 'A'
			},
			children: [
				{
					tag: 'b',
					text: 'B'
				},
				{
					tag: 'i',
					text: 'C',
					children: [
						{
							tag: 'b',
							text: 'D'
						}
					]
				}
			]
		} ).render();

		expect( getOuterHtml( el ) ).to.be.equal( '<p a="A"><b>B</b><i>C<b>D</b></i></p>' );
	} );

	it( 'binds to the model', function() {
		var view = new View( {
			foo: 'bar'
		} );

		var el = new Template( {
			tag: 'p',
			attributes: {
				'class': view.bind( 'foo' )
			},
			text: view.bind( 'foo' )
		} ).render();

		expect( getOuterHtml( el ) ).to.be.equal( '<p class="bar">bar</p>' );

		view.model.foo = 'baz';
		expect( getOuterHtml( el ) ).to.be.equal( '<p class="baz">baz</p>' );
	} );

	it( 'binds to the model and processes the property', function() {
		var view = new View( {
			foo: 7
		} );

		var callback = ( el, value ) => ( value > 0 ? 'positive' : 'negative' );

		var el = new Template( {
			tag: 'p',
			attributes: {
				'class': view.bind( 'foo', callback )
			},
			text: view.bind( 'foo', callback )
		} ).render();

		expect( getOuterHtml( el ) ).to.be.equal( '<p class="positive">positive</p>' );

		view.model.foo = -7;
		expect( getOuterHtml( el ) ).to.be.equal( '<p class="negative">negative</p>' );
	} );

	it( 'binds to the model and executes custom action', function() {
		var view = new View( {
			foo: 'moo'
		} );

		var callback = ( el, value ) => {
			el.innerHTML = value;

			if ( value == 'changed' ) {
				return value;
			}
		};

		var el = new Template( {
			tag: 'p',
			attributes: {
				'class': view.bind( 'foo', callback )
			},
			text: 'bar'
		} ).render();

		expect( getOuterHtml( el ) ).to.be.equal( '<p>moo</p>' );

		view.model.foo = 'changed';
		expect( getOuterHtml( el ) ).to.be.equal( '<p class="changed">changed</p>' );
	} );

	it( 'binds to the model and updates element\'s text', function() {
		var view = new View( {
			foo: 'bar'
		} );

		var el = new Template( {
			tag: 'p',
			children: [
				{
					tag: 'b',
					text: 'baz'
				}
			],
			text: view.bind( 'foo' )
		} ).render();

		expect( getOuterHtml( el ) ).to.be.equal( '<p>bar<b>baz</b></p>' );

		// TODO: A solution to avoid nuking the children?
		view.model.foo = 'qux';
		expect( getOuterHtml( el ) ).to.be.equal( '<p>qux</p>' );
	} );
} );

function getOuterHtml( el ) {
	var container = document.createElement( 'div' );
	container.appendChild( el.cloneNode( 1 ) );

	return container.innerHTML;
}
