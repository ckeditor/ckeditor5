/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document, HTMLElement */
/* bender-tags: ui */

'use strict';

import testUtils from '/tests/ckeditor5/_utils/utils.js';
import View from '/ckeditor5/ui/view.js';
import Template from '/ckeditor5/ui/template.js';
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
			setTestViewClass( {
				tag: 'p',
				children: [
					{ tag: 'span' },
					{ tag: 'strong' }
				]
			} );
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
			view.template = new Template( {
				tag: 'div',
				children: [
					{ tag: 'span' }
				]
			} );

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

	describe( 'element', () => {
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

		it( 'is null when there is no template', () => {
			expect( new View().element ).to.be.null;
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
			const bind = Template.bind( view.model, view );

			view.model.on( 'ku', spy1 );
			view.model.on( 'kd', spy2 );
			view.model.on( 'mo', spy3 );

			view.applyTemplateToElement( el, {
				tag: 'div',
				children: [
					{
						tag: 'a',
						on: {
							keyup: bind.to( 'ku' )
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
							keydown: bind.to( 'kd' )
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
					'mouseover@a': bind.to( 'mo' )
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
	} );
} );

function createViewInstanceWithTemplate() {
	setTestViewClass( { tag: 'a' } );
	setTestViewInstance();
}

function setTestViewClass( templateDef, regionsFn ) {
	TestView = class V extends View {
		constructor( model ) {
			super( model );

			if ( templateDef ) {
				this.template = new Template( templateDef );
			}

			if ( templateDef && regionsFn ) {
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
