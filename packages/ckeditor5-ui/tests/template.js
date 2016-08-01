/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: ui */
/* global HTMLElement */

import testUtils from '/tests/ckeditor5/_utils/utils.js';
import Template from '/ckeditor5/ui/template.js';
import Model from '/ckeditor5/ui/model.js';
import CKEditorError from '/ckeditor5/utils/ckeditorerror.js';
import EmitterMixin from '/ckeditor5/utils/emittermixin.js';
import DOMEmitterMixin from '/ckeditor5/ui/domemittermixin.js';

testUtils.createSinonSandbox();

let el, text;

describe( 'Template', () => {
	describe( 'constructor', () => {
		it( 'accepts template definition', () => {
			const def = {
				tag: 'p'
			};

			expect( new Template( def ).definition ).to.not.equal( def );
			expect( new Template( def ).definition.tag ).to.equal( 'p' );
		} );

		it( 'normalizes template definition', () => {
			const bind = Template.bind( new Model( {} ), Object.create( DOMEmitterMixin ) );
			const tpl = new Template( {
				tag: 'p',
				attributes: {
					a: 'foo',
					b: [ 'bar', 'baz' ],
					c: {
						ns: 'abc',
						value: bind.to( 'qux' )
					}
				},
				children: [
					{
						text: 'content'
					},
					{
						text: bind.to( 'x' )
					},
					'abc',
					{
						text: [ 'a', 'b' ]
					}
				],
				on: {
					'a@span': bind.to( 'b' ),
					'b@span': bind.to( () => {} ),
					'c@span': [
						bind.to( 'c' ),
						bind.to( () => {} )
					]
				}
			} );

			const def = tpl.definition;

			expect( def.attributes.a[ 0 ] ).to.equal( 'foo' );
			expect( def.attributes.b[ 0 ] ).to.equal( 'bar' );
			expect( def.attributes.b[ 1 ] ).to.equal( 'baz' );
			expect( def.attributes.c[ 0 ].value[ 0 ].type ).to.be.a( 'symbol' );

			expect( def.children[ 0 ].text[ 0 ] ).to.equal( 'content' );
			expect( def.children[ 1 ].text[ 0 ].type ).to.be.a( 'symbol' );
			expect( def.children[ 2 ].text[ 0 ] ).to.equal( 'abc' );
			expect( def.children[ 3 ].text[ 0 ] ).to.equal( 'a' );
			expect( def.children[ 3 ].text[ 1 ] ).to.equal( 'b' );

			expect( def.on[ 'a@span' ][ 0 ].type ).to.be.a( 'symbol' );
			expect( def.on[ 'b@span' ][ 0 ].type ).to.be.a( 'symbol' );
			expect( def.on[ 'c@span' ][ 0 ].type ).to.be.a( 'symbol' );
			expect( def.on[ 'c@span' ][ 1 ].type ).to.be.a( 'symbol' );
		} );

		it( 'does not modify passed definition', () => {
			const def = {
				tag: 'p',
				attributes: {
					a: 'foo',
				},
				children: [
					{
						tag: 'span'
					}
				]
			};
			const tpl = new Template( def );

			expect( def ).to.not.equal( tpl.definition );
			expect( def.attributes ).to.not.equal( tpl.definition.attributes );
			expect( def.children ).to.not.equal( tpl.definition.children );
			expect( def.children[ 0 ] ).to.not.equal( tpl.definition.children[ 0 ] );

			expect( tpl.definition.attributes.a[ 0 ] ).to.equal( 'foo' );
			expect( def.attributes.a ).to.equal( 'foo' );
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

		it( 'creates HTMLElement', () => {
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

			expect( el.outerHTML ).to.be.equal( '<p>foo</p>' );
		} );

		it( 'renders HTMLElement attributes – falsy values', () => {
			const el = new Template( {
				tag: 'p',
				attributes: {
					class: false,
					x: [ '', null, undefined, false ],
					y: [ 'foo', null, undefined, false ]
				},
				children: [ 'foo' ]
			} ).render();

			expect( el.outerHTML ).to.be.equal( '<p y="foo">foo</p>' );
		} );

		it( 'renders HTMLElement attributes in a custom namespace', () => {
			const el = new Template( {
				tag: 'p',
				attributes: {
					class: {
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
				children: [
					'a',
					'b',
					{ text: 'c' },
					'd',
					{ text: [ 'e', 'f' ] }
				]
			} ).render();

			expect( el.childNodes ).to.have.length( 5 );
			expect( el.outerHTML ).to.be.equal( '<p>abcdef</p>' );
		} );

		it( 'activates model bindings – root', () => {
			const observable = new Model( {
				foo: 'bar'
			} );

			const emitter = Object.create( EmitterMixin );
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

			const emitter = Object.create( EmitterMixin );
			const bind = Template.bind( observable, emitter );
			const el = new Template( {
				tag: 'div',
				children: [
					{
						tag: 'span',
						children: [
							{
								text: [
									bind.to( 'foo' ),
									'static'
								]
							}
						]
					}
				]
			} ).render();

			expect( el.firstChild.textContent ).to.equal( 'bar static' );

			observable.foo = 'baz';
			expect( el.firstChild.textContent ).to.equal( 'baz static' );
		} );

		describe( 'style attribute', () => {
			let observable, emitter, bind;

			beforeEach( () => {
				observable = new Model( {
					width: '10px',
					backgroundColor: 'yellow'
				} );

				emitter = Object.create( EmitterMixin );
				bind = Template.bind( observable, emitter );
			} );

			it( 'renders as a static value', () => {
				setElement( {
					tag: 'p',
					attributes: {
						style: 'color: red'
					}
				} );

				expect( el.outerHTML ).to.equal( '<p style="color: red"></p>' );
			} );

			it( 'renders as a static value (Array of values)', () => {
				setElement( {
					tag: 'p',
					attributes: {
						style: [ 'color: red;', 'display: block;' ]
					}
				} );

				expect( el.outerHTML ).to.equal( '<p style="color: red; display: block;"></p>' );
			} );

			it( 'renders as a value bound to the model', () => {
				setElement( {
					tag: 'p',
					attributes: {
						style: bind.to( 'width', w => `width: ${ w }` )
					}
				} );

				expect( el.outerHTML ).to.equal( '<p style="width: 10px"></p>' );

				observable.width = '1em';

				expect( el.outerHTML ).to.equal( '<p style="width: 1em"></p>' );
			} );

			it( 'renders as a value bound to the model (Array of bindings)', () => {
				setElement( {
					tag: 'p',
					attributes: {
						style: [
							bind.to( 'width', w => `width: ${ w };` ),
							bind.to( 'backgroundColor', c => `background-color: ${ c };` )
						]
					}
				} );

				expect( el.outerHTML ).to.equal( '<p style="width: 10px; background-color: yellow;"></p>' );

				observable.width = '1em';

				expect( el.outerHTML ).to.equal( '<p style="width: 1em; background-color: yellow;"></p>' );
			} );

			describe( 'object', () => {
				it( 'renders with static and bound attributes', () => {
					setElement( {
						tag: 'p',
						attributes: {
							style: {
								width: bind.to( 'width' ),
								height: '10px',
								backgroundColor: bind.to( 'backgroundColor' )
							}
						}
					} );

					expect( el.outerHTML ).to.equal( '<p style="width: 10px; height: 10px; background-color: yellow;"></p>' );

					observable.width = '20px';
					observable.backgroundColor = 'green';

					expect( el.outerHTML ).to.equal( '<p style="width: 20px; height: 10px; background-color: green;"></p>' );
				} );

				it( 'renders with empty string attributes', () => {
					setElement( {
						tag: 'p',
						attributes: {
							style: {
								width: '',
								backgroundColor: bind.to( 'backgroundColor' )
							}
						}
					} );

					expect( el.outerHTML ).to.be.equal( '<p style="background-color: yellow;"></p>' );

					observable.backgroundColor = '';

					expect( el.outerHTML ).to.be.equal( '<p></p>' );
				} );

				it( 'renders with falsy values', () => {
					setElement( {
						tag: 'p',
						attributes: {
							style: {
								width: null,
								height: false,
								color: undefined
							}
						}
					} );

					expect( el.outerHTML ).to.be.equal( '<p></p>' );
				} );
			} );
		} );
	} );

	describe( 'apply', () => {
		let observable, domEmitter, bind;

		beforeEach( () => {
			el = document.createElement( 'div' );
			text = document.createTextNode( '' );

			observable = new Model( {
				foo: 'bar',
				baz: 'qux'
			} );

			domEmitter = Object.create( DOMEmitterMixin );
			bind = Template.bind( observable, domEmitter );
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

		it( 'doesn\'t apply new child to an HTMLElement – Text Node', () => {
			new Template( {
				tag: 'div',
				children: [ 'foo' ]
			} ).apply( el );

			expect( el.outerHTML ).to.be.equal( '<div></div>' );
		} );

		it( 'doesn\'t apply new child to an HTMLElement – HTMLElement', () => {
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

		it( 'should work for deep DOM structure', () => {
			const childA = document.createElement( 'a' );
			const childB = document.createElement( 'b' );

			childA.textContent = 'anchor';
			childB.textContent = 'bold';

			el.appendChild( childA );
			el.appendChild( childB );

			expect( el.outerHTML ).to.equal( '<div><a>anchor</a><b>bold</b></div>' );

			const spy1 = testUtils.sinon.spy();
			const spy2 = testUtils.sinon.spy();
			const spy3 = testUtils.sinon.spy();

			observable.on( 'ku', spy1 );
			observable.on( 'kd', spy2 );
			observable.on( 'mo', spy3 );

			new Template( {
				tag: 'div',
				children: [
					{
						tag: 'a',
						on: {
							keyup: bind.to( 'ku' )
						},
						attributes: {
							class: bind.to( 'foo', val => 'applied-A-' + val ),
							id: 'applied-A'
						},
						children: [ 'Text applied to childA.' ]
					},
					{
						tag: 'b',
						on: {
							keydown: bind.to( 'kd' )
						},
						attributes: {
							class: bind.to( 'baz', val => 'applied-B-' + val ),
							id: 'applied-B'
						},
						children: [ 'Text applied to childB.' ]
					},
					'Text which is not to be applied because it does NOT exist in original element.'
				],
				on: {
					'mouseover@a': bind.to( 'mo' )
				},
				attributes: {
					id: bind.to( 'foo', val => val.toUpperCase() ),
					class: bind.to( 'baz', val => 'applied-parent-' + val )
				}
			} ).apply( el );

			expect( el.outerHTML ).to.equal( '<div id="BAR" class="applied-parent-qux">' +
				'<a class="applied-A-bar" id="applied-A">Text applied to childA.</a>' +
				'<b class="applied-B-qux" id="applied-B">Text applied to childB.</b>' +
			'</div>' );

			observable.foo = 'updated';

			expect( el.outerHTML ).to.equal( '<div id="UPDATED" class="applied-parent-qux">' +
				'<a class="applied-A-updated" id="applied-A">Text applied to childA.</a>' +
				'<b class="applied-B-qux" id="applied-B">Text applied to childB.</b>' +
			'</div>' );

			document.body.appendChild( el );

			// Test "mouseover@a".
			dispatchEvent( el, 'mouseover' );
			dispatchEvent( childA, 'mouseover' );

			// Test "keyup".
			dispatchEvent( childA, 'keyup' );

			// Test "keydown".
			dispatchEvent( childB, 'keydown' );

			sinon.assert.calledOnce( spy1 );
			sinon.assert.calledOnce( spy2 );
			sinon.assert.calledOnce( spy3 );
		} );
	} );

	describe( 'bind', () => {
		it( 'returns object', () => {
			expect( Template.bind() ).to.be.an( 'object' );
		} );

		it( 'provides "to" and "if" interface', () => {
			const bind = Template.bind();

			expect( bind ).to.have.keys( 'to', 'if' );
			expect( bind.to ).to.be.a( 'function' );
			expect( bind.if ).to.be.a( 'function' );
		} );

		describe( 'event', () => {
			let observable, domEmitter, bind;

			beforeEach( () => {
				observable = new Model( {
					foo: 'bar',
					baz: 'qux'
				} );

				domEmitter = Object.create( DOMEmitterMixin );
				bind = Template.bind( observable, domEmitter );
			} );

			it( 'accepts plain binding', () => {
				const spy = testUtils.sinon.spy();

				setElement( {
					tag: 'p',
					on: {
						x: bind.to( 'a' ),
					}
				} );

				observable.on( 'a', spy );
				dispatchEvent( el, 'x' );

				sinon.assert.calledWithExactly( spy,
					sinon.match.has( 'name', 'a' ),
					sinon.match.has( 'target', el )
				);
			} );

			it( 'accepts an array of event bindings', () => {
				const spy1 = testUtils.sinon.spy();
				const spy2 = testUtils.sinon.spy();

				setElement( {
					tag: 'p',
					on: {
						x: [
							bind.to( 'a' ),
							bind.to( 'b' )
						]
					}
				} );

				observable.on( 'a', spy1 );
				observable.on( 'b', spy2 );
				dispatchEvent( el, 'x' );

				sinon.assert.calledWithExactly( spy1,
					sinon.match.has( 'name', 'a' ),
					sinon.match.has( 'target', el )
				);
				sinon.assert.calledWithExactly( spy2,
					sinon.match.has( 'name', 'b' ),
					sinon.match.has( 'target', el )
				);
			} );

			it( 'accepts DOM selectors', () => {
				const spy1 = testUtils.sinon.spy();
				const spy2 = testUtils.sinon.spy();
				const spy3 = testUtils.sinon.spy();

				setElement( {
					tag: 'p',
					children: [
						{
							tag: 'span',
							attributes: {
								'class': 'y',
							},
							on: {
								'test@p': bind.to( 'c' )
							}
						},
						{
							tag: 'div',
							children: [
								{
									tag: 'span',
									attributes: {
										'class': 'y',
									}
								}
							],
						}
					],
					on: {
						'test@.y': bind.to( 'a' ),
						'test@div': bind.to( 'b' )
					}
				} );

				observable.on( 'a', spy1 );
				observable.on( 'b', spy2 );
				observable.on( 'c', spy3 );

				// Test "test@p".
				dispatchEvent( el, 'test' );

				sinon.assert.callCount( spy1, 0 );
				sinon.assert.callCount( spy2, 0 );
				sinon.assert.callCount( spy3, 0 );

				// Test "test@.y".
				dispatchEvent( el.firstChild, 'test' );

				expect( spy1.firstCall.calledWithExactly(
					sinon.match.has( 'name', 'a' ),
					sinon.match.has( 'target', el.firstChild )
				) ).to.be.true;

				sinon.assert.callCount( spy2, 0 );
				sinon.assert.callCount( spy3, 0 );

				// Test "test@div".
				dispatchEvent( el.lastChild, 'test' );

				sinon.assert.callCount( spy1, 1 );

				expect( spy2.firstCall.calledWithExactly(
					sinon.match.has( 'name', 'b' ),
					sinon.match.has( 'target', el.lastChild )
				) ).to.be.true;

				sinon.assert.callCount( spy3, 0 );

				// Test "test@.y".
				dispatchEvent( el.lastChild.firstChild, 'test' );

				expect( spy1.secondCall.calledWithExactly(
					sinon.match.has( 'name', 'a' ),
					sinon.match.has( 'target', el.lastChild.firstChild )
				) ).to.be.true;

				sinon.assert.callCount( spy2, 1 );
				sinon.assert.callCount( spy3, 0 );
			} );

			it( 'accepts function callbacks', () => {
				const spy1 = testUtils.sinon.spy();
				const spy2 = testUtils.sinon.spy();

				setElement( {
					tag: 'p',
					children: [
						{
							tag: 'span'
						}
					],
					on: {
						x: bind.to( spy1 ),
						'y@span': [
							bind.to( spy2 ),
							bind.to( 'c' )
						]
					}
				} );

				dispatchEvent( el, 'x' );
				dispatchEvent( el.firstChild, 'y' );

				sinon.assert.calledWithExactly( spy1,
					sinon.match.has( 'target', el )
				);

				sinon.assert.calledWithExactly( spy2,
					sinon.match.has( 'target', el.firstChild )
				);
			} );

			it( 'supports event delegation', () => {
				const spy = testUtils.sinon.spy();

				setElement( {
					tag: 'p',
					children: [
						{
							tag: 'span'
						}
					],
					on: {
						x: bind.to( 'a' ),
					}
				} );

				observable.on( 'a', spy );

				dispatchEvent( el.firstChild, 'x' );
				sinon.assert.calledWithExactly( spy,
					sinon.match.has( 'name', 'a' ),
					sinon.match.has( 'target', el.firstChild )
				);
			} );

			it( 'works for future elements', () => {
				const spy = testUtils.sinon.spy();

				setElement( {
					tag: 'p',
					on: {
						'test@div': bind.to( 'a' )
					}
				} );

				observable.on( 'a', spy );

				const div = document.createElement( 'div' );
				el.appendChild( div );

				dispatchEvent( div, 'test' );
				sinon.assert.calledWithExactly( spy, sinon.match.has( 'name', 'a' ), sinon.match.has( 'target', div ) );
			} );
		} );

		describe( 'model', () => {
			let observable, emitter, bind;

			beforeEach( () => {
				observable = new Model( {
					foo: 'bar',
					baz: 'qux'
				} );

				emitter = Object.create( EmitterMixin );
				bind = Template.bind( observable, emitter );
			} );

			describe( 'to', () => {
				it( 'returns an object which describes the binding', () => {
					const spy = testUtils.sinon.spy();
					const binding = bind.to( 'foo', spy );

					expect( spy.called ).to.be.false;
					expect( binding ).to.have.keys( [ 'type', 'observable', 'eventNameOrFunction', 'emitter', 'attribute', 'callback' ] );
					expect( binding.observable ).to.equal( observable );
					expect( binding.callback ).to.equal( spy );
					expect( binding.attribute ).to.equal( 'foo' );
				} );

				it( 'allows binding attribute to the observable – simple (HTMLElement attribute)', () => {
					setElement( {
						tag: 'p',
						attributes: {
							'class': bind.to( 'foo' )
						},
						children: [ 'abc' ]
					} );

					expect( el.outerHTML ).to.equal( '<p class="bar">abc</p>' );

					observable.foo = 'baz';
					expect( el.outerHTML ).to.equal( '<p class="baz">abc</p>' );
					expect( el.attributes.getNamedItem( 'class' ).namespaceURI ).to.be.null;
				} );

				it( 'allows binding attribute to the observable – simple (Text Node)', () => {
					setElement( {
						tag: 'p',
						children: [
							{
								text: bind.to( 'foo' )
							}
						]
					} );

					expect( el.outerHTML ).to.equal( '<p>bar</p>' );

					observable.foo = 'baz';
					expect( el.outerHTML ).to.equal( '<p>baz</p>' );
				} );

				it( 'allows binding attribute to the observable – value processing', () => {
					const callback = value => value > 0 ? 'positive' : 'negative';
					setElement( {
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
					expect( el.outerHTML ).to.equal( '<p class="positive">positive</p>' );

					observable.foo = -7;
					expect( el.outerHTML ).to.equal( '<p class="negative">negative</p>' );
				} );

				it( 'allows binding attribute to the observable – value processing (use Node)', () => {
					const callback = ( value, node ) => {
						return ( !!node.tagName && value > 0 ) ? 'HTMLElement positive' : '';
					};

					setElement( {
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
					expect( el.outerHTML ).to.equal( '<p class="HTMLElement positive"></p>' );

					observable.foo = -7;
					expect( el.outerHTML ).to.equal( '<p></p>' );
				} );

				it( 'allows binding attribute to the observable – custom callback', () => {
					setElement( {
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
					expect( el.outerHTML ).to.equal( '<p>moo</p>' );

					observable.foo = 'changed';
					expect( el.outerHTML ).to.equal( '<p class="changed">changed</p>' );
				} );

				it( 'allows binding attribute to the observable – array of bindings (HTMLElement attribute)', () => {
					setElement( {
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
					expect( el.outerHTML ).to.equal( '<p class="ck-class a b foo-is-a ck-end">abc</p>' );

					observable.foo = 'c';
					observable.baz = 'd';
					expect( el.outerHTML ).to.equal( '<p class="ck-class c d foo-is-c ck-end">abc</p>' );
				} );

				it( 'allows binding attribute to the observable – array of bindings (Text Node)', () => {
					setElement( {
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
					expect( el.outerHTML ).to.equal( '<p>ck-class a b foo-is-a ck-end</p>' );

					observable.foo = 'c';
					observable.baz = 'd';
					expect( el.outerHTML ).to.equal( '<p>ck-class c d foo-is-c ck-end</p>' );
				} );

				it( 'allows binding attribute to the observable – falsy values', () => {
					setElement( {
						tag: 'p',
						attributes: {
							simple: bind.to( 'foo' ),
							complex: [ null, bind.to( 'foo' ), undefined, false ],
							zero: [ 0, bind.to( 'foo' ) ],
							emptystring: [ '', bind.to( 'foo' ) ]
						},
						children: [ 'abc' ]
					} );

					observable.foo = 'bar';
					expect( el.outerHTML ).to.equal( '<p simple="bar" complex="bar" zero="0 bar" emptystring="bar">abc</p>' );

					observable.foo = 0;
					expect( el.outerHTML ).to.equal( '<p simple="0" complex="0" zero="0 0" emptystring="0">abc</p>' );

					observable.foo = false;
					expect( el.outerHTML ).to.equal( '<p zero="0">abc</p>' );

					observable.foo = null;
					expect( el.outerHTML ).to.equal( '<p zero="0">abc</p>' );

					observable.foo = undefined;
					expect( el.outerHTML ).to.equal( '<p zero="0">abc</p>' );

					observable.foo = '';
					expect( el.outerHTML ).to.equal( '<p zero="0">abc</p>' );
				} );

				it( 'allows binding attribute to the observable – a custom namespace', () => {
					setElement( {
						tag: 'p',
						attributes: {
							class: {
								ns: 'foo',
								value: bind.to( 'foo' )
							},
							custom: {
								ns: 'foo',
								value: [
									bind.to( 'foo' ),
									bind.to( 'baz' )
								]
							}
						},
						children: [ 'abc' ]
					} );

					observable.foo = 'bar';
					expect( el.outerHTML ).to.equal( '<p class="bar" custom="bar qux">abc</p>' );
					expect( el.attributes.getNamedItem( 'class' ).namespaceURI ).to.equal( 'foo' );

					observable.foo = 'baz';
					expect( el.outerHTML ).to.equal( '<p class="baz" custom="baz qux">abc</p>' );
					expect( el.attributes.getNamedItem( 'class' ).namespaceURI ).to.equal( 'foo' );
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
					setElement( {
						tag: 'p',
						attributes: {
							'class': bind.if( 'foo' )
						},
						children: [ 'abc' ]
					} );

					observable.foo = 'bar';
					expect( el.outerHTML ).to.equal( '<p class="true">abc</p>' );

					observable.foo = true;
					expect( el.outerHTML ).to.equal( '<p class="true">abc</p>' );

					observable.foo = 0;
					expect( el.outerHTML ).to.equal( '<p class="true">abc</p>' );

					observable.foo = false;
					expect( el.outerHTML ).to.equal( '<p>abc</p>' );

					observable.foo = null;
					expect( el.outerHTML ).to.equal( '<p>abc</p>' );

					observable.foo = undefined;
					expect( el.outerHTML ).to.equal( '<p>abc</p>' );

					observable.foo = '';
					expect( el.outerHTML ).to.equal( '<p>abc</p>' );
				} );

				// TODO: Is this alright? It makes sense but it's pretty useless. Text Node cannot be
				// removed just like an attribute of some HTMLElement.
				it( 'allows binding attribute to the observable – presence of an attribute (Text Node)', () => {
					setElement( {
						tag: 'p',
						children: [
							{
								text: bind.if( 'foo' )
							}
						]
					} );

					observable.foo = 'abc';
					expect( el.outerHTML ).to.equal( '<p>true</p>' );

					observable.foo = true;
					expect( el.outerHTML ).to.equal( '<p>true</p>' );

					observable.foo = 0;
					expect( el.outerHTML ).to.equal( '<p>true</p>' );

					observable.foo = false;
					expect( el.outerHTML ).to.equal( '<p></p>' );

					observable.foo = null;
					expect( el.outerHTML ).to.equal( '<p></p>' );

					observable.foo = undefined;
					expect( el.outerHTML ).to.equal( '<p></p>' );

					observable.foo = '';
					expect( el.outerHTML ).to.equal( '<p></p>' );
				} );

				it( 'allows binding attribute to the observable – value of an attribute (HTMLElement attribute)', () => {
					setElement( {
						tag: 'p',
						attributes: {
							'class': bind.if( 'foo', 'bar' )
						},
						children: [ 'abc' ]
					} );

					observable.foo = 'bar';
					expect( el.outerHTML ).to.equal( '<p class="bar">abc</p>' );

					observable.foo = true;
					expect( el.outerHTML ).to.equal( '<p class="bar">abc</p>' );

					observable.foo = 0;
					expect( el.outerHTML ).to.equal( '<p class="bar">abc</p>' );

					observable.foo = 64;
					expect( el.outerHTML ).to.equal( '<p class="bar">abc</p>' );

					observable.foo = false;
					expect( el.outerHTML ).to.equal( '<p>abc</p>' );

					observable.foo = null;
					expect( el.outerHTML ).to.equal( '<p>abc</p>' );

					observable.foo = undefined;
					expect( el.outerHTML ).to.equal( '<p>abc</p>' );
				} );

				it( 'allows binding attribute to the observable – value of an attribute (Text Node)', () => {
					setElement( {
						tag: 'p',
						children: [
							{
								text: bind.if( 'foo', 'bar' )
							}
						]
					} );

					observable.foo = 'bar';
					expect( el.outerHTML ).to.equal( '<p>bar</p>' );

					observable.foo = false;
					expect( el.outerHTML ).to.equal( '<p></p>' );

					observable.foo = 64;
					expect( el.outerHTML ).to.equal( '<p>bar</p>' );
				} );

				it( 'allows binding attribute to the observable – array of bindings (HTMLElement attribute)', () => {
					setElement( {
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
					expect( el.outerHTML ).to.equal( '<p class="ck-class foo-set ck-end">abc</p>' );

					observable.foo = observable.bar = false;
					expect( el.outerHTML ).to.equal( '<p class="ck-class bar-not-set ck-end">abc</p>' );
				} );

				it( 'allows binding attribute to the observable – value of an attribute processed by a callback', () => {
					setElement( {
						tag: 'p',
						attributes: {
							'class': bind.if( 'foo', 'there–is–no–foo', value => !value )
						},
						children: [ 'abc' ]
					} );

					observable.foo = 'bar';
					expect( el.outerHTML ).to.equal( '<p>abc</p>' );

					observable.foo = false;
					expect( el.outerHTML ).to.equal( '<p class="there–is–no–foo">abc</p>' );

					observable.foo = 64;
					expect( el.outerHTML ).to.equal( '<p>abc</p>' );
				} );

				it( 'allows binding attribute to the observable – value of an attribute processed by a callback (use Node)', () => {
					setElement( {
						tag: 'p',
						attributes: {
							'class': bind.if( 'foo', 'eqls-tag-name', ( value, el ) => el.tagName === value )
						},
						children: [ 'abc' ]
					} );

					observable.foo = 'bar';
					expect( el.outerHTML ).to.equal( '<p>abc</p>' );

					observable.foo = 'P';
					expect( el.outerHTML ).to.equal( '<p class="eqls-tag-name">abc</p>' );

					observable.foo = 64;
					expect( el.outerHTML ).to.equal( '<p>abc</p>' );
				} );

				it( 'allows binding attribute to the observable – falsy values', () => {
					setElement( {
						tag: 'p',
						attributes: {
							'class': bind.if( 'foo', 'foo-is-set' )
						},
						children: [ 'abc' ]
					} );

					observable.foo = 'bar';
					expect( el.outerHTML ).to.equal( '<p class="foo-is-set">abc</p>' );

					observable.foo = true;
					expect( el.outerHTML ).to.equal( '<p class="foo-is-set">abc</p>' );

					observable.foo = 0;
					expect( el.outerHTML ).to.equal( '<p class="foo-is-set">abc</p>' );

					observable.foo = false;
					expect( el.outerHTML ).to.equal( '<p>abc</p>' );

					observable.foo = null;
					expect( el.outerHTML ).to.equal( '<p>abc</p>' );

					observable.foo = undefined;
					expect( el.outerHTML ).to.equal( '<p>abc</p>' );

					observable.foo = '';
					expect( el.outerHTML ).to.equal( '<p>abc</p>' );
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

	describe( 'extend', () => {
		let observable, emitter, bind;

		beforeEach( () => {
			observable = new Model( {
				foo: 'bar',
				baz: 'qux'
			} );

			emitter = Object.create( DOMEmitterMixin );
			bind = Template.bind( observable, emitter );
		} );

		it( 'does not modify passed definition', () => {
			const def = {
				tag: 'p',
				attributes: {
					a: 'foo',
				}
			};
			const ext = {
				attributes: {
					b: 'bar'
				}
			};
			const tpl = new Template( def );

			Template.extend( tpl, ext );

			expect( def.attributes.a ).to.equal( 'foo' );
			expect( ext.attributes.b ).to.equal( 'bar' );

			expect( tpl.definition.attributes.a[ 0 ] ).to.equal( 'foo' );
			expect( tpl.definition.attributes.b[ 0 ] ).to.equal( 'bar' );
		} );

		describe( 'attributes', () => {
			it( 'extends existing - simple', () => {
				extensionTest(
					{
						tag: 'p',
						attributes: {
							a: 'b'
						}
					},
					{
						attributes: {
							a: 'c'
						}
					},
					'<p a="b c"></p>'
				);
			} );

			it( 'extends existing - complex #1', () => {
				extensionTest(
					{
						tag: 'p',
						attributes: {
							a: [ 'b', 'c' ]
						}
					},
					{
						attributes: {
							a: 'd'
						}
					},
					'<p a="b c d"></p>'
				);
			} );

			it( 'extends existing - complex #2', () => {
				extensionTest(
					{
						tag: 'p',
						attributes: {
							a: {
								value: 'b'
							}
						}
					},
					{
						attributes: {
							a: [ 'c', 'd' ]
						}
					},
					'<p a="b c d"></p>'
				);
			} );

			it( 'extends existing - complex #3', () => {
				extensionTest(
					{
						tag: 'p',
						attributes: {
							a: [ 'b' ]
						}
					},
					{
						attributes: {
							a: [ 'c', 'd' ]
						}
					},
					'<p a="b c d"></p>'
				);
			} );

			it( 'extends existing - bindings #1', () => {
				const el = extensionTest(
					{
						tag: 'p',
						attributes: {
							a: bind.to( 'foo' )
						}
					},
					{
						attributes: {
							a: [ 'c', 'd' ]
						}
					},
					'<p a="bar c d"></p>'
				);

				observable.foo = 'baz';

				expect( el.outerHTML ).to.equal( '<p a="baz c d"></p>' );
			} );

			it( 'extends existing - bindings #2', () => {
				const el = extensionTest(
					{
						tag: 'p',
						attributes: {
							a: [ 'b', bind.to( 'foo' ) ]
						}
					},
					{
						attributes: {
							a: [ 'c', bind.to( 'baz' ) ]
						}
					},
					'<p a="b bar c qux"></p>'
				);

				observable.foo = 'abc';
				observable.baz = 'def';

				expect( el.outerHTML ).to.equal( '<p a="b abc c def"></p>' );
			} );

			it( 'creates new - no attributes', () => {
				extensionTest(
					{
						tag: 'p',
					},
					{
						attributes: {
							c: 'd'
						}
					},
					'<p c="d"></p>'
				);
			} );

			it( 'creates new - simple', () => {
				extensionTest(
					{
						tag: 'p',
						attributes: {
							a: 'b'
						}
					},
					{
						attributes: {
							c: 'd'
						}
					},
					'<p a="b" c="d"></p>'
				);
			} );

			it( 'creates new - array', () => {
				extensionTest(
					{
						tag: 'p',
						attributes: {
							a: 'b'
						}
					},
					{
						attributes: {
							c: [ 'd', 'e' ]
						}
					},
					'<p a="b" c="d e"></p>'
				);
			} );

			it( 'creates new - bindings #1', () => {
				const el = extensionTest(
					{
						tag: 'p',
						attributes: {
							a: 'b'
						}
					},
					{
						attributes: {
							c: bind.to( 'foo' )
						}
					},
					'<p a="b" c="bar"></p>'
				);

				observable.foo = 'abc';

				expect( el.outerHTML ).to.equal( '<p a="b" c="abc"></p>' );
			} );

			it( 'creates new - bindings #2', () => {
				const el = extensionTest(
					{
						tag: 'p',
						attributes: {
							a: 'b'
						}
					},
					{
						attributes: {
							c: [ 'd', bind.to( 'foo' ) ]
						}
					},
					'<p a="b" c="d bar"></p>'
				);

				observable.foo = 'abc';

				expect( el.outerHTML ).to.equal( '<p a="b" c="d abc"></p>' );
			} );
		} );

		describe( 'text', () => {
			it( 'extends existing - simple', () => {
				const el = extensionTest(
					{
						tag: 'p',
						children: [
							'foo'
						]
					},
					{
						children: [
							'bar'
						]
					},
					'<p>foobar</p>'
				);

				expect( el.childNodes ).to.have.length( 1 );
			} );

			it( 'extends existing - complex #1', () => {
				const el = extensionTest(
					{
						tag: 'p',
						children: [
							{ text: 'foo' }
						]
					},
					{
						children: [
							'bar'
						]
					},
					'<p>foobar</p>'
				);

				expect( el.childNodes ).to.have.length( 1 );
			} );

			it( 'extends existing - complex #2', () => {
				const el = extensionTest(
					{
						tag: 'p',
						children: [
							{ text: 'foo' }
						]
					},
					{
						children: [
							{ text: 'bar' }
						]
					},
					'<p>foobar</p>'
				);

				expect( el.childNodes ).to.have.length( 1 );
			} );

			it( 'extends existing - bindings #1', () => {
				const el = extensionTest(
					{
						tag: 'p',
						children: [
							{ text: bind.to( 'foo' ) }
						]
					},
					{
						children: [
							'abc'
						]
					},
					'<p>bar abc</p>'
				);

				observable.foo = 'asd';

				expect( el.outerHTML ).to.equal( '<p>asd abc</p>' );
				expect( el.childNodes ).to.have.length( 1 );
			} );

			it( 'extends existing - bindings #2', () => {
				const el = extensionTest(
					{
						tag: 'p',
						children: [
							'abc'
						]
					},
					{
						children: [
							{ text: bind.to( 'foo' ) }
						]
					},
					'<p>abc bar</p>'
				);

				observable.foo = 'asd';

				expect( el.outerHTML ).to.equal( '<p>abc asd</p>' );
				expect( el.childNodes ).to.have.length( 1 );
			} );

			it( 'extends existing - bindings #3', () => {
				const el = extensionTest(
					{
						tag: 'p',
						children: [
							{ text: bind.to( 'foo' ) },
							'X'
						]
					},
					{
						children: [
							{ text: bind.to( 'baz' ) },
							'Y'
						]
					},
					'<p>bar quxXY</p>'
				);

				observable.foo = 'A';
				observable.baz = 'B';

				expect( el.outerHTML ).to.equal( '<p>A BXY</p>' );
				expect( el.childNodes ).to.have.length( 2 );
			} );
		} );

		describe( 'children', () => {
			it( 'should throw when the number of children does not correspond', () => {
				expect( () => {
					extensionTest(
						{
							tag: 'p',
							children: [
								'foo'
							]
						},
						{
							children: [
								'foo',
								'bar'
							]
						},
						'it should fail'
					);
				} ).to.throw( CKEditorError, /ui-template-extend-children-mismatch/ );
			} );

			it( 'should throw when no children in target but extending one', () => {
				expect( () => {
					extensionTest(
						{
							tag: 'p',
						},
						{
							children: [
								{
									tag: 'b'
								}
							]
						},
						'it should fail'
					);
				} ).to.throw( CKEditorError, /ui-template-extend-children-mismatch/ );
			} );

			it( 'should throw when the number of children does not correspond on some deeper level', () => {
				expect( () => {
					extensionTest(
						{
							tag: 'p',
							children: [
								{
									tag: 'span',
									attributes: {
										class: 'A'
									},
									children: [
										'A',
										{
											tag: 'span',
											attributes: {
												class: 'AA'
											},
											children: [
												'AA'
											]
										}
									]
								}
							]
						},
						{
							children: [
								{
									attributes: {
										class: 'B'
									},
									children: [
										'B'
									]
								}
							]
						},
						'it should fail'
					);
				} ).to.throw( CKEditorError, /ui-template-extend-children-mismatch/ );
			} );

			it( 'extends existing - simple', () => {
				extensionTest(
					{
						tag: 'p',
						children: [
							{
								tag: 'span',
								attributes: {
									class: 'foo'
								}
							}
						]
					},
					{
						children: [
							{
								tag: 'span',
								attributes: {
									class: 'bar'
								}
							}
						]
					},
					'<p><span class="foo bar"></span></p>'
				);
			} );

			it( 'extends existing - complex', () => {
				extensionTest(
					{
						tag: 'p',
						children: [
							{
								tag: 'span',
								attributes: {
									class: 'A'
								},
								children: [
									'A',
									{
										tag: 'span',
										attributes: {
											class: 'AA'
										},
										children: [
											'AA'
										]
									}
								]
							}
						]
					},
					{
						children: [
							{
								tag: 'span',
								attributes: {
									class: 'B'
								},
								children: [
									'B',
									{
										tag: 'span',
										attributes: {
											class: 'BB'
										},
										children: [
											'BB'
										]
									}
								]
							}
						]
					},
					'<p><span class="A B">AB<span class="AA BB">AABB</span></span></p>'
				);
			} );

			it( 'allows extending a particular child', () => {
				const template = new Template( {
					tag: 'p',
					children: [
						{
							tag: 'span',
							attributes: {
								class: 'foo'
							}
						}
					]
				} );

				Template.extend( template.definition.children[ 0 ], {
					attributes: {
						class: 'bar'
					}
				} );

				expect( template.render().outerHTML ).to.equal( '<p><span class="foo bar"></span></p>' );
			} );

			it( 'allows extending a particular child – recursively', () => {
				const template = new Template( {
					tag: 'p',
					children: [
						{
							tag: 'span',
							attributes: {
								class: 'A'
							},
							children: [
								'A',
								{
									tag: 'span',
									attributes: {
										class: 'AA'
									},
									children: [
										'AA'
									]
								}
							]
						}
					]
				} );

				Template.extend( template.definition.children[ 0 ], {
					attributes: {
						class: 'B',
					},
					children: [
						'B',
						{
							attributes: {
								class: 'BB'
							}
						}
					]
				} );

				expect( template.render().outerHTML ).to.equal( '<p><span class="A B">AB<span class="AA BB">AA</span></span></p>' );
			} );
		} );

		describe( 'listeners', () => {
			it( 'extends existing', () => {
				const spy1 = testUtils.sinon.spy();
				const spy2 = testUtils.sinon.spy();
				const spy3 = testUtils.sinon.spy();
				const spy4 = testUtils.sinon.spy();
				const spy5 = testUtils.sinon.spy();

				observable.on( 'A', spy1 );
				observable.on( 'C', spy2 );

				observable.on( 'B', spy3 );
				observable.on( 'D', spy4 );

				const el = extensionTest(
					{
						tag: 'p',
						children: [
							{
								tag: 'span'
							}
						],
						on: {
							click: bind.to( 'A' ),
							'click@span': [
								bind.to( 'B' ),
								bind.to( spy5 )
							]
						}
					},
					{
						on: {
							click: bind.to( 'C' ),
							'click@span': bind.to( 'D' )
						}
					},
					'<p><span></span></p>'
				);

				dispatchEvent( el, 'click' );

				expect( spy1.calledOnce ).to.be.true;
				expect( spy2.calledOnce ).to.be.true;
				expect( spy3.called ).to.be.false;
				expect( spy4.called ).to.be.false;
				expect( spy5.called ).to.be.false;

				dispatchEvent( el.firstChild, 'click' );

				expect( spy1.calledTwice ).to.be.true;
				expect( spy2.calledTwice ).to.be.true;
				expect( spy3.calledOnce ).to.be.true;
				expect( spy4.calledOnce ).to.be.true;
				expect( spy5.calledOnce ).to.be.true;
			} );

			it( 'creates new', () => {
				const spy1 = testUtils.sinon.spy();
				const spy2 = testUtils.sinon.spy();
				const spy3 = testUtils.sinon.spy();

				observable.on( 'A', spy1 );
				observable.on( 'B', spy2 );

				const el = extensionTest(
					{
						tag: 'p',
						children: [
							{
								tag: 'span'
							}
						],
					},
					{
						on: {
							click: bind.to( 'A' ),
							'click@span': [
								bind.to( 'B' ),
								bind.to( spy3 )
							]
						}
					},
					'<p><span></span></p>'
				);

				dispatchEvent( el, 'click' );

				expect( spy1.calledOnce ).to.be.true;
				expect( spy2.called ).to.be.false;
				expect( spy3.called ).to.be.false;

				dispatchEvent( el.firstChild, 'click' );

				expect( spy1.calledTwice ).to.be.true;
				expect( spy2.calledOnce ).to.be.true;
				expect( spy3.calledOnce ).to.be.true;
			} );
		} );
	} );
} );

function setElement( template ) {
	el = new Template( template ).render();
	document.body.appendChild( el );
}

function extensionTest( base, extension, expectedHtml ) {
	const template = new Template( base );

	Template.extend( template, extension );

	const el = template.render();

	document.body.appendChild( el );

	expect( el.outerHTML ).to.equal( expectedHtml );

	return el;
}

function dispatchEvent( el, domEvtName ) {
	if ( !el.parentNode ) {
		throw new Error( 'To dispatch an event, element must be in DOM. Otherwise #target is null.' );
	}

	el.dispatchEvent( new Event( domEvtName, {
		bubbles: true
	} ) );
}
