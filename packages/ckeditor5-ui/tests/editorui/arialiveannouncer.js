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
			expect( announcer.view ).to.be.undefined;

			announcer.announce( 'foo', 'bar' );

			expect( announcer.view ).to.be.instanceOf( AriaLiveAnnouncerView );
			expect( announcer.view.regionViews.length ).to.equal( 1 );
			expect( editor.ui.view.body.has( announcer.view ) ).to.be.true;
		} );

		it( 'should create the view from template upon first use', () => {
			announcer.announce( 'foo', 'bar' );

			expect( announcer.view.element.tagName ).to.equal( 'DIV' );
			expect( announcer.view.element.className.includes( 'ck' ) ).to.be.true;
			expect( announcer.view.element.className.includes( 'ck-aria-live-announcer' ) ).to.be.true;
		} );

		it( 'should create a new region (if does not exist) and set its text', () => {
			announcer.announce( 'foo', 'bar' );

			expect( announcer.view.regionViews.length ).to.equal( 1 );

			const firstRegion = announcer.view.regionViews.first;

			expect( firstRegion ).to.be.instanceOf( AriaLiveAnnouncerRegionView );
			expect( firstRegion.regionName ).to.equal( 'foo' );
			expect( firstRegion.text ).to.equal( 'bar' );
			expect( firstRegion.politeness ).to.equal( 'polite' );
			expect( firstRegion.element.parentNode ).to.equal( announcer.view.element );

			expect( firstRegion.element.getAttribute( 'role' ) ).to.equal( 'region' );
			expect( firstRegion.element.getAttribute( 'aria-live' ) ).to.equal( 'polite' );
			expect( firstRegion.element.innerHTML ).to.equal( 'bar' );
			expect( firstRegion.element.dataset.region ).to.equal( 'foo' );
		} );

		it( 'should set a new text in an existing region', () => {
			announcer.announce( 'foo', 'bar' );
			announcer.announce( 'foo', 'baz' );

			expect( announcer.view.regionViews.length ).to.equal( 1 );

			const firstRegion = announcer.view.regionViews.first;

			expect( firstRegion ).to.be.instanceOf( AriaLiveAnnouncerRegionView );
			expect( firstRegion.regionName ).to.equal( 'foo' );
			expect( firstRegion.text ).to.equal( 'baz' );
			expect( firstRegion.politeness ).to.equal( 'polite' );
			expect( firstRegion.element.parentNode ).to.equal( announcer.view.element );

			expect( firstRegion.element.getAttribute( 'role' ) ).to.equal( 'region' );
			expect( firstRegion.element.getAttribute( 'aria-live' ) ).to.equal( 'polite' );
			expect( firstRegion.element.innerHTML ).to.equal( 'baz' );
			expect( firstRegion.element.dataset.region ).to.equal( 'foo' );
		} );

		it( 'should be able to create more than a single region', () => {
			announcer.announce( 'foo', 'bar' );
			announcer.announce( 'baz', 'qux' );

			expect( announcer.view.regionViews.length ).to.equal( 2 );

			const firstRegion = announcer.view.regionViews.first;
			const lastRegion = announcer.view.regionViews.last;

			expect( firstRegion.regionName ).to.equal( 'foo' );
			expect( firstRegion.text ).to.equal( 'bar' );
			expect( firstRegion.politeness ).to.equal( 'polite' );
			expect( firstRegion.element.parentNode ).to.equal( announcer.view.element );

			expect( lastRegion.regionName ).to.equal( 'baz' );
			expect( lastRegion.text ).to.equal( 'qux' );
			expect( lastRegion.politeness ).to.equal( 'polite' );
			expect( lastRegion.element.parentNode ).to.equal( announcer.view.element );
		} );

		it( 'should be able to set the politeness of the announcement', () => {
			announcer.announce( 'foo', 'bar', 'assertive' );

			const firstRegion = announcer.view.regionViews.first;

			expect( firstRegion.politeness ).to.equal( 'assertive' );
			expect( firstRegion.element.getAttribute( 'aria-live' ) ).to.equal( 'assertive' );
		} );
	} );
} );
