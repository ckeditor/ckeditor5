/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { AriaLiveAnnouncerRegionView, AriaLiveAnnouncerView } from '../../src/arialiveannouncer.js';

describe( 'AriaLiveAnnouncer', () => {
	let editor, sourceElement, announcer;

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	beforeEach( async () => {
		sourceElement = document.createElement( 'div' );
		document.body.appendChild( sourceElement );
		editor = await ClassicEditor.create( sourceElement );
		announcer = editor.ui.ariaLiveAnnouncer;
	} );

	afterEach( async () => {
		sourceElement.remove();
		await editor.destroy();
	} );

	describe( 'announce()', () => {
		it( 'should create, then add the view to the body collection', () => {
			expect( announcer.view ).not.toBeUndefined();

			announcer.announce( 'bar' );

			expect( announcer.view ).toBeInstanceOf( AriaLiveAnnouncerView );
			expect( announcer.view.regionViews.length ).toBe( 2 );
			expect( editor.ui.view.body.has( announcer.view ) ).toBe( true );
		} );

		it( 'should create the view from template upon first use', () => {
			announcer.announce( 'bar' );

			expect( announcer.view.element.tagName ).toBe( 'DIV' );
			expect( announcer.view.element.className.includes( 'ck' ) ).toBe( true );
			expect( announcer.view.element.className.includes( 'ck-aria-live-announcer' ) ).toBe( true );
		} );

		it( 'should create a new region (if does not exist) and set its text', () => {
			announcer.announce( 'bar' );

			expect( announcer.view.regionViews.length ).toBe( 2 );

			const firstRegion = announcer.view.regionViews.first;

			expect( firstRegion ).toBeInstanceOf( AriaLiveAnnouncerRegionView );
			expect( firstRegion.politeness ).toBe( 'polite' );
			expect( firstRegion.element.parentNode ).toBe( announcer.view.element );

			expect( firstRegion.element.getAttribute( 'role' ) ).toBeNull();
			expect( firstRegion.element.getAttribute( 'aria-live' ) ).toBe( 'polite' );
			expect( firstRegion.element.querySelector( 'li' ).innerHTML ).toBe( 'bar' );
		} );

		it( 'should set a new text in an existing region', () => {
			announcer.announce( 'bar' );
			announcer.announce( 'baz' );

			expect( announcer.view.regionViews.length ).toBe( 2 );

			const firstRegion = announcer.view.regionViews.first;

			expect( firstRegion ).toBeInstanceOf( AriaLiveAnnouncerRegionView );
			expect( firstRegion.politeness ).toBe( 'polite' );
			expect( firstRegion.element.parentNode ).toBe( announcer.view.element );

			expect( firstRegion.element.getAttribute( 'role' ) ).toBeNull();
			expect( firstRegion.element.getAttribute( 'aria-live' ) ).toBe( 'polite' );
			expect( firstRegion.element.querySelector( 'li:last-child' ).innerHTML ).toBe( 'baz' );
		} );

		it( 'should be able to create region depending on politeness', () => {
			announcer.announce( 'foo', 'polite' );
			announcer.announce( 'bar', 'polite' );

			announcer.announce( 'qux', 'assertive' );

			expect( announcer.view.regionViews.length ).toBe( 2 );

			const firstRegion = announcer.view.regionViews.first;
			const lastRegion = announcer.view.regionViews.last;

			expect( firstRegion.politeness ).toBe( 'polite' );
			expect( firstRegion.element.parentNode ).toBe( announcer.view.element );
			expect( firstRegion.element.querySelector( 'li:first-child' ).innerText ).toBe( 'foo' );
			expect( firstRegion.element.querySelector( 'li:last-child' ).innerText ).toBe( 'bar' );
			expect( firstRegion.element.querySelectorAll( 'li' ).length ).toBe( 2 );

			expect( lastRegion.politeness ).toBe( 'assertive' );
			expect( lastRegion.element.parentNode ).toBe( announcer.view.element );
			expect( lastRegion.element.querySelector( 'li:first-child' ).innerText ).toBe( 'qux' );
			expect( lastRegion.element.querySelectorAll( 'li' ).length ).toBe( 1 );
		} );

		it( 'should be able to set the politeness of the announcement', () => {
			announcer.announce( 'bar', 'assertive' );

			const lastRegion = announcer.view.regionViews.last;

			expect( lastRegion.politeness ).toBe( 'assertive' );
			expect( lastRegion.element.getAttribute( 'aria-live' ) ).toBe( 'assertive' );
		} );

		it( 'should be possible to read selected text with HTML tags', () => {
			announcer.announce( '<h1>Foo</h1>', {
				politeness: 'polite',
				isUnsafeHTML: true
			} );

			const firstRegion = announcer.view.regionViews.first;

			expect( firstRegion.element.querySelector( 'li' ).innerHTML ).toBe( '<h1>Foo</h1>' );
		} );
	} );
} );

describe( 'AriaLiveAnnouncerRegionView', () => {
	let editor, sourceElement, announcerRegionView;

	beforeEach( () => {
		vi.useFakeTimers( { now: Date.now() } );
	} );

	afterEach( () => {
		vi.restoreAllMocks();
		vi.useRealTimers();
	} );

	beforeEach( async () => {
		sourceElement = document.createElement( 'div' );
		document.body.appendChild( sourceElement );
		editor = await ClassicEditor.create( sourceElement );

		announcerRegionView = new AriaLiveAnnouncerRegionView( editor, 'polite' );
		announcerRegionView.render();
	} );

	afterEach( async () => {
		sourceElement.remove();

		if ( editor ) {
			await editor.destroy();
		}
	} );

	it( 'there should be no announcements after init', () => {
		expect( queryAllMessages().length ).toBe( 0 );
	} );

	it( 'should prune old announcements using interval', () => {
		announcerRegionView.announce( { announcement: 'Foo' } );
		announcerRegionView.announce( { announcement: 'Bar' } );
		expect( queryAllMessages().length ).toBe( 2 );

		vi.advanceTimersByTime( 12000 );
		expect( queryAllMessages().length ).toBe( 0 );

		announcerRegionView.announce( { announcement: 'Foo' } );
		expect( queryAllMessages().length ).toBe( 1 );

		vi.advanceTimersByTime( 6000 );
		expect( queryAllMessages().length ).toBe( 0 );
	} );

	it( 'should properly set and destroy interval', async () => {
		expect( announcerRegionView._pruneAnnouncementsInterval ).not.toBeNull();

		await editor.destroy();
		editor = null;

		expect( announcerRegionView._pruneAnnouncementsInterval ).toBeNull();
	} );

	describe( 'announce()', () => {
		it( 'should append non-empty announcement', () => {
			announcerRegionView.announce( { announcement: 'Hello World' } );
			expect( queryAllMessages() ).toEqual( [ 'Hello World' ] );
		} );

		it( 'should not append empty announcement', () => {
			announcerRegionView.announce( { announcement: '' } );
			expect( queryAllMessages().length ).toBe( 0 );
		} );
	} );

	function queryAllMessages() {
		return [ ...announcerRegionView.element.querySelectorAll( 'div[aria-live] ul li' ) ].map( element => element.innerHTML );
	}
} );
