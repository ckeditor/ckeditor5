/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: ui */
/* global HTMLElement */

'use strict';

import testUtils from '/tests/_utils/utils.js';
import Template from '/ckeditor5/core/ui/template.js';
import CKEditorError from '/ckeditor5/core/ckeditorerror.js';

testUtils.createSinonSandbox();

let el, text;

describe( 'Template', () => {
	describe( 'constructor', () => {
		it( 'accepts the definition', () => {
			const def = {
				tag: 'p'
			};

			expect( new Template( def ).definition ).to.equal( def );
		} );
	} );

	describe( 'render', () => {
		it( 'throws when wrong template definition', () => {
			expect( () => {
				new Template( {} ).render();
			} ).to.throw( CKEditorError, /ui-template-wrong-syntax/ );

			expect( () => {
				new Template( {
					tag: 'p',
					text: 'foo'
				} ).render();
			} ).to.throw( CKEditorError, /ui-template-wrong-syntax/ );
		} );

		it( 'creates a HTMLElement with attributes', () => {
			const el = new Template( {
				tag: 'p',
				attributes: {
					'class': [ 'a', 'b' ],
					x: 'bar'
				},
				children: [ 'foo' ]
			} ).render();

			expect( el ).to.be.instanceof( HTMLElement );
			expect( el.parentNode ).to.be.null;
			expect( el.outerHTML ).to.be.equal( '<p class="a b" x="bar">foo</p>' );
		} );

		it( 'creates HTMLElement\'s children', () => {
			const el = new Template( {
				tag: 'p',
				attributes: {
					a: 'A'
				},
				children: [
					{
						tag: 'b',
						children: [ 'B' ]
					},
					{
						tag: 'i',
						children: [
							'C',
							{
								tag: 'b',
								children: [ 'D' ]
							}
						]
					}
				]
			} ).render();

			expect( el.outerHTML ).to.be.equal( '<p a="A"><b>B</b><i>C<b>D</b></i></p>' );
		} );

		it( 'creates a Text node', () => {
			const node = new Template( { text: 'foo' } ).render();

			expect( node.nodeType ).to.be.equal( 3 );
			expect( node.textContent ).to.be.equal( 'foo' );
		} );

		it( 'creates a child Text Node (different syntaxes)', () => {
			const el = new Template( {
				tag: 'p',
				children: [
					'foo',
					{ text: 'bar' }
				]
			} ).render();

			expect( el.outerHTML ).to.be.equal( '<p>foobar</p>' );
		} );

		it( 'creates multiple child Text Nodes', () => {
			const el = new Template( {
				tag: 'p',
				children: [ 'a', 'b', { text: 'c' }, 'd' ]
			} ).render();

			expect( el.childNodes ).to.have.length( 4 );
			expect( el.outerHTML ).to.be.equal( '<p>abcd</p>' );
		} );

		it( 'activates listener attachers – root', () => {
			const spy1 = testUtils.sinon.spy();
			const spy2 = testUtils.sinon.spy();
			const spy3 = testUtils.sinon.spy();

			const el = new Template( {
				tag: 'p',
				on: {
					_listenerAttachers: {
						foo: spy1,
						baz: [ spy2, spy3 ]
					}
				}
			} ).render();

			sinon.assert.calledWithExactly( spy1, el, 'foo', null );
			sinon.assert.calledWithExactly( spy2, el, 'baz', null );
			sinon.assert.calledWithExactly( spy3, el, 'baz', null );
		} );

		it( 'activates listener attachers – children', () => {
			const spy = testUtils.sinon.spy();
			const el = new Template( {
				tag: 'p',
				children: [
					{
						tag: 'span',
						on: {
							_listenerAttachers: {
								bar: spy
							}
						}
					}
				],
			} ).render();

			sinon.assert.calledWithExactly( spy, el.firstChild, 'bar', null );
		} );

		it( 'activates listener attachers – DOM selectors', () => {
			const spy1 = testUtils.sinon.spy();
			const spy2 = testUtils.sinon.spy();
			const spy3 = testUtils.sinon.spy();
			const spy4 = testUtils.sinon.spy();

			const el = new Template( {
				tag: 'p',
				children: [
					{
						tag: 'span',
						attributes: {
							'id': 'x'
						}
					},
					{
						tag: 'span',
						attributes: {
							'class': 'y'
						},
						on: {
							_listenerAttachers: {
								'bar@p': spy2
							}
						}
					},
				],
				on: {
					_listenerAttachers: {
						'foo@span': spy1,
						'baz@.y': [ spy3, spy4 ]
					}
				}
			} ).render();

			sinon.assert.calledWithExactly( spy1, el, 'foo', 'span' );
			sinon.assert.calledWithExactly( spy2, el.lastChild, 'bar', 'p' );
			sinon.assert.calledWithExactly( spy3, el, 'baz', '.y' );
			sinon.assert.calledWithExactly( spy4, el, 'baz', '.y' );
		} );

		it( 'activates model bindings – attributes', () => {
			const spy1 = testUtils.sinon.spy();
			const spy2 = testUtils.sinon.spy();

			const el = new Template( {
				tag: 'p',
				attributes: {
					'class': spy1
				},
				children: [
					{
						tag: 'span',
						attributes: {
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

		it( 'activates model bindings – Text Node', () => {
			const spy1 = testUtils.sinon.spy();
			const spy2 = testUtils.sinon.spy();

			const el = new Template( {
				tag: 'p',
				children: [
					{
						text: spy1
					},
					{
						tag: 'span',
						children: [
							{
								text: spy2
							}
						]
					}
				]
			} ).render();

			sinon.assert.calledWithExactly( spy1, el.firstChild, sinon.match.func );
			sinon.assert.calledWithExactly( spy2, el.lastChild.firstChild, sinon.match.func );

			spy2.firstCall.args[ 1 ]( el.lastChild.firstChild, 'bar' );
			expect( el.outerHTML ).to.be.equal( '<p><span>bar</span></p>' );

			spy1.firstCall.args[ 1 ]( el.firstChild, 'foo' );
			expect( el.outerHTML ).to.be.equal( '<p>foo<span>bar</span></p>' );
		} );
	} );

	describe( 'apply', () => {
		beforeEach( () => {
			el = document.createElement( 'div' );
			text = document.createTextNode( '' );
		} );

		it( 'throws when wrong template definition', () => {
			expect( () => {
				new Template( {
					tag: 'p',
					text: 'foo'
				} ).apply( el );
			} ).to.throw( CKEditorError, /ui-template-wrong-syntax/ );
		} );

		it( 'throws when no HTMLElement passed', () => {
			expect( () => {
				new Template( {
					tag: 'p'
				} ).apply();
			} ).to.throw( CKEditorError, /ui-template-wrong-node/ );
		} );

		it( 'accepts empty template definition', () => {
			new Template( {} ).apply( el );
			new Template( {} ).apply( text );

			expect( el.outerHTML ).to.be.equal( '<div></div>' );
			expect( text.textContent ).to.be.equal( '' );
		} );

		it( 'applies textContent to a Text Node', () => {
			new Template( {
				text: 'abc'
			} ).apply( text );

			expect( text.textContent ).to.be.equal( 'abc' );
		} );

		it( 'applies attributes to an HTMLElement', () => {
			new Template( {
				tag: 'div',
				attributes: {
					'class': [ 'a', 'b' ],
					x: 'bar'
				}
			} ).apply( el );

			expect( el.outerHTML ).to.be.equal( '<div class="a b" x="bar"></div>' );
		} );

		it( 'applies doesn\'t apply new child to an HTMLElement – Text Node', () => {
			new Template( {
				tag: 'div',
				children: [ 'foo' ]
			} ).apply( el );

			expect( el.outerHTML ).to.be.equal( '<div></div>' );
		} );

		it( 'applies doesn\'t apply new child to an HTMLElement – HTMLElement', () => {
			new Template( {
				tag: 'div',
				children: [
					{
						tag: 'span'
					}
				]
			} ).apply( el );

			expect( el.outerHTML ).to.be.equal( '<div></div>' );
		} );

		it( 'applies new textContent to an existing Text Node of an HTMLElement', () => {
			el.textContent = 'bar';

			new Template( {
				tag: 'div',
				children: [ 'foo' ]
			} ).apply( el );

			expect( el.outerHTML ).to.be.equal( '<div>foo</div>' );
		} );

		it( 'applies attributes and TextContent to a DOM tree', () => {
			el.textContent = 'abc';
			el.appendChild( document.createElement( 'span' ) );

			new Template( {
				tag: 'div',
				attributes: {
					'class': 'parent'
				},
				children: [
					'Children: ',
					{
						tag: 'span',
						attributes: {
							class: 'child'
						}
					}
				]
			} ).apply( el );

			expect( el.outerHTML ).to.be.equal( '<div class="parent">Children: <span class="child"></span></div>' );
		} );

		it( 'activates listener attachers – root', () => {
			const spy = testUtils.sinon.spy();

			new Template( {
				tag: 'div',
				on: {
					_listenerAttachers: {
						click: spy
					}
				}
			} ).apply( el );

			sinon.assert.calledWithExactly( spy, el, 'click', null );
		} );

		it( 'activates listener attachers – children', () => {
			const spy = testUtils.sinon.spy();
			el.appendChild( document.createElement( 'span' ) );

			new Template( {
				tag: 'div',
				children: [
					{
						tag: 'span',
						on: {
							_listenerAttachers: {
								click: spy
							}
						}
					}
				]
			} ).apply( el );

			sinon.assert.calledWithExactly( spy, el.firstChild, 'click', null );
		} );

		it( 'activates model bindings – root', () => {
			const spy = testUtils.sinon.spy();

			new Template( {
				tag: 'div',
				attributes: {
					class: spy
				}
			} ).apply( el );

			sinon.assert.calledWithExactly( spy, el, sinon.match.func );
		} );

		it( 'activates model bindings – children', () => {
			const spy = testUtils.sinon.spy();
			el.appendChild( document.createElement( 'span' ) );

			new Template( {
				tag: 'div',
				children: [
					{
						tag: 'span',
						attributes: {
							class: spy
						}
					}
				]
			} ).apply( el );

			sinon.assert.calledWithExactly( spy, el.firstChild, sinon.match.func );
		} );
	} );
} );
