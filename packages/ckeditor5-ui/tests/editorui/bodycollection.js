/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Locale } from '@ckeditor/ckeditor5-utils';

import { BodyCollection } from '../../src/editorui/bodycollection.js';
import { View } from '../../src/view.js';

describe( 'BodyCollection', () => {
	let locale;

	beforeEach( () => {
		locale = new Locale();
	} );

	afterEach( () => {
		const wrappers = Array.from( document.querySelectorAll( '.ck-body-wrapper' ) );

		for ( const wrapper of wrappers ) {
			wrapper.remove();
		}
		delete BodyCollection._bodyWrapper;
	} );

	describe( 'constructor', () => {
		it( 'assigns locale', () => {
			const instance = new BodyCollection( locale );

			expect( instance.locale ).toBe( locale );
		} );

		it( 'stores pre-initialized collection', () => {
			const collectionItems = [ new View(), new View() ];
			const instance = new BodyCollection( locale, collectionItems );

			expect( instance ).toHaveLength( 2 );
			expect( instance.get( 0 ) ).toBe( collectionItems[ 0 ] );
			expect( instance.get( 1 ) ).toBe( collectionItems[ 1 ] );
		} );
	} );

	describe( 'attachToDom', () => {
		it( 'should create wrapper and put the collection in that wrapper', () => {
			const body = new BodyCollection( locale );

			body.attachToDom();

			const wrappers = Array.from( document.querySelectorAll( '.ck-body-wrapper' ) );

			expect( wrappers.length ).toBe( 1 );
			expect( wrappers[ 0 ].parentNode ).toBe( document.body );
			expect( BodyCollection._bodyWrapper ).toBe( wrappers[ 0 ] );

			const el = body.bodyCollectionContainer;

			expect( el.parentNode ).toBe( wrappers[ 0 ] );
			expect( el.classList.contains( 'ck' ) ).toBe( true );
			expect( el.classList.contains( 'ck-body' ) ).toBe( true );
			expect( el.classList.contains( 'ck-rounded-corners' ) ).toBe( true );
			expect( el.classList.contains( 'ck-reset_all' ) ).toBe( true );
		} );

		it( 'sets the role attirbute', () => {
			const body = new BodyCollection( locale );

			body.attachToDom();

			const el = body.bodyCollectionContainer;

			expect( el.getAttribute( 'role' ) ).toBe( 'application' );
		} );

		it( 'sets the right dir attribute to the body region (LTR)', () => {
			const body = new BodyCollection( locale );

			body.attachToDom();

			const el = body.bodyCollectionContainer;

			expect( el.getAttribute( 'dir' ) ).toBe( 'ltr' );
		} );

		it( 'sets the right dir attribute to the body region (RTL)', () => {
			const locale = new Locale( { uiLanguage: 'ar' } );
			const body = new BodyCollection( locale );

			body.attachToDom();

			const el = body.bodyCollectionContainer;

			expect( el.getAttribute( 'dir' ) ).toBe( 'rtl' );
		} );

		it( 'should put all body elements to the same wrapper', () => {
			const body1 = new BodyCollection( locale );
			body1.attachToDom();

			expect( document.querySelectorAll( '.ck-body-wrapper' ).length ).toBe( 1 );
			expect( document.querySelectorAll( '.ck-body' ).length ).toBe( 1 );

			const body2 = new BodyCollection( locale );
			body2.attachToDom();

			const bodyElements = document.querySelectorAll( '.ck-body' );

			expect( document.querySelectorAll( '.ck-body-wrapper' ).length ).toBe( 1 );
			expect( bodyElements.length ).toBe( 2 );
			expect( bodyElements[ 0 ].parentNode ).toBe( bodyElements[ 1 ].parentNode );
			expect( BodyCollection._bodyWrapper ).toBe( bodyElements[ 0 ].parentNode );
		} );

		it( 'should create another wrapper if the previous one got disconnected from DOM', () => {
			const body1 = new BodyCollection( locale );
			body1.attachToDom();

			let wrappers, bodyContainers;

			wrappers = document.querySelectorAll( '.ck-body-wrapper' );
			bodyContainers = document.querySelectorAll( '.ck-body' );

			expect( wrappers.length ).toBe( 1 );
			expect( bodyContainers.length ).toBe( 1 );

			// Some external code breaks the wrapper.
			wrappers[ 0 ].remove();

			const body2 = new BodyCollection( locale );
			body2.attachToDom();

			wrappers = document.querySelectorAll( '.ck-body-wrapper' );
			bodyContainers = document.querySelectorAll( '.ck-body' );

			expect( wrappers.length ).toBe( 1 );
			expect( bodyContainers.length ).toBe( 1 );
			expect( bodyContainers[ 0 ] ).toBe( body2.bodyCollectionContainer );
			expect( body2.bodyCollectionContainer.parentElement ).toBe( wrappers[ 0 ] );

			body1.detachFromDom();

			wrappers = document.querySelectorAll( '.ck-body-wrapper' );
			bodyContainers = document.querySelectorAll( '.ck-body' );

			expect( wrappers.length ).toBe( 1 );
			expect( bodyContainers.length ).toBe( 1 );
			expect( bodyContainers[ 0 ] ).toBe( body2.bodyCollectionContainer );
			expect( body2.bodyCollectionContainer.parentElement ).toBe( wrappers[ 0 ] );

			body2.detachFromDom();

			wrappers = document.querySelectorAll( '.ck-body-wrapper' );
			bodyContainers = document.querySelectorAll( '.ck-body' );

			expect( wrappers.length ).toBe( 0 );
			expect( bodyContainers.length ).toBe( 0 );
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

			expect( wrappers.length ).toBe( 1 );

			const wrapper = wrappers[ 0 ];
			const body1Element = body1.bodyCollectionContainer;
			const body2Element = body2.bodyCollectionContainer;

			expect( body1Element.parentNode ).toBe( wrapper );
			expect( body1Element.childNodes.length ).toBe( 1 );
			expect( body1Element.childNodes[ 0 ].classList.contains( 'foo' ) ).toBe( true );

			expect( body2Element.parentNode ).toBe( wrapper );
			expect( body2Element.childNodes.length ).toBe( 1 );
			expect( body2Element.childNodes[ 0 ].classList.contains( 'bar' ) ).toBe( true );
		} );
	} );

	describe( 'detachFromDom', () => {
		it( 'removes the body collection from DOM', () => {
			const body = new BodyCollection( locale );

			body.attachToDom();
			body.detachFromDom();

			expect( document.querySelectorAll( '.ck-body-wrapper' ).length ).toBe( 0 );
			expect( document.querySelectorAll( '.ck-body' ).length ).toBe( 0 );
		} );

		it( 'removes the multiple body collections from dom and remove the wrapper when the last is removed', () => {
			const body1 = new BodyCollection( locale );
			body1.attachToDom();

			const body2 = new BodyCollection( locale );
			body2.attachToDom();

			expect( document.querySelectorAll( '.ck-body-wrapper' ).length ).toBe( 1 );
			expect( document.querySelectorAll( '.ck-body' ).length ).toBe( 2 );

			body1.detachFromDom();

			expect( document.querySelectorAll( '.ck-body-wrapper' ).length ).toBe( 1 );
			expect( document.querySelectorAll( '.ck-body' ).length ).toBe( 1 );

			body2.detachFromDom();

			expect( document.querySelectorAll( '.ck-body-wrapper' ).length ).toBe( 0 );
			expect( document.querySelectorAll( '.ck-body' ).length ).toBe( 0 );
		} );

		it( 'should not throw when be called multiple times', () => {
			const body = new BodyCollection( locale );
			body.attachToDom();

			expect( () => {
				body.detachFromDom();
				body.detachFromDom();
			} ).not.toThrow();
		} );

		it( 'should not throw if attachToDom was not called before', () => {
			const body = new BodyCollection( locale );

			expect( () => {
				body.detachFromDom();
			} ).not.toThrow();
		} );
	} );
} );
