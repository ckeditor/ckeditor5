/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals HTMLElement, Event, document */

import { default as Template, TemplateToBinding, TemplateIfBinding } from '../src/template';
import View from '../src/view';
import ViewCollection from '../src/viewcollection';
import Model from '../src/model';

import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin';
import DomEmitterMixin from '@ckeditor/ckeditor5-utils/src/dom/emittermixin';
import normalizeHtml from '@ckeditor/ckeditor5-utils/tests/_utils/normalizehtml';

import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

let el, text;
const injectedElements = [];

describe( 'Template', () => {
	// Clean-up document.body from the rendered elements.
	afterEach( () => {
		sinon.restore();

		for ( const el of injectedElements ) {
			el.remove();
		}
	} );

	describe( 'constructor()', () => {
		it( 'sets #_isRendered property', () => {
			expect( new Template( { tag: 'p' } )._isRendered ).to.be.false;
		} );

		it( 'accepts and normalizes the definition', () => {
			const bind = Template.bind( new Model( {} ), Object.create( DomEmitterMixin ) );
			const childNode = document.createElement( 'div' );
			const childTemplate = new Template( {
				tag: 'b'
			} );

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
					},
					childNode,
					childTemplate
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

			expect( tpl.attributes.a[ 0 ] ).to.equal( 'foo' );
			expect( tpl.attributes.b[ 0 ] ).to.equal( 'bar' );
			expect( tpl.attributes.b[ 1 ] ).to.equal( 'baz' );
			expect( tpl.attributes.c[ 0 ].value[ 0 ] ).to.be.instanceof( TemplateToBinding );

			expect( tpl.children ).to.have.length( 6 );
			expect( tpl.children[ 0 ].text[ 0 ] ).to.equal( 'content' );
			expect( tpl.children[ 1 ].text[ 0 ] ).to.be.instanceof( TemplateToBinding );
			expect( tpl.children[ 2 ].text[ 0 ] ).to.equal( 'abc' );
			expect( tpl.children[ 3 ].text[ 0 ] ).to.equal( 'a' );
			expect( tpl.children[ 3 ].text[ 1 ] ).to.equal( 'b' );
			expect( tpl.children[ 4 ] ).to.equal( childNode );
			expect( tpl.children[ 5 ] ).to.equal( childTemplate );

			expect( tpl.eventListeners[ 'a@span' ][ 0 ] ).to.be.instanceof( TemplateToBinding );
			expect( tpl.eventListeners[ 'b@span' ][ 0 ] ).to.be.instanceof( TemplateToBinding );
			expect( tpl.eventListeners[ 'c@span' ][ 0 ] ).to.be.instanceof( TemplateToBinding );
			expect( tpl.eventListeners[ 'c@span' ][ 1 ] ).to.be.instanceof( TemplateToBinding );

			// Note that Template mixes EmitterMixin.
			expect( tpl.on ).to.be.a( 'function' );
			expect( tpl.on[ 'a@span' ] ).to.be.undefined;
		} );

		it( 'defines #children collection', () => {
			const elementTpl = new Template( {
				tag: 'p'
			} );

			const textTpl = new Template( {
				text: 'foo'
			} );

			expect( elementTpl.children ).to.be.an( 'array' );
			expect( elementTpl.children ).to.have.length( 0 );

			// Text will never have children.
			expect( textTpl.children ).to.be.undefined;
		} );

		it( 'does not modify passed definition', () => {
			const def = {
				tag: 'p',
				attributes: {
					a: 'foo'
				},
				children: [
					{
						tag: 'span'
					}
				]
			};
			const tpl = new Template( def );

			expect( def.attributes ).to.not.equal( tpl.attributes );
			expect( def.children ).to.not.equal( tpl.children );
			expect( def.children[ 0 ] ).to.not.equal( tpl.children[ 0 ] );
			expect( def.attributes.a ).to.equal( 'foo' );
			expect( def.children[ 0 ].tag ).to.equal( 'span' );

			expect( tpl.attributes.a[ 0 ] ).to.equal( 'foo' );
			expect( tpl.children[ 0 ].tag ).to.equal( 'span' );
		} );
	} );

	describe( 'render()', () => {
		it( 'throws when the template definition is wrong', () => {
			expectToThrowCKEditorError( () => {
				new Template( {} ).render();
			}, /ui-template-wrong-syntax/ );

			expectToThrowCKEditorError( () => {
				new Template( {
					tag: 'p',
					text: 'foo'
				} ).render();
			}, /ui-template-wrong-syntax/ );
		} );

		it( 'sets #_isRendered true', () => {
			const tpl = new Template( { tag: 'p' } );

			expect( tpl._isRendered ).to.be.false;

			tpl.render();

			expect( tpl._isRendered ).to.be.true;
		} );

		describe( 'DOM Node', () => {
			it( 'creates HTMLElement', () => {
				const el = new Template( {
					tag: 'p'
				} ).render();

				expect( el ).to.be.instanceof( HTMLElement );
				expect( el.parentNode ).to.be.null;
				expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p></p>' );
				expect( el.namespaceURI ).to.equal( 'http://www.w3.org/1999/xhtml' );
			} );

			it( 'creates an element in a custom namespace', () => {
				const el = new Template( {
					tag: 'p',
					ns: 'foo'
				} ).render();

				expect( el.namespaceURI ).to.equal( 'foo' );
			} );

			it( 'creates a Text node', () => {
				const node = new Template( { text: 'foo' } ).render();

				expect( node.nodeType ).to.equal( 3 );
				expect( node.textContent ).to.equal( 'foo' );
			} );
		} );

		describe( 'attributes', () => {
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
				expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p class="a b" x="bar">foo</p>' );
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

				expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p>foo</p>' );
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

				expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p y="foo">foo</p>' );
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

				expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p class="a b" x="bar">foo</p>' );
				expect( el.attributes.getNamedItem( 'class' ).namespaceURI ).to.equal( 'foo' );
				expect( el.attributes.getNamedItem( 'x' ).namespaceURI ).to.equal( 'abc' );
			} );

			describe( 'style', () => {
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

					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p style="color:red"></p>' );
				} );

				it( 'renders as a static value (Array of values)', () => {
					setElement( {
						tag: 'p',
						attributes: {
							style: {
								color: 'red',
								display: 'block'
							}
						}
					} );

					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p style="color:red;display:block"></p>' );
				} );

				it( 'renders as a value bound to the model', () => {
					setElement( {
						tag: 'p',
						attributes: {
							style: bind.to( 'width', w => `width: ${ w }` )
						}
					} );

					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p style="width:10px"></p>' );

					observable.width = '1em';

					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p style="width:1em"></p>' );
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

					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p style="background-color:yellow;width:10px"></p>' );

					observable.width = '1em';

					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p style="background-color:yellow;width:1em"></p>' );
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

						expect( normalizeHtml( el.outerHTML ) )
							.to.equal( '<p style="background-color:yellow;height:10px;width:10px"></p>' );

						observable.width = '20px';
						observable.backgroundColor = 'green';

						expect( normalizeHtml( el.outerHTML ) )
							.to.equal( '<p style="background-color:green;height:10px;width:20px"></p>' );
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

						expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p style="background-color:yellow"></p>' );

						observable.backgroundColor = '';

						expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p></p>' );
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

						expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p></p>' );
					} );
				} );
			} );
		} );

		describe( 'children', () => {
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

				expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p a="A"><b>B</b><i>C<b>D</b></i></p>' );
			} );

			it( 'creates a child Text Node (different syntaxes)', () => {
				const el = new Template( {
					tag: 'p',
					children: [
						'foo',
						{ text: 'bar' }
					]
				} ).render();

				expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p>foobar</p>' );
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
				expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p>abcdef</p>' );
			} );

			it( 'renders view children', () => {
				const v1 = getView( {
					tag: 'b',
					attributes: {
						class: [
							'v1'
						]
					}
				} );

				const v2 = getView( {
					tag: 'b',
					attributes: {
						class: [
							'v2'
						]
					}
				} );

				const v3 = getView( {
					tag: 'b',
					attributes: {
						class: [
							'v3'
						]
					}
				} );

				v3.render();

				const tpl = new Template( {
					tag: 'p',
					children: [ v1, v2, v3 ]
				} );

				expect( tpl.children[ 0 ] ).to.equal( v1 );
				expect( tpl.children[ 1 ] ).to.equal( v2 );
				expect( tpl.children[ 2 ] ).to.equal( v3 );

				const rendered = tpl.render();

				expect( normalizeHtml( rendered.outerHTML ) )
					.to.equal( '<p><b class="v1"></b><b class="v2"></b><b class="v3"></b></p>' );

				// Make sure the child views will not re–render their elements but
				// use ones rendered by the template instance above.
				expect( v1.element ).to.equal( rendered.firstChild );
				expect( v2.element ).to.equal( rendered.children[ 1 ] );
				expect( v3.element ).to.equal( rendered.lastChild );
			} );

			it( 'renders view collection', () => {
				const collection = new ViewCollection();

				const v1 = getView( {
					tag: 'span',
					attributes: {
						class: [
							'v1'
						]
					}
				} );

				const v2 = getView( {
					tag: 'span',
					attributes: {
						class: [
							'v2'
						]
					}
				} );

				collection.add( v1 );
				collection.add( v2 );

				const rendered = new Template( {
					tag: 'p',
					children: collection
				} ).render();

				expect( normalizeHtml( rendered.outerHTML ) ).to.equal( '<p><span class="v1"></span><span class="v2"></span></p>' );

				// Make sure the child views will not re–render their elements but
				// use ones rendered by the template instance above.
				expect( v1.element ).to.equal( rendered.firstChild );
				expect( v2.element ).to.equal( rendered.lastChild );

				expect( collection._parentElement ).to.equal( rendered );
			} );

			it( 'renders DOM nodes', () => {
				const view = new View();

				view.set( {
					foo: 'bar',
					bar: 'baz'
				} );

				const bind = Template.bind( view, view );

				const childA = new Template( {
					tag: 'b',
					attributes: {
						class: bind.to( 'foo' )
					}
				} ).render();

				const childB = new Template( {
					text: bind.to( 'bar' )
				} ).render();

				const rendered = new Template( {
					tag: 'p',
					children: [
						childA,
						childB
					]
				} ).render();

				expect( normalizeHtml( rendered.outerHTML ) ).to.equal( '<p><b class="bar"></b>baz</p>' );
			} );

			// #117
			it( 'renders template children', () => {
				const childTplA = new Template( {
					tag: 'a'
				} );

				const childTplB = new Template( {
					tag: 'b'
				} );

				const view = new View();

				view.set( {
					foo: 'bar',
					bar: 'foo'
				} );

				const bind = Template.bind( view, view );

				// Yes, this TC is crazy in some sort of way. It's all about template
				// normalization and deep cloning and the like.
				//
				// To **really** prove the code is safe there must be a View instance,
				// which has some child bound to its attribute and... there must be a
				// Template instance (below), which also has a child bound to the same attribute.
				//
				// I know, the view instance and its template aren't even rendered.
				//
				// The truth is that madness behind this test case is so deep there are no
				// words to explain it. But what actually matters is that it proves the Template
				// class is free of "Maximum call stack size exceeded" error in certain
				// situations.
				view.setTemplate( {
					tag: 'span',

					children: [
						{
							text: bind.to( 'bar' )
						}
					]
				} );

				const childTplC = new Template( {
					tag: 'i',

					children: [
						{
							text: bind.to( 'bar' )
						}
					]
				} );

				const tpl = new Template( {
					tag: 'p',
					children: [
						childTplA,
						childTplB,
						childTplC
					]
				} );

				// Make sure child instances weren't cloned.
				expect( tpl.children[ 0 ] ).to.equal( childTplA );
				expect( tpl.children[ 1 ] ).to.equal( childTplB );
				expect( tpl.children[ 2 ] ).to.equal( childTplC );

				expect( normalizeHtml( tpl.render().outerHTML ) ).to.equal(
					'<p><a></a><b></b><i>foo</i></p>'
				);
			} );

			// https://github.com/ckeditor/ckeditor5-ui/issues/289
			it( 'does not throw when child does not have an "id" property', () => {
				const strongView = getView( {
					tag: 'strong'
				} );

				strongView.set( 'id' );

				expect( () => {
					getView( {
						tag: 'div',
						children: [
							strongView
						]
					} );
				} ).to.not.throw();
			} );
		} );

		describe( 'bindings', () => {
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
		} );
	} );

	describe( 'apply()', () => {
		let observable, domEmitter, bind;

		beforeEach( () => {
			setElement( { tag: 'div' } );

			text = document.createTextNode( '' );

			observable = new Model( {
				foo: 'bar',
				baz: 'qux'
			} );

			domEmitter = Object.create( DomEmitterMixin );
			bind = Template.bind( observable, domEmitter );
		} );

		it( 'throws when wrong template definition', () => {
			expectToThrowCKEditorError( () => {
				new Template( {
					tag: 'p',
					text: 'foo'
				} ).apply( el );
			}, /ui-template-wrong-syntax/ );
		} );

		it( 'accepts empty template definition', () => {
			new Template( {} ).apply( el );
			new Template( {} ).apply( text );

			expect( normalizeHtml( el.outerHTML ) ).to.equal( '<div></div>' );
			expect( text.textContent ).to.equal( '' );
		} );

		describe( 'text', () => {
			it( 'applies textContent to a Text Node', () => {
				new Template( {
					text: 'abc'
				} ).apply( text );

				expect( text.textContent ).to.equal( 'abc' );
			} );

			it( 'overrides existing textContent of a Text Node', () => {
				text.textContent = 'foo';

				new Template( {
					text: bind.to( 'foo' )
				} ).apply( text );

				expect( text.textContent ).to.equal( 'bar' );

				observable.foo = 'qux';

				expect( text.textContent ).to.equal( 'qux' );
			} );

			it( 'overrides textContent of an existing Text Node in a HTMLElement', () => {
				el.textContent = 'bar';

				new Template( {
					tag: 'div',
					children: [ 'foo' ]
				} ).apply( el );

				expect( normalizeHtml( el.outerHTML ) ).to.equal( '<div>foo</div>' );
			} );
		} );

		describe( 'attributes', () => {
			it( 'applies attributes to an HTMLElement', () => {
				new Template( {
					tag: 'div',
					attributes: {
						'class': [ 'a', 'b' ],
						x: 'bar'
					}
				} ).apply( el );

				expect( normalizeHtml( el.outerHTML ) ).to.equal( '<div class="a b" x="bar"></div>' );
			} );

			it( 'manages existing attribute values ("class" vs. "non–class")', () => {
				el.setAttribute( 'class', 'default' );
				el.setAttribute( 'x', 'foo' );

				new Template( {
					tag: 'div',
					attributes: {
						'class': [ 'a', 'b' ],
						x: 'bar'
					}
				} ).apply( el );

				expect( normalizeHtml( el.outerHTML ) ).to.equal(
					'<div class="a b default" x="bar"></div>'
				);
			} );

			it( 'applies attributes and TextContent to a DOM tree', () => {
				el.textContent = 'abc';
				el.appendChild( getElement( { tag: 'span' } ) );

				new Template( {
					tag: 'div',
					attributes: {
						'class': 'parent'
					},
					children: [
						'Children:',
						{
							tag: 'span',
							attributes: {
								class: 'child'
							}
						}
					]
				} ).apply( el );

				expect( normalizeHtml( el.outerHTML ) ).to.equal( '<div class="parent">Children:<span class="child"></span></div>' );
			} );

			describe( 'style', () => {
				beforeEach( () => {
					observable = new Model( {
						width: '10px',
						backgroundColor: 'yellow'
					} );

					bind = Template.bind( observable, domEmitter );
				} );

				it( 'applies as a static value', () => {
					setElement( {
						tag: 'p',
						attributes: {
							style: 'color: red;'
						}
					} );

					new Template( {
						attributes: {
							style: 'display: block'
						}
					} ).apply( el );

					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p style="color:red;display:block"></p>' );
				} );

				it( 'applies as a static value (Array of values)', () => {
					setElement( {
						tag: 'p',
						attributes: {
							style: [ 'color: red;', 'display: block;' ]
						}
					} );

					new Template( {
						attributes: {
							style: [ 'float: left;', 'overflow: hidden;' ]
						}
					} ).apply( el );

					expect( normalizeHtml( el.outerHTML ) ).to.equal(
						'<p style="color:red;display:block;float:left;overflow:hidden"></p>'
					);
				} );

				it( 'applies when in an object syntax', () => {
					setElement( {
						tag: 'p',
						attributes: {
							style: {
								width: '20px'
							}
						}
					} );

					new Template( {
						attributes: {
							style: {
								height: '10px',
								float: 'left',
								backgroundColor: 'green'
							}
						}
					} ).apply( el );

					expect( normalizeHtml( el.outerHTML ) )
						.to.equal( '<p style="background-color:green;float:left;height:10px;width:20px"></p>' );
				} );

				it( 'applies when bound to observable', () => {
					setElement( {
						tag: 'p',
						attributes: {
							style: {
								left: '20px'
							}
						}
					} );

					new Template( {
						attributes: {
							style: {
								width: bind.to( 'width' ),
								float: 'left',
								backgroundColor: 'green'
							}
						}
					} ).apply( el );

					expect( normalizeHtml( el.outerHTML ) ).to.equal(
						'<p style="background-color:green;float:left;left:20px;width:10px"></p>'
					);

					observable.width = '100px';

					expect( normalizeHtml( el.outerHTML ) ).to.equal(
						'<p style="background-color:green;float:left;left:20px;width:100px"></p>'
					);
				} );
			} );
		} );

		describe( 'children', () => {
			it( 'doesn\'t apply new child to an HTMLElement – Text Node', () => {
				new Template( {
					tag: 'div',
					children: [ 'foo' ]
				} ).apply( el );

				expect( normalizeHtml( el.outerHTML ) ).to.equal( '<div></div>' );
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

				expect( normalizeHtml( el.outerHTML ) ).to.equal( '<div></div>' );
			} );

			it( 'doesn\'t apply new child to an HTMLElement – view', () => {
				const view = getView( {
					tag: 'span',
					attributes: {
						class: [
							'v1'
						]
					}
				} );

				new Template( {
					tag: 'p',
					children: [ view ]
				} ).apply( el );

				expect( normalizeHtml( el.outerHTML ) ).to.equal( '<div></div>' );
			} );

			it( 'doesn\'t apply new child to an HTMLElement – view collection', () => {
				const collection = new ViewCollection();

				collection.add( getView( {
					tag: 'span',
					attributes: {
						class: [
							'v1'
						]
					}
				} ) );

				new Template( {
					tag: 'p',
					children: collection
				} ).apply( el );

				expect( normalizeHtml( el.outerHTML ) ).to.equal( '<div></div>' );
				expect( collection._parentElement ).to.be.null;
			} );

			it( 'should work for deep DOM structure with bindings and event listeners', () => {
				const childA = getElement( {
					tag: 'a',
					attributes: {
						class: 'a1 a2'
					},
					children: [
						'a'
					]
				} );

				const childB = getElement( {
					tag: 'b',
					attributes: {
						class: 'b1 b2'
					},
					children: [
						'b'
					]
				} );

				el.appendChild( childA );
				el.appendChild( childB );

				expect( normalizeHtml( el.outerHTML ) ).to.equal(
					'<div><a class="a1 a2">a</a><b class="b1 b2">b</b></div>'
				);

				const spy1 = sinon.spy();
				const spy2 = sinon.spy();
				const spy3 = sinon.spy();

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
							children: [ 'applied-a' ]
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
							children: [ 'applied-b' ]
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

				expect( normalizeHtml( el.outerHTML ) ).to.equal( '<div class="applied-parent-qux" id="BAR">' +
					'<a class="a1 a2 applied-A-bar" id="applied-A">applied-a</a>' +
					'<b class="applied-B-qux b1 b2" id="applied-B">applied-b</b>' +
				'</div>' );

				observable.foo = 'updated';

				expect( normalizeHtml( el.outerHTML ) ).to.equal( '<div class="applied-parent-qux" id="UPDATED">' +
					'<a class="a1 a2 applied-A-updated" id="applied-A">applied-a</a>' +
					'<b class="applied-B-qux b1 b2" id="applied-B">applied-b</b>' +
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
	} );

	describe( 'revert()', () => {
		let observable, domEmitter, bind;

		beforeEach( () => {
			el = getElement( { tag: 'div' } );

			observable = new Model( {
				foo: 'bar',
				baz: 'qux'
			} );

			domEmitter = Object.create( DomEmitterMixin );
			bind = Template.bind( observable, domEmitter );
		} );

		it( 'should throw if template is not applied', () => {
			const tpl = new Template( {
				tag: 'div'
			} );

			expectToThrowCKEditorError( () => {
				tpl.revert( el );
			}, /ui-template-revert-not-applied/ );

			tpl.render();

			expectToThrowCKEditorError( () => {
				tpl.revert( el );
			}, /ui-template-revert-not-applied/ );
		} );

		describe( 'text', () => {
			it( 'should revert textContent to the initial value', () => {
				el = getElement( {
					tag: 'a',
					children: [
						'a',
						{
							tag: 'b',
							children: [
								'b'
							]
						}
					]
				} );

				const tpl = new Template( {
					children: [
						'bar',
						{
							children: [
								'qux'
							]
						}
					]
				} );

				tpl.apply( el );

				expect( normalizeHtml( el.outerHTML ) ).to.equal(
					'<a>bar<b>qux</b></a>'
				);

				tpl.revert( el );

				expect( normalizeHtml( el.outerHTML ) ).to.equal(
					'<a>a<b>b</b></a>'
				);
			} );

			it( 'should remove bindings', () => {
				el = getElement( {
					tag: 'a',
					children: [
						'a',
						{
							tag: 'b',
							children: [
								'b'
							]
						}
					]
				} );

				const tpl = new Template( {
					children: [
						'foo',
						{
							children: [
								{
									text: bind.to( 'foo' )
								}
							]
						}
					]
				} );

				tpl.apply( el );
				expect( normalizeHtml( el.outerHTML ) ).to.equal(
					'<a>foo<b>bar</b></a>'
				);

				observable.foo = 'abc';
				expect( normalizeHtml( el.outerHTML ) ).to.equal(
					'<a>foo<b>abc</b></a>'
				);

				tpl.revert( el );
				expect( normalizeHtml( el.outerHTML ) ).to.equal(
					'<a>a<b>b</b></a>'
				);

				observable.foo = 'xyz';
				expect( normalizeHtml( el.outerHTML ) ).to.equal(
					'<a>a<b>b</b></a>'
				);
			} );
		} );

		describe( 'attributes', () => {
			it( 'should revert attributes to the initial values', () => {
				el = getElement( {
					tag: 'a',
					attributes: {
						foo: 'af',
						bar: 'ab'
					},
					children: [
						{
							tag: 'b',
							attributes: {
								foo: 'bf',
								bar: 'bb'
							}
						}
					]
				} );

				const tpl = new Template( {
					attributes: {
						foo: 'af1',
						bar: [ 'ab1', 'ab2' ],
						baz: 'x'
					},
					children: [
						{
							attributes: {
								foo: 'bf1'
							}
						}
					]
				} );

				tpl.apply( el );

				expect( normalizeHtml( el.outerHTML ) ).to.equal(
					'<a bar="ab1 ab2" baz="x" foo="af1">' +
						'<b bar="bb" foo="bf1"></b>' +
					'</a>'
				);

				tpl.revert( el );

				expect( normalizeHtml( el.outerHTML ) ).to.equal(
					'<a bar="ab" foo="af">' +
						'<b bar="bb" foo="bf"></b>' +
					'</a>'
				);
			} );

			it( 'should remove bindings', () => {
				el = getElement( {
					tag: 'a',
					attributes: {
						foo: 'af',
						bar: 'ab'
					},
					children: [
						{
							tag: 'b',
							attributes: {
								foo: 'bf',
								bar: 'bb'
							}
						}
					]
				} );

				const tpl = new Template( {
					attributes: {
						foo: 'af1',
						bar: [
							'ab1',
							bind.to( 'baz' )
						]
					},
					children: [
						{
							attributes: {
								foo: bind.to( 'foo' )
							}
						}
					]
				} );

				tpl.apply( el );
				expect( normalizeHtml( el.outerHTML ) ).to.equal(
					'<a bar="ab1 qux" foo="af1">' +
						'<b bar="bb" foo="bar"></b>' +
					'</a>'
				);

				observable.foo = 'x';
				observable.baz = 'y';
				expect( normalizeHtml( el.outerHTML ) ).to.equal(
					'<a bar="ab1 y" foo="af1">' +
						'<b bar="bb" foo="x"></b>' +
					'</a>'
				);

				tpl.revert( el );
				expect( normalizeHtml( el.outerHTML ) ).to.equal(
					'<a bar="ab" foo="af">' +
						'<b bar="bb" foo="bf"></b>' +
					'</a>'
				);

				observable.foo = 'abc';
				observable.baz = 'cba';
				expect( normalizeHtml( el.outerHTML ) ).to.equal(
					'<a bar="ab" foo="af">' +
						'<b bar="bb" foo="bf"></b>' +
					'</a>'
				);
			} );

			describe( 'style', () => {
				beforeEach( () => {
					observable = new Model( {
						overflow: 'visible'
					} );

					bind = Template.bind( observable, domEmitter );
				} );

				it( 'should remove bindings', () => {
					el = getElement( {
						tag: 'a',
						attributes: {
							style: {
								fontWeight: 'bold'
							}
						},
						children: [
							{
								tag: 'b',
								attributes: {
									style: {
										color: 'red'
									}
								}
							}
						]
					} );

					const tpl = new Template( {
						attributes: {
							style: {
								overflow: bind.to( 'overflow' )
							}
						},
						children: [
							{
								tag: 'b',
								attributes: {
									style: {
										display: 'block'
									}
								}
							}
						]
					} );

					tpl.apply( el );
					expect( normalizeHtml( el.outerHTML ) ).to.equal(
						'<a style="font-weight:bold;overflow:visible">' +
							'<b style="color:red;display:block"></b>' +
						'</a>'
					);

					tpl.revert( el );
					expect( normalizeHtml( el.outerHTML ) ).to.equal(
						'<a style="font-weight:bold">' +
							'<b style="color:red"></b>' +
						'</a>'
					);

					observable.overflow = 'hidden';
					expect( normalizeHtml( el.outerHTML ) ).to.equal(
						'<a style="font-weight:bold">' +
							'<b style="color:red"></b>' +
						'</a>'
					);
				} );
			} );
		} );

		describe( 'children', () => {
			it( 'should work for deep DOM structure with bindings and event listeners', () => {
				el = getElement( {
					tag: 'div',
					children: [
						{
							tag: 'a',
							attributes: {
								class: [ 'a1', 'a2' ]
							},
							children: [
								'a'
							]
						},
						{
							tag: 'b',
							attributes: {
								class: [ 'b1', 'b2' ]
							},
							children: [
								'b'
							]
						}
					]
				} );

				const spy = sinon.spy();
				observable.on( 'ku', spy );

				expect( normalizeHtml( el.outerHTML ) ).to.equal(
					'<div><a class="a1 a2">a</a><b class="b1 b2">b</b></div>'
				);

				const tpl = new Template( {
					tag: 'div',
					attributes: {
						class: [ 'div1', 'div2' ],
						style: {
							fontWeight: 'bold'
						}
					},
					children: [
						{
							tag: 'a',
							attributes: {
								class: [ 'x', 'y' ],
								'data-new-attr': 'foo'
							},
							children: [ 'applied-a' ]
						},
						{
							tag: 'b',
							attributes: {
								class: [
									'a',
									'b',
									bind.to( 'foo' )
								]
							},
							children: [ 'applied-b' ]
						}
					],
					on: {
						keyup: bind.to( 'ku' )
					}
				} );

				tpl.apply( el );
				expect( normalizeHtml( el.outerHTML ) ).to.equal(
					'<div class="div1 div2" style="font-weight:bold">' +
						'<a class="a1 a2 x y" data-new-attr="foo">applied-a</a>' +
						'<b class="a b b1 b2 bar">applied-b</b>' +
					'</div>'
				);

				observable.foo = 'baz';
				expect( normalizeHtml( el.outerHTML ) ).to.equal(
					'<div class="div1 div2" style="font-weight:bold">' +
						'<a class="a1 a2 x y" data-new-attr="foo">applied-a</a>' +
						'<b class="a b b1 b2 baz">applied-b</b>' +
					'</div>'
				);

				dispatchEvent( el.firstChild, 'keyup' );
				sinon.assert.calledOnce( spy );

				tpl.revert( el );
				expect( normalizeHtml( el.outerHTML ) ).to.equal(
					'<div><a class="a1 a2">a</a><b class="b1 b2">b</b></div>'
				);

				observable.foo = 'qux';
				expect( normalizeHtml( el.outerHTML ) ).to.equal(
					'<div><a class="a1 a2">a</a><b class="b1 b2">b</b></div>'
				);

				dispatchEvent( el.firstChild, 'keyup' );
				sinon.assert.calledOnce( spy );
			} );
		} );
	} );

	describe( 'getViews()', () => {
		it( 'returns iterator', () => {
			const template = new Template( {} );

			expect( template.getViews().next ).to.be.a( 'function' );
			expect( Array.from( template.getViews() ) ).to.have.length( 0 );
		} );

		it( 'returns all child views', () => {
			const viewA = new View();
			const viewB = new View();
			const viewC = new View();
			const template = new Template( {
				tag: 'div',
				children: [
					viewA,
					{
						tag: 'div',
						children: [
							viewB
						]
					},
					viewC
				]
			} );

			expect( Array.from( template.getViews() ) ).to.have.members( [ viewA, viewB, viewC ] );
		} );

		// https://github.com/ckeditor/ckeditor5-ui/issues/337
		it( 'does not traverse non–Template children', () => {
			const viewA = new View();
			const viewB = new View();
			const viewC = new View();

			const template = new Template( {
				tag: 'div',
				children: [
					viewA
				]
			} );

			// Technically, this kind of child is invalid but the aim of this test is to
			// check if the generator will accidentally traverse non–Template objects
			// like native HTML elements, which also have "children" property. It could happen
			// because it is possible to pass HTML elements directly to the templateDefinition.
			template.children.push( {
				children: [ viewB ]
			} );

			template.children.push( viewC );

			expect( Array.from( template.getViews() ) ).to.have.members( [ viewA, viewC ] );
		} );
	} );

	describe( 'bind()', () => {
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

				domEmitter = Object.create( DomEmitterMixin );
				bind = Template.bind( observable, domEmitter );
			} );

			it( 'accepts plain binding', () => {
				const spy = sinon.spy();

				setElement( {
					tag: 'p',
					on: {
						x: bind.to( 'a' )
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
				const spy1 = sinon.spy();
				const spy2 = sinon.spy();

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
				const spy1 = sinon.spy();
				const spy2 = sinon.spy();
				const spy3 = sinon.spy();

				setElement( {
					tag: 'p',
					children: [
						{
							tag: 'span',
							attributes: {
								'class': 'y'
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
										'class': 'y'
									}
								}
							]
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
				const spy1 = sinon.spy();
				const spy2 = sinon.spy();

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
				const spy = sinon.spy();

				setElement( {
					tag: 'p',
					children: [
						{
							tag: 'span'
						}
					],
					on: {
						x: bind.to( 'a' )
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
				const spy = sinon.spy();

				setElement( {
					tag: 'p',
					on: {
						'test@div': bind.to( 'a' )
					}
				} );

				observable.on( 'a', spy );

				const div = getElement( { tag: 'div' } );
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
				it( 'returns an instance of TemplateToBinding', () => {
					const spy = sinon.spy();
					const binding = bind.to( 'foo', spy );

					expect( binding ).to.be.instanceof( TemplateToBinding );
					expect( spy.called ).to.be.false;
					expect( binding ).to.have.keys( [ 'observable', 'eventNameOrFunction', 'emitter', 'attribute', 'callback' ] );
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

					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p class="bar">abc</p>' );

					observable.foo = 'baz';
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p class="baz">abc</p>' );
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

					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p>bar</p>' );

					observable.foo = 'baz';
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p>baz</p>' );
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
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p class="positive">positive</p>' );

					observable.foo = -7;
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p class="negative">negative</p>' );
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
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p class="HTMLElement positive"></p>' );

					observable.foo = -7;
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p></p>' );
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
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p>moo</p>' );

					observable.foo = 'changed';
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p class="changed">changed</p>' );
				} );

				it( 'allows binding attribute to the observable – array of bindings (HTMLElement attribute)', () => {
					setElement( {
						tag: 'p',
						attributes: {
							'class': [
								'ck-class',
								bind.to( 'foo' ),
								bind.to( 'baz' ),
								bind.to( 'foo', value => `foo-is-${ value }` ),
								'ck-end'
							]
						},
						children: [ 'abc' ]
					} );

					observable.foo = 'a';
					observable.baz = 'b';
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p class="a b ck-class ck-end foo-is-a">abc</p>' );

					observable.foo = 'c';
					observable.baz = 'd';
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p class="c ck-class ck-end d foo-is-c">abc</p>' );
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
									bind.to( 'foo', value => `foo-is-${ value }` ),
									'ck-end'
								]
							}
						]
					} );

					observable.foo = 'a';
					observable.baz = 'b';
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p>ck-class a b foo-is-a ck-end</p>' );

					observable.foo = 'c';
					observable.baz = 'd';
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p>ck-class c d foo-is-c ck-end</p>' );
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
					expect( normalizeHtml( el.outerHTML ) )
						.to.equal( '<p complex="bar" emptystring="bar" simple="bar" zero="0 bar">abc</p>' );

					observable.foo = 0;
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p complex="0" emptystring="0" simple="0" zero="0 0">abc</p>' );

					observable.foo = false;
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p zero="0">abc</p>' );

					observable.foo = null;
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p zero="0">abc</p>' );

					observable.foo = undefined;
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p zero="0">abc</p>' );

					observable.foo = '';
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p zero="0">abc</p>' );
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
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p class="bar" custom="bar qux">abc</p>' );
					expect( el.attributes.getNamedItem( 'class' ).namespaceURI ).to.equal( 'foo' );

					observable.foo = 'baz';
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p class="baz" custom="baz qux">abc</p>' );
					expect( el.attributes.getNamedItem( 'class' ).namespaceURI ).to.equal( 'foo' );
				} );
			} );

			describe( 'if', () => {
				it( 'returns an object which describes the binding', () => {
					const spy = sinon.spy();
					const binding = bind.if( 'foo', 'whenTrue', spy );

					expect( binding ).to.be.instanceof( TemplateIfBinding );
					expect( spy.called ).to.be.false;
					expect( binding ).to.have.keys( [ 'observable', 'emitter', 'attribute', 'callback', 'valueIfTrue' ] );
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
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p class="true">abc</p>' );

					observable.foo = true;
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p class="true">abc</p>' );

					observable.foo = 0;
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p class="true">abc</p>' );

					observable.foo = false;
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p>abc</p>' );

					observable.foo = null;
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p>abc</p>' );

					observable.foo = undefined;
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p>abc</p>' );

					observable.foo = '';
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p>abc</p>' );
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
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p>true</p>' );

					observable.foo = true;
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p>true</p>' );

					observable.foo = 0;
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p>true</p>' );

					observable.foo = false;
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p></p>' );

					observable.foo = null;
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p></p>' );

					observable.foo = undefined;
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p></p>' );

					observable.foo = '';
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p></p>' );
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
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p class="bar">abc</p>' );

					observable.foo = true;
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p class="bar">abc</p>' );

					observable.foo = 0;
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p class="bar">abc</p>' );

					observable.foo = 64;
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p class="bar">abc</p>' );

					observable.foo = false;
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p>abc</p>' );

					observable.foo = null;
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p>abc</p>' );

					observable.foo = undefined;
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p>abc</p>' );
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
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p>bar</p>' );

					observable.foo = false;
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p></p>' );

					observable.foo = 64;
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p>bar</p>' );
				} );

				it( 'allows binding attribute to the observable – array of bindings (HTMLElement attribute)', () => {
					setElement( {
						tag: 'p',
						attributes: {
							'class': [
								'ck-class',
								bind.if( 'foo', 'foo-set' ),
								bind.if( 'bar', 'bar-not-set', value => !value ),
								'ck-end'
							]
						},
						children: [ 'abc' ]
					} );

					observable.foo = observable.bar = true;
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p class="ck-class ck-end foo-set">abc</p>' );

					observable.foo = observable.bar = false;
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p class="bar-not-set ck-class ck-end">abc</p>' );
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
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p>abc</p>' );

					observable.foo = false;
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p class="there–is–no–foo">abc</p>' );

					observable.foo = 64;
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p>abc</p>' );
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
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p>abc</p>' );

					observable.foo = 'P';
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p class="eqls-tag-name">abc</p>' );

					observable.foo = 64;
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p>abc</p>' );
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
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p class="foo-is-set">abc</p>' );

					observable.foo = true;
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p class="foo-is-set">abc</p>' );

					observable.foo = 0;
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p class="foo-is-set">abc</p>' );

					observable.foo = false;
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p>abc</p>' );

					observable.foo = null;
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p>abc</p>' );

					observable.foo = undefined;
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p>abc</p>' );

					observable.foo = '';
					expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p>abc</p>' );
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
				const el = getElement( { tag: 'div' } );
				const child = getElement( {
					tag: 'span',
					children: [ 'foo' ]
				} );

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

	describe( 'extend()', () => {
		let observable, emitter, bind;

		beforeEach( () => {
			observable = new Model( {
				foo: 'bar',
				baz: 'qux'
			} );

			emitter = Object.create( DomEmitterMixin );
			bind = Template.bind( observable, emitter );
		} );

		it( 'does not modify passed definition', () => {
			const def = {
				tag: 'p',
				attributes: {
					a: 'foo'
				}
			};
			const ext = {
				attributes: {
					b: 'bar'
				}
			};
			const tpl = new Template( def );

			Template.extend( tpl, ext );

			expect( ext.attributes.b ).to.equal( 'bar' );

			expect( tpl.attributes.a[ 0 ] ).to.equal( 'foo' );
			expect( tpl.attributes.b[ 0 ] ).to.equal( 'bar' );
		} );

		it( 'throws an error if an element has already been rendered', () => {
			const tpl = new Template( {
				tag: 'p'
			} );

			Template.extend( tpl, {
				attributes: {
					class: 'foo'
				}
			} );

			tpl.render();

			expectToThrowCKEditorError( () => {
				Template.extend( tpl, {
					attributes: {
						class: 'bar'
					}
				} );
			}, /^template-extend-render/ );
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

				expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p a="baz c d"></p>' );
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

				expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p a="b abc c def"></p>' );
			} );

			it( 'creates new - no attributes', () => {
				extensionTest(
					{
						tag: 'p'
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

				expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p a="b" c="abc"></p>' );
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

				expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p a="b" c="d abc"></p>' );
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

				expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p>asd abc</p>' );
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

				expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p>abc asd</p>' );
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

				expect( normalizeHtml( el.outerHTML ) ).to.equal( '<p>A BXY</p>' );
				expect( el.childNodes ).to.have.length( 2 );
			} );
		} );

		describe( 'children', () => {
			it( 'should throw when the number of children does not correspond', () => {
				expectToThrowCKEditorError( () => {
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
				}, /ui-template-extend-children-mismatch/ );
			} );

			it( 'should throw when no children in target but extending one', () => {
				expectToThrowCKEditorError( () => {
					extensionTest(
						{
							tag: 'p'
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
				}, /ui-template-extend-children-mismatch/ );
			} );

			it( 'should throw when the number of children does not correspond on some deeper level', () => {
				expectToThrowCKEditorError( () => {
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
				}, /ui-template-extend-children-mismatch/ );
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
					'<p><span class="bar foo"></span></p>'
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

				Template.extend( template.children[ 0 ], {
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

				Template.extend( template.children[ 0 ], {
					attributes: {
						class: 'B'
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
				const spy1 = sinon.spy();
				const spy2 = sinon.spy();
				const spy3 = sinon.spy();
				const spy4 = sinon.spy();
				const spy5 = sinon.spy();

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
				const spy1 = sinon.spy();
				const spy2 = sinon.spy();
				const spy3 = sinon.spy();

				observable.on( 'A', spy1 );
				observable.on( 'B', spy2 );

				const el = extensionTest(
					{
						tag: 'p',
						children: [
							{
								tag: 'span'
							}
						]
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

function getElement( template ) {
	return new Template( template ).render();
}

function setElement( template ) {
	el = new Template( template ).render();

	document.body.appendChild( el );

	injectedElements.push( el );
}

function extensionTest( baseDefinition, extendedDefinition, expectedHtml ) {
	const template = new Template( baseDefinition );

	Template.extend( template, extendedDefinition );

	const el = template.render();

	document.body.appendChild( el );

	expect( normalizeHtml( el.outerHTML ) ).to.equal( expectedHtml );

	injectedElements.push( el );

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

function getView( def ) {
	const view = new View();

	view.setTemplate( def );

	return view;
}
