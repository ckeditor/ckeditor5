/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ImageLoadObserver from '../../src/image/imageloadobserver.js';
import Observer from '@ckeditor/ckeditor5-engine/src/view/observer/observer.js';
import View from '@ckeditor/ckeditor5-engine/src/view/view.js';
import createViewRoot from '@ckeditor/ckeditor5-engine/tests/view/_utils/createroot.js';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';
import { StylesProcessor } from '@ckeditor/ckeditor5-engine/src/view/stylesmap.js';

describe( 'ImageLoadObserver', () => {
	let view, viewDocument, observer, domRoot, viewRoot;

	beforeEach( () => {
		view = new View( new StylesProcessor() );
		viewDocument = view.document;
		observer = view.addObserver( ImageLoadObserver );

		viewRoot = createViewRoot( viewDocument );
		domRoot = document.createElement( 'div' );
		view.attachDomRoot( domRoot );
	} );

	afterEach( () => {
		view.destroy();
	} );

	it( 'should extend Observer', () => {
		expect( observer ).instanceof( Observer );
	} );

	it( 'should fire `loadImage` event for images in the document that are loaded with a delay', () => {
		const spy = sinon.spy();

		viewDocument.on( 'imageLoaded', spy );

		setData( view, '<img src="/assets/sample.png" />' );

		sinon.assert.notCalled( spy );

		domRoot.querySelector( 'img' ).dispatchEvent( new Event( 'load' ) );

		sinon.assert.calledOnce( spy );
	} );

	it( 'should fire `layoutChanged` along with `imageLoaded` event', () => {
		const layoutChangedSpy = sinon.spy();
		const imageLoadedSpy = sinon.spy();

		view.document.on( 'layoutChanged', layoutChangedSpy );
		view.document.on( 'imageLoaded', imageLoadedSpy );

		observer._fireEvents( {} );

		sinon.assert.calledOnce( layoutChangedSpy );
		sinon.assert.calledOnce( imageLoadedSpy );
	} );

	it( 'should not fire events when observer is disabled', () => {
		const layoutChangedSpy = sinon.spy();
		const imageLoadedSpy = sinon.spy();

		view.document.on( 'layoutChanged', layoutChangedSpy );
		view.document.on( 'imageLoaded', imageLoadedSpy );

		observer._isEnabled = false;

		observer._fireEvents( {} );

		sinon.assert.notCalled( layoutChangedSpy );
		sinon.assert.notCalled( imageLoadedSpy );
	} );

	it( 'should not fire `loadImage` event for images removed from document', () => {
		const spy = sinon.spy();

		viewDocument.on( 'imageLoaded', spy );

		setData( view, '<img src="/assets/sample.png" />' );

		sinon.assert.notCalled( spy );

		const img = domRoot.querySelector( 'img' );

		setData( view, '' );

		img.dispatchEvent( new Event( 'load' ) );

		sinon.assert.notCalled( spy );
	} );

	it( 'should not fire `loadImage` event for non-image elements', () => {
		const spy = sinon.spy();

		viewDocument.on( 'imageLoaded', spy );

		setData( view, '<p>foo</p>' );

		sinon.assert.notCalled( spy );

		const img = domRoot.querySelector( 'p' );

		img.dispatchEvent( new Event( 'load' ) );

		sinon.assert.notCalled( spy );
	} );

	it( 'should not fire `loadImage` event if an image has `data-cke-ignore-events` attribute', () => {
		const spy = sinon.spy();

		viewDocument.on( 'imageLoaded', spy );

		setData( view, '<img src="/assets/sample.png" data-cke-ignore-events="true" />' );

		domRoot.querySelector( 'img' ).dispatchEvent( new Event( 'load' ) );

		sinon.assert.notCalled( spy );
	} );

	it( 'should not fire `loadImage` event if an image has an ancestor with `data-cke-ignore-events` attribute', () => {
		const spy = sinon.spy();

		viewDocument.on( 'imageLoaded', spy );

		setData( view, '<div data-cke-ignore-events="true"><p><img src="/assets/sample.png" /></p></div>' );

		domRoot.querySelector( 'img' ).dispatchEvent( new Event( 'load' ) );

		sinon.assert.notCalled( spy );
	} );

	it( 'should do nothing with an image when changes are in the other parent', () => {
		setData(
			view,
			'<container:p><attribute:b>foo</attribute:b></container:p><container:div><img src="/assets/sample.png" /></container:div>'
		);

		const viewP = viewRoot.getChild( 0 );
		const viewDiv = viewRoot.getChild( 1 );

		const mapSpy = sinon.spy( view.domConverter, 'mapViewToDom' );

		// Change only the paragraph.
		view.change( writer => {
			const text = writer.createText( 'foo', { b: true } );

			writer.insert( writer.createPositionAt( viewRoot.getChild( 0 ).getChild( 0 ), 0 ), text );
			writer.wrap( writer.createRangeOn( text ), writer.createAttributeElement( 'b' ) );
		} );

		sinon.assert.calledWith( mapSpy, viewP );
		sinon.assert.neverCalledWith( mapSpy, viewDiv );
	} );

	it( 'should not throw when synced child was removed in the meanwhile', () => {
		let viewDiv;

		const mapSpy = sinon.spy( view.domConverter, 'mapViewToDom' );

		view.change( writer => {
			viewDiv = writer.createContainerElement( 'div' );
			viewRoot.fire( 'change:children', viewDiv );
		} );

		expect( () => {
			view._renderer.render();
			sinon.assert.calledWith( mapSpy, viewDiv );
		} ).to.not.throw();
	} );

	it( 'should stop listening to events on given DOM element', () => {
		const spy = sinon.spy();

		viewDocument.on( 'imageLoaded', spy );

		setData( view, '<img src="/assets/sample.png" />' );

		observer.stopObserving( domRoot );

		domRoot.querySelector( 'img' ).dispatchEvent( new Event( 'load' ) );

		sinon.assert.notCalled( spy );
	} );

	it( 'should stop observing images on destroy', () => {
		const spy = sinon.spy();

		viewDocument.on( 'imageLoaded', spy );

		setData( view, '<img src="/assets/sample.png" />' );

		observer.destroy();

		domRoot.querySelector( 'img' ).dispatchEvent( new Event( 'load' ) );

		sinon.assert.notCalled( spy );
	} );
} );
