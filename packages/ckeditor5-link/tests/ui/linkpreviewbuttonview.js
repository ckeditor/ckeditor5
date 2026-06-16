/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LinkPreviewButtonView } from '../../src/ui/linkpreviewbuttonview.js';
import { ButtonView } from '@ckeditor/ckeditor5-ui';

describe( 'LinkPreviewButtonView', () => {
	let view;

	beforeEach( () => {
		view = new LinkPreviewButtonView( { t: () => {} } );
		view.render();
		document.body.appendChild( view.element );
	} );

	afterEach( () => {
		view.element.remove();
		view.destroy();
		vi.restoreAllMocks();
	} );

	it( 'should extend ButtonView', () => {
		expect( view ).toBeInstanceOf( ButtonView );
	} );

	it( 'is an anchor', () => {
		expect( view.element.tagName.toLowerCase() ).toBe( 'a' );
	} );

	it( 'has a CSS class', () => {
		expect( view.element.classList.contains( 'ck-link-toolbar__preview' ) ).toBe( true );
	} );

	it( 'has a "target" attribute', () => {
		expect( view.element.getAttribute( 'target' ) ).toBe( '_blank' );
	} );

	it( 'has a "rel" attribute', () => {
		expect( view.element.getAttribute( 'rel' ) ).toBe( 'noopener noreferrer' );
	} );

	it( 'binds href DOM attribute to view#href', () => {
		expect( view.element.getAttribute( 'href' ) ).toBeNull();

		view.href = 'foo';

		expect( view.element.getAttribute( 'href' ) ).toBe( 'foo' );
	} );

	it( 'does not trigger `navigate` event if #href is not set', () => {
		const spy = vi.fn();

		view.on( 'navigate', spy );

		view.href = '';
		view.element.dispatchEvent( new Event( 'click' ) );

		expect( spy ).not.toHaveBeenCalled();
	} );

	it( 'triggers `navigate` event if #href is set', () => {
		const spy = vi.fn();

		view.on( 'navigate', spy );

		view.href = 'foo';
		view.element.dispatchEvent( new Event( 'click' ) );

		expect( spy ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'the `navigate` event provides a #href value', () => {
		const spy = vi.fn();

		view.on( 'navigate', spy );

		view.href = 'foo';
		view.element.dispatchEvent( new Event( 'click' ) );

		expect( spy ).toHaveBeenCalledTimes( 1 );
		expect( spy.mock.calls[ 0 ][ 1 ] ).toBe( 'foo' );
	} );

	it( 'the `navigate` event can be canceled', () => {
		const event = new Event( 'click' );

		vi.spyOn( event, 'preventDefault' );

		view.on( 'navigate', ( evt, href, cancel ) => cancel() );

		expect( event.preventDefault ).not.toHaveBeenCalled();

		view.href = 'foo';
		view.element.dispatchEvent( event );

		expect( event.preventDefault ).toHaveBeenCalledTimes( 1 );
	} );
} );
