/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: ui */
/* global HTMLElement */

'use strict';

import testUtils from '/tests/ckeditor5/_utils/utils.js';
import Template from '/ckeditor5/ui/template.js';
import Model from '/ckeditor5/ui/model.js';
import CKEditorError from '/ckeditor5/utils/ckeditorerror.js';
import EmitterMixin from '/ckeditor5/utils/emittermixin.js';
import extend from '/ckeditor5/utils/lib/lodash/extend.js';

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

		it( 'creates a HTMLElement', () => {
			const el = new Template( {
				tag: 'p',
			} ).render();

			expect( el ).to.be.instanceof( HTMLElement );
			expect( el.parentNode ).to.be.null;
			expect( el.outerHTML ).to.be.equal( '<p></p>' );
			expect( el.namespaceURI ).to.be.equal( 'http://www.w3.org/1999/xhtml' );
		} );

		it( 'creates an element in a custom namespace', () => {
			const el = new Template( {
				tag: 'p',
				ns: 'foo'
			} ).render();

			expect( el.namespaceURI ).to.be.equal( 'foo' );
		} );

		it( 'renders HTMLElement attributes', () => {
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
			expect( el.attributes.getNamedItem( 'class' ).namespaceURI ).to.be.null;
		} );

		it( 'renders HTMLElement attributes – empty', () => {
			const el = new Template( {
				tag: 'p',
				attributes: {
					class: '',
					x: [ '', '' ]
				},
				children: [ 'foo' ]
			} ).render();

			expect( el.outerHTML ).to.be.equal( '<p class="" x="">foo</p>' );
		} );

		it( 'renders HTMLElement attributes – falsy values', () => {
			const el = new Template( {
				tag: 'p',
				attributes: {
					class: false,
					x: [ '', null ]
				},
				children: [ 'foo' ]
			} ).render();

			expect( el.outerHTML ).to.be.equal( '<p class="false" x="null">foo</p>' );
		} );

		it( 'renders HTMLElement attributes in a custom namespace', () => {
			const el = new Template( {
				tag: 'p',
				attributes: {
					'class': {
						ns: 'foo',
						value: [ 'a', 'b' ]
					},
					x: {
						ns: 'abc',
						value: 'bar'
					}
				},
				children: [ 'foo' ]
			} ).render();

			expect( el.outerHTML ).to.be.equal( '<p class="a b" x="bar">foo</p>' );
			expect( el.attributes.getNamedItem( 'class' ).namespaceURI ).to.equal( 'foo' );
			expect( el.attributes.getNamedItem( 'x' ).namespaceURI ).to.equal( 'abc' );
		} );

		it( 'creates HTMLElement children', () => {
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

		it( 'activates model bindings – root', () => {
			const observable = new Model( {
				foo: 'bar'
			} );

			const emitter = extend( {}, EmitterMixin );
			const bind = Template.bind( observable, emitter );
			const el = new Template( {
				tag: 'div',
				attributes: {
					class: bind.to( 'foo' )
				}
			} ).render();

			expect( el.getAttribute( 'class' ) ).to.equal( 'bar' );

			observable.foo = 'baz';
			expect( el.getAttribute( 'class' ) ).to.equal( 'baz' );
		} );

		it( 'activates model bindings – children', () => {
			const observable = new Model( {
				foo: 'bar'
			} );

			const emitter = extend( {}, EmitterMixin );
			const bind = Template.bind( observable, emitter );
			const el = new Template( {
				tag: 'div',
				children: [
					{
						tag: 'span',
						children: [
							{
								text: bind.to( 'foo' )
							}
						]
					}
				]
			} ).render();

			expect( el.firstChild.textContent ).to.equal( 'bar' );

			observable.foo = 'baz';
			expect( el.firstChild.textContent ).to.equal( 'baz' );
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
	} );

	describe( 'bind', () => {
		it( 'returns function', () => {
			expect( Template.bind() ).to.be.a( 'function' );
		} );

		it( 'provides "to" and "if" interface', () => {
			const bind = Template.bind();

			expect( bind ).to.have.keys( 'to', 'if' );
			expect( bind.to ).to.be.a( 'function' );
			expect( bind.if ).to.be.a( 'function' );
		} );

		describe( 'event', () => {
		} );

		describe( 'model', () => {
			let observable, emitter, bind;

			beforeEach( () => {
				observable = new Model( {
					foo: 'bar',
					baz: 'qux'
				} );

				emitter = extend( {}, EmitterMixin );
				bind = Template.bind( observable, emitter );
			} );

			describe( 'to', () => {
				it( 'returns an object which describes the binding', () => {
					const spy = testUtils.sinon.spy();
					const binding = bind.to( 'foo', spy );

					expect( spy.called ).to.be.false;
					expect( binding ).to.have.keys( [ 'type', 'observable', 'emitter', 'attribute', 'callback' ] );
					expect( binding.observable ).to.equal( observable );
					expect( binding.callback ).to.equal( spy );
					expect( binding.attribute ).to.equal( 'foo' );
				} );

				it( 'allows binding attribute to the observable – simple (HTMLElement attribute)', () => {
					const element = getElement( {
						tag: 'p',
						attributes: {
							'class': bind.to( 'foo' )
						},
						children: [ 'abc' ]
					} );

					expect( element.outerHTML ).to.equal( '<p class="bar">abc</p>' );

					observable.foo = 'baz';
					expect( element.outerHTML ).to.equal( '<p class="baz">abc</p>' );
					expect( element.attributes.getNamedItem( 'class' ).namespaceURI ).to.be.null;
				} );

				it( 'allows binding attribute to the observable – simple (Text Node)', () => {
					const element = getElement( {
						tag: 'p',
						children: [
							{
								text: bind.to( 'foo' )
							}
						]
					} );

					expect( element.outerHTML ).to.equal( '<p>bar</p>' );

					observable.foo = 'baz';
					expect( element.outerHTML ).to.equal( '<p>baz</p>' );
				} );

				it( 'allows binding attribute to the observable – value processing', () => {
					const callback = value => value > 0 ? 'positive' : 'negative';
					const element = getElement( {
						tag: 'p',
						attributes: {
							'class': bind.to( 'foo', callback )
						},
						children: [
							{
								text: bind.to( 'foo', callback )
							}
						]
					} );

					observable.foo = 3;
					expect( element.outerHTML ).to.equal( '<p class="positive">positive</p>' );

					observable.foo = -7;
					expect( element.outerHTML ).to.equal( '<p class="negative">negative</p>' );
				} );

				it( 'allows binding attribute to the observable – value processing (use Node)', () => {
					const callback = ( value, node ) => {
						return ( !!node.tagName && value > 0 ) ? 'HTMLElement positive' : '';
					};

					const element = getElement( {
						tag: 'p',
						attributes: {
							'class': bind.to( 'foo', callback )
						},
						children: [
							{
								text: bind.to( 'foo', callback )
							}
						]
					} );

					observable.foo = 3;
					expect( element.outerHTML ).to.equal( '<p class="HTMLElement positive"></p>' );

					observable.foo = -7;
					expect( element.outerHTML ).to.equal( '<p></p>' );
				} );

				it( 'allows binding attribute to the observable – custom callback', () => {
					const element = getElement( {
						tag: 'p',
						attributes: {
							'class': bind.to( 'foo', ( value, el ) => {
								el.innerHTML = value;

								if ( value == 'changed' ) {
									return value;
								}
							} )
						}
					} );

					observable.foo = 'moo';
					expect( element.outerHTML ).to.equal( '<p class="undefined">moo</p>' );

					observable.foo = 'changed';
					expect( element.outerHTML ).to.equal( '<p class="changed">changed</p>' );
				} );

				it( 'allows binding attribute to the observable – array of bindings (HTMLElement attribute)', () => {
					const element = getElement( {
						tag: 'p',
						attributes: {
							'class': [
								'ck-class',
								bind.to( 'foo' ),
								bind.to( 'baz' ),
								bind.to( 'foo', value => `foo-is-${value}` ),
								'ck-end'
							]
						},
						children: [ 'abc' ]
					} );

					observable.foo = 'a';
					observable.baz = 'b';
					expect( element.outerHTML ).to.equal( '<p class="ck-class a b foo-is-a ck-end">abc</p>' );

					observable.foo = 'c';
					observable.baz = 'd';
					expect( element.outerHTML ).to.equal( '<p class="ck-class c d foo-is-c ck-end">abc</p>' );
				} );

				it( 'allows binding attribute to the observable – array of bindings (Text Node)', () => {
					const element = getElement( {
						tag: 'p',
						attributes: {
						},
						children: [
							{
								text: [
									'ck-class',
									bind.to( 'foo' ),
									bind.to( 'baz' ),
									bind.to( 'foo', value => `foo-is-${value}` ),
									'ck-end'
								]
							}
						]
					} );

					observable.foo = 'a';
					observable.baz = 'b';
					expect( element.outerHTML ).to.equal( '<p>ck-class a b foo-is-a ck-end</p>' );

					observable.foo = 'c';
					observable.baz = 'd';
					expect( element.outerHTML ).to.equal( '<p>ck-class c d foo-is-c ck-end</p>' );
				} );

				it( 'allows binding attribute to the observable – falsy values', () => {
					const element = getElement( {
						tag: 'p',
						attributes: {
							'class': bind.to( 'foo' )
						},
						children: [ 'abc' ]
					} );

					observable.foo = 'bar';
					expect( element.outerHTML ).to.equal( '<p class="bar">abc</p>' );

					observable.foo = false;
					expect( element.outerHTML ).to.equal( '<p class="false">abc</p>' );

					observable.foo = null;
					expect( element.outerHTML ).to.equal( '<p class="null">abc</p>' );

					observable.foo = undefined;
					expect( element.outerHTML ).to.equal( '<p class="undefined">abc</p>' );

					observable.foo = 0;
					expect( element.outerHTML ).to.equal( '<p class="0">abc</p>' );

					observable.foo = '';
					expect( element.outerHTML ).to.equal( '<p>abc</p>' );
				} );

				it( 'allows binding attribute to the observable – a custom namespace', () => {
					const element = getElement( {
						tag: 'p',
						attributes: {
							'class': {
								ns: 'foo',
								value: bind.to( 'foo' )
							}
						},
						children: [ 'abc' ]
					} );

					observable.foo = 'bar';
					expect( element.outerHTML ).to.equal( '<p class="bar">abc</p>' );
					expect( element.attributes.getNamedItem( 'class' ).namespaceURI ).to.equal( 'foo' );

					observable.foo = 'baz';
					expect( element.outerHTML ).to.equal( '<p class="baz">abc</p>' );
					expect( element.attributes.getNamedItem( 'class' ).namespaceURI ).to.equal( 'foo' );
				} );
			} );

			describe( 'if', () => {
				it( 'returns an object which describes the binding', () => {
					const spy = testUtils.sinon.spy();
					const binding = bind.if( 'foo', 'whenTrue', spy );

					expect( spy.called ).to.be.false;
					expect( binding ).to.have.keys( [ 'type', 'observable', 'emitter', 'attribute', 'callback', 'valueIfTrue' ] );
					expect( binding.observable ).to.equal( observable );
					expect( binding.callback ).to.equal( spy );
					expect( binding.attribute ).to.equal( 'foo' );
					expect( binding.valueIfTrue ).to.equal( 'whenTrue' );
				} );

				it( 'allows binding attribute to the observable – presence of an attribute (HTMLElement attribute)', () => {
					const element = getElement( {
						tag: 'p',
						attributes: {
							'class': bind.if( 'foo' )
						},
						children: [ 'abc' ]
					} );

					observable.foo = true;
					expect( element.outerHTML ).to.equal( '<p class="">abc</p>' );

					observable.foo = false;
					expect( element.outerHTML ).to.equal( '<p>abc</p>' );

					observable.foo = 'bar';
					expect( element.outerHTML ).to.equal( '<p class="">abc</p>' );
				} );

				// TODO: Is this alright? It makes sense but it's pretty useless. Text Node cannot be
				// removed just like an attribute of some HTMLElement.
				it( 'allows binding attribute to the observable – presence of an attribute (Text Node)', () => {
					const element = getElement( {
						tag: 'p',
						children: [
							{
								text: bind.if( 'foo' )
							}
						]
					} );

					observable.foo = true;
					expect( element.outerHTML ).to.equal( '<p></p>' );

					observable.foo = false;
					expect( element.outerHTML ).to.equal( '<p></p>' );

					observable.foo = 'bar';
					expect( element.outerHTML ).to.equal( '<p></p>' );
				} );

				it( 'allows binding attribute to the observable – value of an attribute (HTMLElement attribute)', () => {
					const element = getElement( {
						tag: 'p',
						attributes: {
							'class': bind.if( 'foo', 'bar' )
						},
						children: [ 'abc' ]
					} );

					observable.foo = 'bar';
					expect( element.outerHTML ).to.equal( '<p class="bar">abc</p>' );

					observable.foo = false;
					expect( element.outerHTML ).to.equal( '<p>abc</p>' );

					observable.foo = 64;
					expect( element.outerHTML ).to.equal( '<p class="bar">abc</p>' );
				} );

				it( 'allows binding attribute to the observable – value of an attribute (Text Node)', () => {
					const element = getElement( {
						tag: 'p',
						children: [
							{
								text: bind.if( 'foo', 'bar' )
							}
						]
					} );

					observable.foo = 'bar';
					expect( element.outerHTML ).to.equal( '<p>bar</p>' );

					observable.foo = false;
					expect( element.outerHTML ).to.equal( '<p></p>' );

					observable.foo = 64;
					expect( element.outerHTML ).to.equal( '<p>bar</p>' );
				} );

				it( 'allows binding attribute to the observable – array of bindings (HTMLElement attribute)', () => {
					const element = getElement( {
						tag: 'p',
						attributes: {
							'class': [
								'ck-class',
								bind.if( 'foo', 'foo-set' ),
								bind.if( 'bar', 'bar-not-set', ( value ) => !value ),
								'ck-end'
							]
						},
						children: [ 'abc' ]
					} );

					observable.foo = observable.bar = true;
					expect( element.outerHTML ).to.equal( '<p class="ck-class foo-set ck-end">abc</p>' );

					observable.foo = observable.bar = false;
					expect( element.outerHTML ).to.equal( '<p class="ck-class bar-not-set ck-end">abc</p>' );
				} );

				it( 'allows binding attribute to the observable – value of an attribute processed by a callback', () => {
					const element = getElement( {
						tag: 'p',
						attributes: {
							'class': bind.if( 'foo', 'there–is–no–foo', value => !value )
						},
						children: [ 'abc' ]
					} );

					observable.foo = 'bar';
					expect( element.outerHTML ).to.equal( '<p>abc</p>' );

					observable.foo = false;
					expect( element.outerHTML ).to.equal( '<p class="there–is–no–foo">abc</p>' );

					observable.foo = 64;
					expect( element.outerHTML ).to.equal( '<p>abc</p>' );
				} );

				it( 'allows binding attribute to the observable – value of an attribute processed by a callback (use Node)', () => {
					const element = getElement( {
						tag: 'p',
						attributes: {
							'class': bind.if( 'foo', 'eqls-tag-name', ( value, el ) => el.tagName === value )
						},
						children: [ 'abc' ]
					} );

					observable.foo = 'bar';
					expect( element.outerHTML ).to.equal( '<p>abc</p>' );

					observable.foo = 'P';
					expect( element.outerHTML ).to.equal( '<p class="eqls-tag-name">abc</p>' );

					observable.foo = 64;
					expect( element.outerHTML ).to.equal( '<p>abc</p>' );
				} );

				it( 'allows binding attribute to the observable – falsy values', () => {
					const element = getElement( {
						tag: 'p',
						attributes: {
							'class': bind.if( 'foo', 'foo-is-set' )
						},
						children: [ 'abc' ]
					} );

					observable.foo = 'bar';
					expect( element.outerHTML ).to.equal( '<p class="foo-is-set">abc</p>' );

					observable.foo = false;
					expect( element.outerHTML ).to.equal( '<p>abc</p>' );

					observable.foo = null;
					expect( element.outerHTML ).to.equal( '<p>abc</p>' );

					observable.foo = undefined;
					expect( element.outerHTML ).to.equal( '<p>abc</p>' );

					observable.foo = '';
					expect( element.outerHTML ).to.equal( '<p>abc</p>' );

					observable.foo = 0;
					expect( element.outerHTML ).to.equal( '<p>abc</p>' );
				} );
			} );

			it( 'works with Template#apply() – root element', () => {
				new Template( {
					tag: 'div',
					attributes: {
						class: bind.to( 'foo' )
					}
				} ).apply( el );

				expect( el.getAttribute( 'class' ) ).to.equal( 'bar' );

				observable.foo = 'baz';
				expect( el.getAttribute( 'class' ) ).to.equal( 'baz' );
			} );

			it( 'works with Template#apply() – children', () => {
				const el = document.createElement( 'div' );
				const child = document.createElement( 'span' );

				child.textContent = 'foo';
				el.appendChild( child );

				new Template( {
					tag: 'div',
					children: [
						{
							tag: 'span',
							children: [
								{
									text: bind.to( 'foo' )
								}
							]
						}
					]
				} ).apply( el );

				expect( child.textContent ).to.equal( 'bar' );

				observable.foo = 'baz';
				expect( child.textContent ).to.equal( 'baz' );
			} );
		} );
	} );
} );

function getElement( template ) {
	return new Template( template ).render();
}
