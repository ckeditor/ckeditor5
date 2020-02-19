/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import Locale from '@ckeditor/ckeditor5-utils/src/locale';

import BodyCollection from '../../src/editorui/bodycollection';
import View from '../../src/view';

describe( 'BodyCollection', () => {
	let locale;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		locale = new Locale();
	} );

	afterEach( () => {
		const wrappers = Array.from( document.querySelectorAll( '.ck-body-wrapper' ) );

		for ( const wrapper of wrappers ) {
			wrapper.remove();
		}
	} );

	describe( 'constructor', () => {
		it( 'assigns locale', () => {
			const instance = new BodyCollection( locale );

			expect( instance.locale ).to.be.equal( locale );
		} );
	} );

	describe( 'attachToDom', () => {
		it( 'should create wrapper and put the collection in that wrapper', () => {
			const body = new BodyCollection( locale );

			body.attachToDom();

			const wrappers = Array.from( document.querySelectorAll( '.ck-body-wrapper' ) );

			expect( wrappers.length ).to.equal( 1 );
			expect( wrappers[ 0 ].parentNode ).to.equal( document.body );

			const el = body._bodyCollectionContainer;

			expect( el.parentNode ).to.equal( wrappers[ 0 ] );
			expect( el.classList.contains( 'ck' ) ).to.be.true;
			expect( el.classList.contains( 'ck-body' ) ).to.be.true;
			expect( el.classList.contains( 'ck-rounded-corners' ) ).to.be.true;
			expect( el.classList.contains( 'ck-reset_all' ) ).to.be.true;
		} );

		it( 'sets the right dir attribute to the body region (LTR)', () => {
			const body = new BodyCollection( locale );

			body.attachToDom();

			const el = body._bodyCollectionContainer;

			expect( el.getAttribute( 'dir' ) ).to.equal( 'ltr' );
		} );

		it( 'sets the right dir attribute to the body region (RTL)', () => {
			const locale = new Locale( { uiLanguage: 'ar' } );
			const body = new BodyCollection( locale );

			body.attachToDom();

			const el = body._bodyCollectionContainer;

			expect( el.getAttribute( 'dir' ) ).to.equal( 'rtl' );
		} );

		it( 'should put all body elements to the same wrapper', () => {
			const body1 = new BodyCollection( locale );
			body1.attachToDom();

			expect( document.querySelectorAll( '.ck-body-wrapper' ).length ).to.equal( 1 );
			expect( document.querySelectorAll( '.ck-body' ).length ).to.equal( 1 );

			const body2 = new BodyCollection( locale );
			body2.attachToDom();

			const bodyElements = document.querySelectorAll( '.ck-body' );

			expect( document.querySelectorAll( '.ck-body-wrapper' ).length ).to.equal( 1 );
			expect( bodyElements.length ).to.equal( 2 );
			expect( bodyElements[ 0 ].parentNode ).to.equal( bodyElements[ 1 ].parentNode );
		} );

		it( 'should render views in proper body collections', () => {
			const body1 = new BodyCollection( locale );

			const view1 = new View();
			view1.setTemplate( {
				tag: 'div',
				attributes: {
					class: [ 'foo' ]
				}
			} );

			// Should work if body is attached before the view is added...
			body1.attachToDom();
			body1.add( view1 );

			const body2 = new BodyCollection( locale );

			const view2 = new View();
			view2.setTemplate( {
				tag: 'div',
				attributes: {
					class: [ 'bar' ]
				}
			} );

			// ...and it should work if body is attached after the view is added.
			body2.add( view2 );
			body2.attachToDom();

			const wrappers = Array.from( document.querySelectorAll( '.ck-body-wrapper' ) );

			expect( wrappers.length ).to.equal( 1 );

			const wrapper = wrappers[ 0 ];
			const body1Element = body1._bodyCollectionContainer;
			const body2Element = body2._bodyCollectionContainer;

			expect( body1Element.parentNode ).to.equal( wrapper );
			expect( body1Element.childNodes.length ).to.equal( 1 );
			expect( body1Element.childNodes[ 0 ].classList.contains( 'foo' ) ).to.be.true;

			expect( body2Element.parentNode ).to.equal( wrapper );
			expect( body2Element.childNodes.length ).to.equal( 1 );
			expect( body2Element.childNodes[ 0 ].classList.contains( 'bar' ) ).to.be.true;
		} );
	} );

	describe( 'detachFromDom', () => {
		it( 'removes the body collection from DOM', () => {
			const body = new BodyCollection( locale );

			body.attachToDom();
			body.detachFromDom();

			expect( document.querySelectorAll( '.ck-body-wrapper' ).length ).to.equal( 0 );
			expect( document.querySelectorAll( '.ck-body' ).length ).to.equal( 0 );
		} );

		it( 'removes the multiple body collections from dom and remove the wrapper when the last is removed', () => {
			const body1 = new BodyCollection( locale );
			body1.attachToDom();

			const body2 = new BodyCollection( locale );
			body2.attachToDom();

			expect( document.querySelectorAll( '.ck-body-wrapper' ).length ).to.equal( 1 );
			expect( document.querySelectorAll( '.ck-body' ).length ).to.equal( 2 );

			body1.detachFromDom();

			expect( document.querySelectorAll( '.ck-body-wrapper' ).length ).to.equal( 1 );
			expect( document.querySelectorAll( '.ck-body' ).length ).to.equal( 1 );

			body2.detachFromDom();

			expect( document.querySelectorAll( '.ck-body-wrapper' ).length ).to.equal( 0 );
			expect( document.querySelectorAll( '.ck-body' ).length ).to.equal( 0 );
		} );

		it( 'should not throw when be called multiple times', () => {
			const body = new BodyCollection( locale );
			body.attachToDom();

			expect( () => {
				body.detachFromDom();
				body.detachFromDom();
			} ).to.not.throw();
		} );

		it( 'should not throw if attachToDom was not called before', () => {
			const body = new BodyCollection( locale );

			expect( () => {
				body.detachFromDom();
			} ).to.not.throw();
		} );
	} );
} );
