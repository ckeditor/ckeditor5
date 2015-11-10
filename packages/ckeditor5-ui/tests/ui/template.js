/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: core, ui */
/* global HTMLElement */

'use strict';

const modules = bender.amd.require( 'ckeditor', 'ui/view', 'ui/template' );
var Template;

bender.tools.createSinonSandbox();
beforeEach( createClassReferences );

describe( 'constructor', function() {
	it( 'accepts the definition', function() {
		var def = {
			tag: 'p'
		};

		expect( new Template( def ).def ).to.equal( def );
	} );
} );

describe( 'render', function() {
	it( 'returns null when no definition', function() {
		expect( new Template().render() ).to.be.null;
	} );

	it( 'creates an element', function() {
		var el = new Template( {
			tag: 'p',
			attrs: {
				'class': [ 'a', 'b' ],
				x: 'bar'
			},
			text: 'foo'
		} ).render();

		expect( el ).to.be.instanceof( HTMLElement );
		expect( el.parentNode ).to.be.null();

		expect( el.outerHTML ).to.be.equal( '<p class="a b" x="bar">foo</p>' );
	} );

	it( 'creates element\'s children', function() {
		var el = new Template( {
			tag: 'p',
			attrs: {
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

		expect( el.outerHTML ).to.be.equal( '<p a="A"><b>B</b><i>C<b>D</b></i></p>' );
	} );
} );

describe( 'callback value', function() {
	it( 'works for attributes', function() {
		var spy1 = bender.sinon.spy();
		var spy2 = bender.sinon.spy();

		var el = new Template( {
			tag: 'p',
			attrs: {
				'class': spy1
			},
			children: [
				{
					tag: 'span',
					attrs: {
						id: spy2
					}
				}
			]
		} ).render();

		sinon.assert.calledWithExactly( spy1, el, sinon.match.func );
		sinon.assert.calledWithExactly( spy2, el.firstChild, sinon.match.func );

		spy1.firstCall.args[ 1 ]( el, 'foo' );
		spy2.firstCall.args[ 1 ]( el.firstChild, 'bar' );

		expect( el.outerHTML ).to.be.equal( '<p class="foo"><span id="bar"></span></p>' );
	} );

	it( 'works for "text" property', function() {
		var spy1 = bender.sinon.spy();
		var spy2 = bender.sinon.spy();

		var el = new Template( {
			tag: 'p',
			text: spy1,
			children: [
				{
					tag: 'span',
					text: spy2
				}
			]
		} ).render();

		sinon.assert.calledWithExactly( spy1, el, sinon.match.func );
		sinon.assert.calledWithExactly( spy2, el.firstChild, sinon.match.func );

		spy2.firstCall.args[ 1 ]( el.firstChild, 'bar' );
		expect( el.outerHTML ).to.be.equal( '<p><span>bar</span></p>' );

		spy1.firstCall.args[ 1 ]( el, 'foo' );
		expect( el.outerHTML ).to.be.equal( '<p>foo</p>' );
	} );

	it( 'works for "on" property', function() {
		var spy1 = bender.sinon.spy();
		var spy2 = bender.sinon.spy();
		var spy3 = bender.sinon.spy();
		var spy4 = bender.sinon.spy();

		var el = new Template( {
			tag: 'p',
			children: [
				{
					tag: 'span',
					on: {
						bar: spy2
					}
				}
			],
			on: {
				foo: spy1,
				baz: [ spy3, spy4 ]
			}
		} ).render();

		sinon.assert.calledWithExactly( spy1, el, 'foo', null );
		sinon.assert.calledWithExactly( spy2, el.firstChild, 'bar', null );
		sinon.assert.calledWithExactly( spy3, el, 'baz', null );
		sinon.assert.calledWithExactly( spy4, el, 'baz', null );
	} );

	it( 'works for "on" property with selectors', function() {
		var spy1 = bender.sinon.spy();
		var spy2 = bender.sinon.spy();
		var spy3 = bender.sinon.spy();
		var spy4 = bender.sinon.spy();

		var el = new Template( {
			tag: 'p',
			children: [
				{
					tag: 'span',
					attrs: {
						'id': 'x'
					}
				},
				{
					tag: 'span',
					attrs: {
						'class': 'y'
					},
					on: {
						'bar@p': spy2
					}
				},
			],
			on: {
				'foo@span': spy1,
				'baz@.y': [ spy3, spy4 ]
			}
		} ).render();

		sinon.assert.calledWithExactly( spy1, el, 'foo', 'span' );
		sinon.assert.calledWithExactly( spy2, el.lastChild, 'bar', 'p' );
		sinon.assert.calledWithExactly( spy3, el, 'baz', '.y' );
		sinon.assert.calledWithExactly( spy4, el, 'baz', '.y' );
	} );
} );

function createClassReferences() {
	Template = modules[ 'ui/template' ];
}
