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

describe( 'Template', () => {
	describe( 'constructor', () => {
		it( 'accepts the definition', () => {
			let def = {
				tag: 'p'
			};

			expect( new Template( def ).definition ).to.equal( def );
		} );
	} );

	describe( 'render', () => {
		it( 'throws when wrong template definition', () => {
			expect( () => {
				new Template().render();
			} ).to.throw( CKEditorError, /ui-template-wrong-syntax/ );

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

		it( 'creates a HTMLElement', () => {
			let el = new Template( {
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
			let el = new Template( {
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
			let node = new Template( { text: 'foo' } ).render();

			expect( node.nodeType ).to.be.equal( 3 );
			expect( node.textContent ).to.be.equal( 'foo' );
		} );

		it( 'creates a child Text Node (different syntaxes)', () => {
			let el = new Template( {
				tag: 'p',
				children: [
					'foo',
					{ text: 'bar' }
				]
			} ).render();

			expect( el.outerHTML ).to.be.equal( '<p>foobar</p>' );
		} );

		it( 'creates multiple child Text Nodes', () => {
			let el = new Template( {
				tag: 'p',
				children: [ 'a', 'b', { text: 'c' }, 'd' ]
			} ).render();

			expect( el.childNodes ).to.have.length( 4 );
			expect( el.outerHTML ).to.be.equal( '<p>abcd</p>' );
		} );

		describe( 'callback', () => {
			it( 'works for attributes', () => {
				let spy1 = testUtils.sinon.spy();
				let spy2 = testUtils.sinon.spy();

				let el = new Template( {
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

			it( 'works for "text" property', () => {
				let spy1 = testUtils.sinon.spy();
				let spy2 = testUtils.sinon.spy();

				let el = new Template( {
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

			it( 'works for "on" property', () => {
				let spy1 = testUtils.sinon.spy();
				let spy2 = testUtils.sinon.spy();
				let spy3 = testUtils.sinon.spy();
				let spy4 = testUtils.sinon.spy();

				let el = new Template( {
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

			it( 'works for "on" property with selectors', () => {
				let spy1 = testUtils.sinon.spy();
				let spy2 = testUtils.sinon.spy();
				let spy3 = testUtils.sinon.spy();
				let spy4 = testUtils.sinon.spy();

				let el = new Template( {
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
	} );
} );
