/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { AriaLiveAnnouncerRegionView, AriaLiveAnnouncerView } from '../../src/arialiveannouncer.js';

describe( 'AriaLiveAnnouncer', () => {
	let editor, sourceElement, announcer;

	beforeEach( async () => {
		sourceElement = document.createElement( 'div' );
		document.body.appendChild( sourceElement );
		editor = await ClassicEditor.create( sourceElement );
		announcer = editor.ui.ariaLiveAnnouncer;
	} );

	afterEach( async () => {
		sourceElement.remove();

		if ( editor ) {
			await editor.destroy();
		}
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

	describe( 'editor destroy', () => {
		beforeEach( () => {
			vi.useFakeTimers();
		} );

		afterEach( () => {
			vi.useRealTimers();
		} );

		it( 'should cancel pending announcement removals when the editor is destroyed', async () => {
			announcer.announce( 'Foo' );
			announcer.announce( 'Bar', 'assertive' );
			expect( vi.getTimerCount() ).toBe( 2 );

			await editor.destroy();
			editor = null;

			expect( vi.getTimerCount() ).toBe( 0 );
		} );
	} );
} );

describe( 'AriaLiveAnnouncerRegionView', () => {
	let editor, sourceElement, announcerRegionView;

	beforeEach( () => {
		vi.useFakeTimers( { now: Date.now() } );
	} );

	afterEach( () => {
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

	it( 'should remove each announcement 5 seconds after it was added', () => {
		announcerRegionView.announce( { announcement: 'Foo' } );

		vi.advanceTimersByTime( 3000 );
		announcerRegionView.announce( { announcement: 'Bar' } );
		expect( queryAllMessages() ).toEqual( [ 'Foo', 'Bar' ] );

		vi.advanceTimersByTime( 1999 );
		expect( queryAllMessages() ).toEqual( [ 'Foo', 'Bar' ] );

		vi.advanceTimersByTime( 1 );
		expect( queryAllMessages() ).toEqual( [ 'Bar' ] );

		vi.advanceTimersByTime( 2999 );
		expect( queryAllMessages() ).toEqual( [ 'Bar' ] );

		vi.advanceTimersByTime( 1 );
		expect( queryAllMessages() ).toEqual( [] );
	} );

	it( 'should keep each of many announcements added at once for 5 seconds', () => {
		for ( let i = 0; i < 3; i++ ) {
			announcerRegionView.announce( { announcement: `Message ${ i }` } );
		}

		vi.advanceTimersByTime( 4999 );
		expect( queryAllMessages() ).toEqual( [ 'Message 0', 'Message 1', 'Message 2' ] );

		vi.advanceTimersByTime( 1 );
		expect( queryAllMessages() ).toEqual( [] );
	} );

	describe( 'timers', () => {
		let editorTimerCount;

		// The editor is created under fake timers, so its timers are counted in the baseline. The region view is created
		// after reading the baseline, so that the timers it schedules are not.
		beforeEach( () => {
			editorTimerCount = vi.getTimerCount();

			announcerRegionView = new AriaLiveAnnouncerRegionView( editor, 'polite' );
			announcerRegionView.render();
		} );

		it( 'should not schedule any timer when there are no announcements', () => {
			expect( vi.getTimerCount() ).toBe( editorTimerCount );
		} );

		it( 'should not leave any timer scheduled once all announcements were removed', () => {
			announcerRegionView.announce( { announcement: 'Foo' } );
			announcerRegionView.announce( { announcement: 'Bar' } );
			expect( vi.getTimerCount() ).toBe( editorTimerCount + 2 );

			vi.advanceTimersByTime( 5000 );
			expect( vi.getTimerCount() ).toBe( editorTimerCount );
		} );

		it( 'should cancel pending announcement removals on destroy', () => {
			announcerRegionView.announce( { announcement: 'Foo' } );
			announcerRegionView.announce( { announcement: 'Bar' } );

			announcerRegionView.destroy();

			expect( vi.getTimerCount() ).toBe( editorTimerCount );
		} );
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
