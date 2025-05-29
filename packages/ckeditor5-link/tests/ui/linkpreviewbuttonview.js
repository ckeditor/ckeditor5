/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import LinkPreviewButtonView from '../../src/ui/linkpreviewbuttonview.js';
import { ButtonView } from '@ckeditor/ckeditor5-ui';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

describe( 'LinkPreviewButtonView', () => {
	let view;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		view = new LinkPreviewButtonView( { t: () => {} } );
		view.render();
		document.body.appendChild( view.element );
	} );

	afterEach( () => {
		view.element.remove();
		view.destroy();
	} );

	it( 'should extend ButtonView', () => {
		expect( view ).to.be.instanceOf( ButtonView );
	} );

	it( 'is an anchor', () => {
		expect( view.element.tagName.toLowerCase() ).to.equal( 'a' );
	} );

	it( 'has a CSS class', () => {
		expect( view.element.classList.contains( 'ck-link-toolbar__preview' ) ).to.be.true;
	} );

	it( 'has a "target" attribute', () => {
		expect( view.element.getAttribute( 'target' ) ).to.equal( '_blank' );
	} );

	it( 'has a "rel" attribute', () => {
		expect( view.element.getAttribute( 'rel' ) ).to.equal( 'noopener noreferrer' );
	} );

	it( 'binds href DOM attribute to view#href', () => {
		expect( view.element.getAttribute( 'href' ) ).to.be.null;

		view.href = 'foo';

		expect( view.element.getAttribute( 'href' ) ).to.equal( 'foo' );
	} );

	it( 'does not trigger `navigate` event if #href is not set', () => {
		const spy = sinon.spy();

		view.on( 'navigate', spy );

		view.href = '';
		view.element.dispatchEvent( new Event( 'click' ) );

		sinon.assert.notCalled( spy );
	} );

	it( 'triggers `navigate` event if #href is set', () => {
		const spy = sinon.spy();

		view.on( 'navigate', spy );

		view.href = 'foo';
		view.element.dispatchEvent( new Event( 'click' ) );

		sinon.assert.calledOnce( spy );
	} );

	it( 'the `navigate` event provides a #href value', () => {
		const spy = sinon.spy();

		view.on( 'navigate', spy );

		view.href = 'foo';
		view.element.dispatchEvent( new Event( 'click' ) );

		sinon.assert.calledOnce( spy );
		expect( spy.firstCall.args[ 1 ] ).to.equal( 'foo' );
	} );

	it( 'the `navigate` event can be canceled', () => {
		const event = new Event( 'click' );

		sinon.stub( event, 'preventDefault' );

		view.on( 'navigate', ( evt, href, cancel ) => cancel() );

		sinon.assert.notCalled( event.preventDefault );

		view.href = 'foo';
		view.element.dispatchEvent( event );

		sinon.assert.calledOnce( event.preventDefault );
	} );
} );
