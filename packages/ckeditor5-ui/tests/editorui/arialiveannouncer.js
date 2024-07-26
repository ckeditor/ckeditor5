/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document  */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { AriaLiveAnnouncerRegionView, AriaLiveAnnouncerView } from '../../src/arialiveannouncer.js';

describe( 'AriaLiveAnnouncer', () => {
	let editor, sourceElement, announcer;

	testUtils.createSinonSandbox();

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
			expect( announcer.view ).not.to.be.undefined;

			announcer.announce( 'bar' );

			expect( announcer.view ).to.be.instanceOf( AriaLiveAnnouncerView );
			expect( announcer.view.regionViews.length ).to.equal( 2 );
			expect( editor.ui.view.body.has( announcer.view ) ).to.be.true;
		} );

		it( 'should create the view from template upon first use', () => {
			announcer.announce( 'bar' );

			expect( announcer.view.element.tagName ).to.equal( 'DIV' );
			expect( announcer.view.element.className.includes( 'ck' ) ).to.be.true;
			expect( announcer.view.element.className.includes( 'ck-aria-live-announcer' ) ).to.be.true;
		} );

		it( 'should create a new region (if does not exist) and set its text', () => {
			announcer.announce( 'bar' );

			expect( announcer.view.regionViews.length ).to.equal( 2 );

			const firstRegion = announcer.view.regionViews.first;

			expect( firstRegion ).to.be.instanceOf( AriaLiveAnnouncerRegionView );
			expect( firstRegion.politeness ).to.equal( 'polite' );
			expect( firstRegion.element.parentNode ).to.equal( announcer.view.element );

			expect( firstRegion.element.getAttribute( 'role' ) ).to.be.null;
			expect( firstRegion.element.getAttribute( 'aria-live' ) ).to.equal( 'polite' );
			expect( firstRegion.element.querySelector( 'li' ).innerHTML ).to.equal( 'bar' );
		} );

		it( 'should set a new text in an existing region', () => {
			announcer.announce( 'bar' );
			announcer.announce( 'baz' );

			expect( announcer.view.regionViews.length ).to.equal( 2 );

			const firstRegion = announcer.view.regionViews.first;

			expect( firstRegion ).to.be.instanceOf( AriaLiveAnnouncerRegionView );
			expect( firstRegion.politeness ).to.equal( 'polite' );
			expect( firstRegion.element.parentNode ).to.equal( announcer.view.element );

			expect( firstRegion.element.getAttribute( 'role' ) ).to.be.null;
			expect( firstRegion.element.getAttribute( 'aria-live' ) ).to.equal( 'polite' );
			expect( firstRegion.element.querySelector( 'li:last-child' ).innerHTML ).to.equal( 'baz' );
		} );

		it( 'should be able to create region depending on politeness', () => {
			announcer.announce( 'foo', 'polite' );
			announcer.announce( 'bar', 'polite' );

			announcer.announce( 'qux', 'assertive' );

			expect( announcer.view.regionViews.length ).to.equal( 2 );

			const firstRegion = announcer.view.regionViews.first;
			const lastRegion = announcer.view.regionViews.last;

			expect( firstRegion.politeness ).to.equal( 'polite' );
			expect( firstRegion.element.parentNode ).to.equal( announcer.view.element );
			expect( firstRegion.element.querySelector( 'li:first-child' ).innerText ).to.equal( 'foo' );
			expect( firstRegion.element.querySelector( 'li:last-child' ).innerText ).to.equal( 'bar' );
			expect( firstRegion.element.querySelectorAll( 'li' ).length ).to.equal( 2 );

			expect( lastRegion.politeness ).to.equal( 'assertive' );
			expect( lastRegion.element.parentNode ).to.equal( announcer.view.element );
			expect( lastRegion.element.querySelector( 'li:first-child' ).innerText ).to.equal( 'qux' );
			expect( lastRegion.element.querySelectorAll( 'li' ).length ).to.equal( 1 );
		} );

		it( 'should be able to set the politeness of the announcement', () => {
			announcer.announce( 'bar', 'assertive' );

			const lastRegion = announcer.view.regionViews.last;

			expect( lastRegion.politeness ).to.equal( 'assertive' );
			expect( lastRegion.element.getAttribute( 'aria-live' ) ).to.equal( 'assertive' );
		} );

		it( 'should be possible to read selected text with HTML tags', () => {
			announcer.announce( '<h1>Foo</h1>', {
				politeness: 'polite',
				isUnsafeHTML: true
			} );

			const firstRegion = announcer.view.regionViews.first;

			expect( firstRegion.element.querySelector( 'li' ).innerHTML ).to.equal( '<h1>Foo</h1>' );
		} );
	} );
} );

describe( 'AriaLiveAnnouncerRegionView', () => {
	let editor, sourceElement, announcerRegionView;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		sinon.useFakeTimers( { now: Date.now() } );
		sourceElement = document.createElement( 'div' );
		document.body.appendChild( sourceElement );
		editor = await ClassicEditor.create( sourceElement );

		announcerRegionView = new AriaLiveAnnouncerRegionView( editor, 'polite' );
		announcerRegionView.render();
	} );

	afterEach( async () => {
		sinon.restore();
		sourceElement.remove();

		if ( editor ) {
			await editor.destroy();
		}
	} );

	it( 'there should be no announcements after init', () => {
		expect( queryAllMessages().length ).to.be.equal( 0 );
	} );

	it( 'should prune old announcements using interval', () => {
		announcerRegionView.announce( { announcement: 'Foo' } );
		announcerRegionView.announce( { announcement: 'Bar' } );
		expect( queryAllMessages().length ).to.be.equal( 2 );

		sinon.clock.tick( 12000 );
		expect( queryAllMessages().length ).to.be.equal( 0 );

		announcerRegionView.announce( { announcement: 'Foo' } );
		expect( queryAllMessages().length ).to.be.equal( 1 );

		sinon.clock.tick( 6000 );
		expect( queryAllMessages().length ).to.be.equal( 0 );
	} );

	it( 'should properly set and destroy interval', async () => {
		expect( announcerRegionView._pruneAnnouncementsInterval ).not.to.be.null;

		await editor.destroy();
		editor = null;

		expect( announcerRegionView._pruneAnnouncementsInterval ).to.be.null;
	} );

	describe( 'announce()', () => {
		it( 'should append non-empty announcement', () => {
			announcerRegionView.announce( { announcement: 'Hello World' } );
			expect( queryAllMessages() ).to.be.deep.equal( [ 'Hello World' ] );
		} );

		it( 'should not append empty announcement', () => {
			announcerRegionView.announce( { announcement: '' } );
			expect( queryAllMessages().length ).to.be.equal( 0 );
		} );
	} );

	function queryAllMessages() {
		return [ ...announcerRegionView.element.querySelectorAll( 'div[aria-live] ul li' ) ].map( element => element.innerHTML );
	}
} );
