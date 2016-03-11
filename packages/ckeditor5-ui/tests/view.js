/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document, HTMLElement */
/* bender-tags: ui */

'use strict';

import testUtils from '/tests/_utils/utils.js';
import View from '/ckeditor5/ui/view.js';
import Region from '/ckeditor5/ui/region.js';
import CKEditorError from '/ckeditor5/utils/ckeditorerror.js';
import Model from '/ckeditor5/ui/model.js';

let TestView, view;

testUtils.createSinonSandbox();

describe( 'View', () => {
	describe( 'constructor', () => {
		beforeEach( () => {
			setTestViewClass();
			setTestViewInstance();
		} );

		it( 'accepts the model', () => {
			setTestViewInstance( { a: 'foo', b: 42 } );

			expect( view.model ).to.be.an.instanceof( Model );
			expect( view ).to.have.deep.property( 'model.a', 'foo' );
			expect( view ).to.have.deep.property( 'model.b', 42 );
		} );

		it( 'defines basic view properties', () => {
			const model = new Model();

			view = new View( model );

			expect( view.model ).to.equal( model );
			expect( view.t ).to.be.undefined;
			expect( view.regions.length ).to.equal( 0 );
		} );

		it( 'defines the locale property and the t function', () => {
			const model = new Model();
			const locale = { t() {} };

			view = new View( model, locale );

			expect( view.locale ).to.equal( locale );
			expect( view.t ).to.equal( locale.t );
		} );
	} );

	describe( 'init', () => {
		beforeEach( () => {
			setTestViewClass( () => ( {
				tag: 'p',
				children: [
					{ tag: 'span' },
					{ tag: 'strong' }
				]
			} ) );
		} );

		it( 'calls child regions #init', () => {
			setTestViewInstance();

			const region1 = new Region( 'x' );
			const region2 = new Region( 'y' );

			view.register( region1, el => el );
			view.register( region2, el => el );

			const spy1 = testUtils.sinon.spy( region1, 'init' );
			const spy2 = testUtils.sinon.spy( region2, 'init' );

			view.init();

			sinon.assert.calledOnce( spy1 );
			sinon.assert.calledOnce( spy2 );
		} );

		it( 'initializes view regions with string selector', () => {
			setTestViewInstance();

			const region1 = new Region( 'x' );
			const region2 = new Region( 'y' );

			view.register( region1, 'span' );
			view.register( region2, 'strong' );

			view.init();

			expect( region1.element ).to.equal( view.element.firstChild );
			expect( region2.element ).to.equal( view.element.lastChild );
		} );

		it( 'initializes view regions with function selector', () => {
			setTestViewInstance();

			const region1 = new Region( 'x' );
			const region2 = new Region( 'y' );

			view.register( region1, el => el.firstChild );
			view.register( region2, el => el.lastChild );

			view.init();

			expect( region1.element ).to.equal( view.element.firstChild );
			expect( region2.element ).to.equal( view.element.lastChild );
		} );

		it( 'initializes view regions with boolean selector', () => {
			setTestViewInstance();

			const region1 = new Region( 'x' );
			const region2 = new Region( 'y' );

			view.register( region1, true );
			view.register( region2, true );

			view.init();

			expect( region1.element ).to.be.null;
			expect( region2.element ).to.be.null;
		} );
	} );

	describe( 'register', () => {
		beforeEach( () => {
			setTestViewClass();
			setTestViewInstance();
		} );

		it( 'should throw when first argument is neither Region instance nor string', () => {
			expect( () => {
				view.register( new Date() );
			} ).to.throw( CKEditorError, /ui-view-register-wrongtype/ );
		} );

		it( 'should throw when missing the selector argument', () => {
			expect( () => {
				view.register( 'x' );
			} ).to.throw( CKEditorError, /ui-view-register-badselector/ );
		} );

		it( 'should throw when selector argument is of a wrong type', () => {
			expect( () => {
				view.register( 'x', new Date() );
			} ).to.throw( CKEditorError, /ui-view-register-badselector/ );

			expect( () => {
				view.register( 'x', false );
			} ).to.throw( CKEditorError, /ui-view-register-badselector/ );
		} );

		it( 'should throw when overriding an existing region but without override flag set', () => {
			expect( () => {
				view.register( 'x', true );
				view.register( new Region( 'x' ), true );
			} ).to.throw( CKEditorError, /ui-view-register-override/ );
		} );

		it( 'should register a new region with region name as a first argument', () => {
			view.register( 'x', true );

			expect( view.regions.get( 'x' ) ).to.be.an.instanceof( Region );
		} );

		it( 'should register a new region with Region instance as a first argument', () => {
			view.register( new Region( 'y' ), true );

			expect( view.regions.get( 'y' ) ).to.be.an.instanceof( Region );
		} );

		it( 'should override an existing region with override flag', () => {
			view.template = {
				tag: 'div',
				children: [
					{ tag: 'span' }
				]
			};

			const region1 = new Region( 'x' );
			const region2 = new Region( 'x' );

			view.register( region1, true );
			view.register( region2, true, true );
			view.register( 'x', 'span', true );

			view.init();

			expect( view.regions.get( 'x' ) ).to.equal( region2 );
			expect( view.regions.get( 'x' ).element ).to.equal( view.element.firstChild );
		} );

		it( 'should not override an existing region with the same region with override flag', () => {
			const region = new Region( 'x' );
			const spy = testUtils.sinon.spy( view.regions, 'remove' );

			view.register( region, true );
			view.register( region, true, true );

			sinon.assert.notCalled( spy );
		} );
	} );

	describe( 'el', () => {
		beforeEach( createViewInstanceWithTemplate );

		it( 'invokes out of #template', () => {
			setTestViewInstance( { a: 1 } );

			expect( view.element ).to.be.an.instanceof( HTMLElement );
			expect( view.element.nodeName ).to.equal( 'A' );
		} );

		it( 'can be explicitly declared', () => {
			class CustomView extends View {
				constructor() {
					super();

					this.element = document.createElement( 'span' );
				}
			}

			view = new CustomView();

			expect( view.element ).to.be.an.instanceof( HTMLElement );
		} );
	} );

	describe( 'attributeBinder', () => {
		it( 'provides "to" and "if" interface', () => {
			const bind = view.attributeBinder;

			expect( bind ).to.have.keys( 'to', 'if' );
			expect( typeof bind.to ).to.equal( 'function' );
			expect( typeof bind.if ).to.equal( 'function' );
		} );

		describe( 'to', () => {
			it( 'returns an object which describes the binding', () => {
				setTestViewInstance( { a: 1 } );

				const spy = testUtils.sinon.spy();
				const bind = view.attributeBinder;
				const binding = bind.to( 'a', spy );

				expect( spy.called ).to.be.false;
				expect( binding ).to.have.keys( [ 'type', 'model', 'attribute', 'callback' ] );
				expect( binding.model ).to.equal( view.model );
				expect( binding.callback ).to.equal( spy );
				expect( binding.attribute ).to.equal( 'a' );
			} );

			it( 'allows binding attribute to the model – simple (HTMLElement attribute)', () => {
				setTestViewClass( function() {
					const bind = this.attributeBinder;

					return {
						tag: 'p',
						attributes: {
							'class': bind.to( 'foo' )
						},
						children: [ 'abc' ]
					};
				} );

				setTestViewInstance( { foo: 'bar' } );
				expect( view.element.outerHTML ).to.equal( '<p class="bar">abc</p>' );

				view.model.foo = 'baz';
				expect( view.element.outerHTML ).to.equal( '<p class="baz">abc</p>' );
			} );

			it( 'allows binding attribute to the model – simple (Text Node)', () => {
				setTestViewClass( function() {
					const bind = this.attributeBinder;

					return {
						tag: 'p',
						children: [
							{
								text: bind.to( 'foo' )
							}
						]
					};
				} );

				setTestViewInstance( { foo: 'bar' } );
				expect( view.element.outerHTML ).to.equal( '<p>bar</p>' );

				view.model.foo = 'baz';
				expect( view.element.outerHTML ).to.equal( '<p>baz</p>' );
			} );

			it( 'allows binding attribute to the model – value processing', () => {
				setTestViewClass( function() {
					const bind = this.attributeBinder;
					const callback = value => value > 0 ? 'positive' : 'negative';

					return {
						tag: 'p',
						attributes: {
							'class': bind.to( 'foo', callback )
						},
						children: [
							{
								text: bind.to( 'foo', callback )
							}
						]
					};
				} );

				setTestViewInstance( { foo: 3 } );
				expect( view.element.outerHTML ).to.equal( '<p class="positive">positive</p>' );

				view.model.foo = -7;
				expect( view.element.outerHTML ).to.equal( '<p class="negative">negative</p>' );
			} );

			it( 'allows binding attribute to the model – value processing (use Node)', () => {
				setTestViewClass( function() {
					const bind = this.attributeBinder;
					const callback = ( value, node ) => {
						return ( !!node.tagName && value > 0 ) ? 'HTMLElement positive' : '';
					};

					return {
						tag: 'p',
						attributes: {
							'class': bind.to( 'foo', callback )
						},
						children: [
							{
								text: bind.to( 'foo', callback )
							}
						]
					};
				} );

				setTestViewInstance( { foo: 3 } );
				expect( view.element.outerHTML ).to.equal( '<p class="HTMLElement positive"></p>' );

				view.model.foo = -7;
				expect( view.element.outerHTML ).to.equal( '<p></p>' );
			} );

			it( 'allows binding attribute to the model – custom callback', () => {
				setTestViewClass( function() {
					const bind = this.attributeBinder;

					return {
						tag: 'p',
						attributes: {
							'class': bind.to( 'foo', ( value, el ) => {
								el.innerHTML = value;

								if ( value == 'changed' ) {
									return value;
								}
							} )
						}
					};
				} );

				setTestViewInstance( { foo: 'moo' } );
				expect( view.element.outerHTML ).to.equal( '<p class="undefined">moo</p>' );

				view.model.foo = 'changed';
				expect( view.element.outerHTML ).to.equal( '<p class="changed">changed</p>' );
			} );

			it( 'allows binding attribute to the model – array of bindings (HTMLElement attribute)', () => {
				setTestViewClass( function() {
					const bind = this.attributeBinder;

					return {
						tag: 'p',
						attributes: {
							'class': [
								'ck-class',
								bind.to( 'foo' ),
								bind.to( 'bar' ),
								bind.to( 'foo', value => `foo-is-${value}` ),
								'ck-end'
							]
						},
						children: [ 'abc' ]
					};
				} );

				setTestViewInstance( { foo: 'a', bar: 'b' } );
				expect( view.element.outerHTML ).to.equal( '<p class="ck-class a b foo-is-a ck-end">abc</p>' );

				view.model.foo = 'c';
				view.model.bar = 'd';
				expect( view.element.outerHTML ).to.equal( '<p class="ck-class c d foo-is-c ck-end">abc</p>' );
			} );

			it( 'allows binding attribute to the model – array of bindings (Text Node)', () => {
				setTestViewClass( function() {
					const bind = this.attributeBinder;

					return {
						tag: 'p',
						attributes: {
						},
						children: [
							{
								text: [
									'ck-class',
									bind.to( 'foo' ),
									bind.to( 'bar' ),
									bind.to( 'foo', value => `foo-is-${value}` ),
									'ck-end'
								]
							}
						]
					};
				} );

				setTestViewInstance( { foo: 'a', bar: 'b' } );
				expect( view.element.outerHTML ).to.equal( '<p>ck-class a b foo-is-a ck-end</p>' );

				view.model.foo = 'c';
				view.model.bar = 'd';
				expect( view.element.outerHTML ).to.equal( '<p>ck-class c d foo-is-c ck-end</p>' );
			} );

			it( 'allows binding attribute to the model – falsy values', () => {
				setTestViewClass( function() {
					const bind = this.attributeBinder;

					return {
						tag: 'p',
						attributes: {
							'class': bind.to( 'foo' )
						},
						children: [ 'abc' ]
					};
				} );

				setTestViewInstance( { foo: 'bar' } );
				expect( view.element.outerHTML ).to.equal( '<p class="bar">abc</p>' );

				view.model.foo = false;
				expect( view.element.outerHTML ).to.equal( '<p class="false">abc</p>' );

				view.model.foo = null;
				expect( view.element.outerHTML ).to.equal( '<p class="null">abc</p>' );

				view.model.foo = undefined;
				expect( view.element.outerHTML ).to.equal( '<p class="undefined">abc</p>' );

				view.model.foo = 0;
				expect( view.element.outerHTML ).to.equal( '<p class="0">abc</p>' );

				view.model.foo = '';
				expect( view.element.outerHTML ).to.equal( '<p>abc</p>' );
			} );
		} );

		describe( 'if', () => {
			it( 'returns an object which describes the binding', () => {
				setTestViewInstance( { a: 1 } );

				const spy = testUtils.sinon.spy();
				const bind = view.attributeBinder;
				const binding = bind.if( 'a', 'foo', spy );

				expect( spy.called ).to.be.false;
				expect( binding ).to.have.keys( [ 'type', 'model', 'attribute', 'callback', 'valueIfTrue' ] );
				expect( binding.model ).to.equal( view.model );
				expect( binding.callback ).to.equal( spy );
				expect( binding.attribute ).to.equal( 'a' );
				expect( binding.valueIfTrue ).to.equal( 'foo' );
			} );

			it( 'allows binding attribute to the model – presence of an attribute (HTMLElement attribute)', () => {
				setTestViewClass( function() {
					const bind = this.attributeBinder;

					return {
						tag: 'p',
						attributes: {
							'class': bind.if( 'foo' )
						},
						children: [ 'abc' ]
					};
				} );

				setTestViewInstance( { foo: true } );
				expect( view.element.outerHTML ).to.equal( '<p class="">abc</p>' );

				view.model.foo = false;
				expect( view.element.outerHTML ).to.equal( '<p>abc</p>' );

				view.model.foo = 'bar';
				expect( view.element.outerHTML ).to.equal( '<p class="">abc</p>' );
			} );

			// TODO: Is this alright? It makes sense but it's pretty useless. Text Node cannot be
			// removed just like an attribute of some HTMLElement.
			it( 'allows binding attribute to the model – presence of an attribute (Text Node)', () => {
				setTestViewClass( function() {
					const bind = this.attributeBinder;

					return {
						tag: 'p',
						children: [
							{
								text: bind.if( 'foo' )
							}
						]
					};
				} );

				setTestViewInstance( { foo: true } );
				expect( view.element.outerHTML ).to.equal( '<p></p>' );

				view.model.foo = false;
				expect( view.element.outerHTML ).to.equal( '<p></p>' );

				view.model.foo = 'bar';
				expect( view.element.outerHTML ).to.equal( '<p></p>' );
			} );

			it( 'allows binding attribute to the model – value of an attribute (HTMLElement attribute)', () => {
				setTestViewClass( function() {
					const bind = this.attributeBinder;

					return {
						tag: 'p',
						attributes: {
							'class': bind.if( 'foo', 'bar' )
						},
						children: [ 'abc' ]
					};
				} );

				setTestViewInstance( { foo: 'bar' } );
				expect( view.element.outerHTML ).to.equal( '<p class="bar">abc</p>' );

				view.model.foo = false;
				expect( view.element.outerHTML ).to.equal( '<p>abc</p>' );

				view.model.foo = 64;
				expect( view.element.outerHTML ).to.equal( '<p class="bar">abc</p>' );
			} );

			it( 'allows binding attribute to the model – value of an attribute (Text Node)', () => {
				setTestViewClass( function() {
					const bind = this.attributeBinder;

					return {
						tag: 'p',
						children: [
							{
								text: bind.if( 'foo', 'bar' )
							}
						]
					};
				} );

				setTestViewInstance( { foo: 'bar' } );
				expect( view.element.outerHTML ).to.equal( '<p>bar</p>' );

				view.model.foo = false;
				expect( view.element.outerHTML ).to.equal( '<p></p>' );

				view.model.foo = 64;
				expect( view.element.outerHTML ).to.equal( '<p>bar</p>' );
			} );

			it( 'allows binding attribute to the model – value of an attribute processed by a callback', () => {
				setTestViewClass( function() {
					const bind = this.attributeBinder;

					return {
						tag: 'p',
						attributes: {
							'class': bind.if( 'foo', 'there–is–no–foo', value => !value )
						},
						children: [ 'abc' ]
					};
				} );

				setTestViewInstance( { foo: 'bar' } );
				expect( view.element.outerHTML ).to.equal( '<p>abc</p>' );

				view.model.foo = false;
				expect( view.element.outerHTML ).to.equal( '<p class="there–is–no–foo">abc</p>' );

				view.model.foo = 64;
				expect( view.element.outerHTML ).to.equal( '<p>abc</p>' );
			} );

			it( 'allows binding attribute to the model – value of an attribute processed by a callback (use Node)', () => {
				setTestViewClass( function() {
					const bind = this.attributeBinder;

					return {
						tag: 'p',
						attributes: {
							'class': bind.if( 'foo', 'eqls-tag-name', ( value, el ) => el.tagName === value )
						},
						children: [ 'abc' ]
					};
				} );

				setTestViewInstance( { foo: 'bar' } );
				expect( view.element.outerHTML ).to.equal( '<p>abc</p>' );

				view.model.foo = 'P';
				expect( view.element.outerHTML ).to.equal( '<p class="eqls-tag-name">abc</p>' );

				view.model.foo = 64;
				expect( view.element.outerHTML ).to.equal( '<p>abc</p>' );
			} );

			it( 'allows binding attribute to the model – falsy values', () => {
				setTestViewClass( function() {
					const bind = this.attributeBinder;

					return {
						tag: 'p',
						attributes: {
							'class': bind.if( 'foo', 'foo-is-set' )
						},
						children: [ 'abc' ]
					};
				} );

				setTestViewInstance( { foo: 'bar' } );
				expect( view.element.outerHTML ).to.equal( '<p class="foo-is-set">abc</p>' );

				view.model.foo = false;
				expect( view.element.outerHTML ).to.equal( '<p>abc</p>' );

				view.model.foo = null;
				expect( view.element.outerHTML ).to.equal( '<p>abc</p>' );

				view.model.foo = undefined;
				expect( view.element.outerHTML ).to.equal( '<p>abc</p>' );

				view.model.foo = '';
				expect( view.element.outerHTML ).to.equal( '<p>abc</p>' );

				view.model.foo = 0;
				expect( view.element.outerHTML ).to.equal( '<p>abc</p>' );
			} );
		} );
	} );

	describe( 'on', () => {
		it( 'accepts plain binding', () => {
			const spy = testUtils.sinon.spy();

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

			dispatchEvent( view.element, 'x' );
			sinon.assert.calledWithExactly( spy,
				sinon.match.has( 'name', 'a' ),
				sinon.match.has( 'target', view.element )
			);
		} );

		it( 'accepts an array of event bindings', () => {
			const spy1 = testUtils.sinon.spy();
			const spy2 = testUtils.sinon.spy();

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

			dispatchEvent( view.element, 'x' );
			sinon.assert.calledWithExactly( spy1,
				sinon.match.has( 'name', 'a' ),
				sinon.match.has( 'target', view.element )
			);
			sinon.assert.calledWithExactly( spy2,
				sinon.match.has( 'name', 'b' ),
				sinon.match.has( 'target', view.element )
			);
		} );

		it( 'accepts DOM selectors', () => {
			const spy1 = testUtils.sinon.spy();
			const spy2 = testUtils.sinon.spy();
			const spy3 = testUtils.sinon.spy();

			setTestViewClass( function() {
				return {
					tag: 'p',
					children: [
						{
							tag: 'span',
							attributes: {
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
									attributes: {
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
			dispatchEvent( view.element, 'test' );

			sinon.assert.callCount( spy1, 0 );
			sinon.assert.callCount( spy2, 0 );
			sinon.assert.callCount( spy3, 0 );

			// Test "test@.y".
			dispatchEvent( view.element.firstChild, 'test' );

			expect( spy1.firstCall.calledWithExactly(
				sinon.match.has( 'name', 'a' ),
				sinon.match.has( 'target', view.element.firstChild )
			) ).to.be.true;

			sinon.assert.callCount( spy2, 0 );
			sinon.assert.callCount( spy3, 0 );

			// Test "test@div".
			dispatchEvent( view.element.lastChild, 'test' );

			sinon.assert.callCount( spy1, 1 );

			expect( spy2.firstCall.calledWithExactly(
				sinon.match.has( 'name', 'b' ),
				sinon.match.has( 'target', view.element.lastChild )
			) ).to.be.true;

			sinon.assert.callCount( spy3, 0 );

			// Test "test@.y".
			dispatchEvent( view.element.lastChild.firstChild, 'test' );

			expect( spy1.secondCall.calledWithExactly(
				sinon.match.has( 'name', 'a' ),
				sinon.match.has( 'target', view.element.lastChild.firstChild )
			) ).to.be.true;

			sinon.assert.callCount( spy2, 1 );
			sinon.assert.callCount( spy3, 0 );
		} );

		it( 'accepts function callbacks', () => {
			const spy1 = testUtils.sinon.spy();
			const spy2 = testUtils.sinon.spy();

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

			dispatchEvent( view.element, 'x' );
			dispatchEvent( view.element.firstChild, 'y' );

			sinon.assert.calledWithExactly( spy1,
				sinon.match.has( 'target', view.element )
			);

			sinon.assert.calledWithExactly( spy2,
				sinon.match.has( 'target', view.element.firstChild )
			);
		} );

		it( 'supports event delegation', () => {
			const spy = testUtils.sinon.spy();

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

			dispatchEvent( view.element.firstChild, 'x' );
			sinon.assert.calledWithExactly( spy,
				sinon.match.has( 'name', 'a' ),
				sinon.match.has( 'target', view.element.firstChild )
			);
		} );

		it( 'works for future elements', () => {
			const spy = testUtils.sinon.spy();

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

			const div = document.createElement( 'div' );
			view.element.appendChild( div );

			dispatchEvent( div, 'test' );
			sinon.assert.calledWithExactly( spy, sinon.match.has( 'name', 'a' ), sinon.match.has( 'target', div ) );
		} );
	} );

	describe( 'destroy', () => {
		beforeEach( createViewInstanceWithTemplate );

		it( 'should destroy the view', () => {
			view.destroy();

			expect( view.model ).to.be.null;
			expect( view.regions ).to.be.null;
			expect( view.template ).to.be.null;
			expect( view.locale ).to.be.null;
			expect( view.t ).to.be.null;
		} );

		it( 'detaches the element from DOM', () => {
			const elRef = view.element;

			document.createElement( 'div' ).appendChild( view.element );

			view.destroy();

			expect( elRef.parentNode ).to.be.null;
		} );

		it( 'destroys child regions', () => {
			const region = new Region( 'x' );
			const spy = testUtils.sinon.spy( region, 'destroy' );
			const regionsRef = view.regions;
			const regionViewsRef = region.views;

			view.register( region, true );
			view.regions.get( 'x' ).views.add( new View() );
			view.destroy();

			expect( regionsRef.length ).to.equal( 0 );
			expect( regionViewsRef.length ).to.equal( 0 );
			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'detaches bound model listeners', () => {
			setTestViewClass( function() {
				const bind = this.attributeBinder;

				return {
					tag: 'p',
					children: [
						{ text: bind.to( 'foo' ) }
					]
				};
			} );

			setTestViewInstance( { foo: 'bar' } );

			const modelRef = view.model;
			const elRef = view.element;

			expect( view.element.outerHTML ).to.equal( '<p>bar</p>' );

			modelRef.foo = 'baz';
			expect( view.element.outerHTML ).to.equal( '<p>baz</p>' );

			view.destroy();

			modelRef.foo = 'abc';
			expect( elRef.outerHTML ).to.equal( '<p>baz</p>' );
		} );

		it( 'destroy a template–less view', () => {
			view = new View();

			expect( () => {
				view.destroy();
			} ).to.not.throw();
		} );
	} );

	describe( 'applyTemplateToElement', () => {
		beforeEach( () => {
			setTestViewClass();
			setTestViewInstance( { a: 'foo', b: 42 } );
		} );

		it( 'should initialize attribute bindings', () => {
			const el = document.createElement( 'div' );
			const bind = view.attributeBinder;

			view.applyTemplateToElement( el, {
				tag: 'div',
				attributes: {
					class: bind.to( 'b' ),
					id: 'foo',
					checked: 'checked'
				}
			} );

			expect( el.outerHTML ).to.equal( '<div class="42" id="foo" checked="checked"></div>' );

			view.model.b = 64;

			expect( el.outerHTML ).to.equal( '<div class="64" id="foo" checked="checked"></div>' );
		} );

		it( 'should initialize DOM listeners', () => {
			const el = document.createElement( 'div' );
			const spy = testUtils.sinon.spy();

			view.applyTemplateToElement( el, {
				tag: 'div',
				on: {
					click: spy
				}
			} );

			document.body.appendChild( el );

			dispatchEvent( el, 'click' );

			sinon.assert.calledOnce( spy );

			view.stopListening( el, 'click' );
			dispatchEvent( el, 'click' );

			sinon.assert.calledOnce( spy );
		} );

		it( 'should work for deep DOM structure', () => {
			const el = document.createElement( 'div' );
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
			const bind = view.attributeBinder;

			view.applyTemplateToElement( el, {
				tag: 'div',
				children: [
					{
						tag: 'a',
						on: {
							keyup: spy2
						},
						attributes: {
							class: bind.to( 'b', b => 'applied-A-' + b ),
							id: 'applied-A'
						},
						children: [ 'Text applied to childA.' ]
					},
					{
						tag: 'b',
						on: {
							keydown: spy3
						},
						attributes: {
							class: bind.to( 'b', b => 'applied-B-' + b ),
							id: 'applied-B'
						},
						children: [ 'Text applied to childB.' ]
					},
					'Text which is not to be applied because it does NOT exist in original element.'
				],
				on: {
					'mouseover@a': spy1
				},
				attributes: {
					id: bind.to( 'a', a => a.toUpperCase() ),
					class: bind.to( 'b', b => 'applied-parent-' + b )
				}
			} );

			expect( el.outerHTML ).to.equal( '<div id="FOO" class="applied-parent-42">' +
				'<a class="applied-A-42" id="applied-A">Text applied to childA.</a>' +
				'<b class="applied-B-42" id="applied-B">Text applied to childB.</b>' +
			'</div>' );

			view.model.b = 16;

			expect( el.outerHTML ).to.equal( '<div id="FOO" class="applied-parent-16">' +
				'<a class="applied-A-16" id="applied-A">Text applied to childA.</a>' +
				'<b class="applied-B-16" id="applied-B">Text applied to childB.</b>' +
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

		it( 're–uses a template definition object without redundant re–definition of "on" listener attachers', () => {
			const el1 = document.createElement( 'div' );
			const el2 = document.createElement( 'div' );
			const spy = testUtils.sinon.spy();
			const def = {
				tag: 'div',
				on: {
					click: spy
				}
			};

			view.applyTemplateToElement( el1, def );
			const attacherFn = def.on.click;
			view.applyTemplateToElement( el2, def );

			// Attacher function didn't change because it's still the same View instance.
			expect( attacherFn ).to.equal( def.on.click );
			expect( def.on._listenerView ).to.equal( view );

			document.body.appendChild( el1 );
			document.body.appendChild( el2 );

			dispatchEvent( el1, 'click' );
			sinon.assert.calledOnce( spy );

			dispatchEvent( el2, 'click' );
			sinon.assert.calledTwice( spy );
		} );

		it( 'shares a template definition between View instances – event listeners', () => {
			const el = document.createElement( 'div' );
			const spy = testUtils.sinon.spy();
			const view1 = new View();
			const view2 = new View();
			const def = {
				tag: 'div',
				on: {
					click: spy
				}
			};

			document.body.appendChild( el );

			view1.applyTemplateToElement( el, def );
			expect( def.on._listenerView ).to.equal( view1 );

			dispatchEvent( el, 'click' );
			sinon.assert.calledOnce( spy );

			// Use another view1 to see if attachers are re–defined.
			view2.applyTemplateToElement( el, def );
			expect( def.on._listenerView ).to.equal( view2 );

			dispatchEvent( el, 'click' );
			// Spy was called for view1 (1st dispatch), then for view1 and view2 (2nd dispatch).
			sinon.assert.calledThrice( spy );
		} );
	} );
} );

function createViewInstanceWithTemplate() {
	setTestViewClass( () => ( { tag: 'a' } ) );
	setTestViewInstance();
}

function setTestViewClass( templateFn, regionsFn ) {
	TestView = class V extends View {
		constructor( model ) {
			super( model );

			if ( templateFn ) {
				this.template = templateFn.call( this );
			}

			if ( templateFn && regionsFn ) {
				regionsFn.call( this );
			}
		}
	};
}

function setTestViewInstance( model ) {
	view = new TestView( new Model( model ) );

	if ( view.template ) {
		document.body.appendChild( view.element );
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
