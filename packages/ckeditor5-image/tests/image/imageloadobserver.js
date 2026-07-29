/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ImageLoadObserver } from '../../src/image/imageloadobserver.js';
import { Observer, EditingView, _setViewData, StylesProcessor } from '@ckeditor/ckeditor5-engine';
import { createViewRoot } from '@ckeditor/ckeditor5-engine/tests/view/_utils/createroot.js';

describe( 'ImageLoadObserver', () => {
	let view, viewDocument, observer, domRoot, viewRoot;

	beforeEach( () => {
		view = new EditingView( new StylesProcessor() );
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
		expect( observer ).toBeInstanceOf( Observer );
	} );

	it( 'should fire `loadImage` event for images in the document that are loaded with a delay', () => {
		const spy = vi.fn();

		viewDocument.on( 'imageLoaded', spy );

		_setViewData( view, '<img src="/sample.png" />' );

		expect( spy ).not.toHaveBeenCalled();

		domRoot.querySelector( 'img' ).dispatchEvent( new Event( 'load' ) );

		expect( spy ).toHaveBeenCalledOnce();
	} );

	it( 'should fire `layoutChanged` along with `imageLoaded` event', () => {
		const layoutChangedSpy = vi.fn();
		const imageLoadedSpy = vi.fn();

		view.document.on( 'layoutChanged', layoutChangedSpy );
		view.document.on( 'imageLoaded', imageLoadedSpy );

		observer._fireEvents( {} );

		expect( layoutChangedSpy ).toHaveBeenCalledOnce();
		expect( imageLoadedSpy ).toHaveBeenCalledOnce();
	} );

	it( 'should not fire events when observer is disabled', () => {
		const layoutChangedSpy = vi.fn();
		const imageLoadedSpy = vi.fn();

		view.document.on( 'layoutChanged', layoutChangedSpy );
		view.document.on( 'imageLoaded', imageLoadedSpy );

		observer._isEnabled = false;

		observer._fireEvents( {} );

		expect( layoutChangedSpy ).not.toHaveBeenCalled();
		expect( imageLoadedSpy ).not.toHaveBeenCalled();
	} );

	it( 'should not fire `loadImage` event for images removed from document', () => {
		const spy = vi.fn();

		viewDocument.on( 'imageLoaded', spy );

		_setViewData( view, '<img src="/sample.png" />' );

		expect( spy ).not.toHaveBeenCalled();

		const img = domRoot.querySelector( 'img' );

		_setViewData( view, '' );

		img.dispatchEvent( new Event( 'load' ) );

		expect( spy ).not.toHaveBeenCalled();
	} );

	it( 'should not fire `loadImage` event for non-image elements', () => {
		const spy = vi.fn();

		viewDocument.on( 'imageLoaded', spy );

		_setViewData( view, '<p>foo</p>' );

		expect( spy ).not.toHaveBeenCalled();

		const img = domRoot.querySelector( 'p' );

		img.dispatchEvent( new Event( 'load' ) );

		expect( spy ).not.toHaveBeenCalled();
	} );

	it( 'should not fire `imageLoaded` event when a load event fires on a non-IMG element via observe path', () => {
		const spy = vi.fn();

		viewDocument.on( 'imageLoaded', spy );

		const video = document.createElement( 'video' );
		domRoot.appendChild( video );

		video.dispatchEvent( new Event( 'load', { bubbles: true } ) );

		expect( spy ).not.toHaveBeenCalled();

		domRoot.removeChild( video );
	} );

	it( 'should not fire `imageLoaded` event via observe path when observer is disabled', () => {
		const spy = vi.fn();

		viewDocument.on( 'imageLoaded', spy );

		_setViewData( view, '<img src="/sample.png" />' );

		observer.disable();

		domRoot.querySelector( 'img' ).dispatchEvent( new Event( 'load' ) );

		expect( spy ).not.toHaveBeenCalled();
	} );

	it( 'should not fire `imageLoaded` event via observe path when element has `data-cke-ignore-events` attribute', () => {
		const spy = vi.fn();

		viewDocument.on( 'imageLoaded', spy );

		const img = document.createElement( 'img' );
		img.setAttribute( 'data-cke-ignore-events', 'true' );
		domRoot.appendChild( img );

		img.dispatchEvent( new Event( 'load', { bubbles: true } ) );

		expect( spy ).not.toHaveBeenCalled();

		domRoot.removeChild( img );
	} );

	it( 'should not fire `loadImage` event if an image has `data-cke-ignore-events` attribute', () => {
		const spy = vi.fn();

		viewDocument.on( 'imageLoaded', spy );

		_setViewData( view, '<img src="/sample.png" data-cke-ignore-events="true" />' );

		domRoot.querySelector( 'img' ).dispatchEvent( new Event( 'load' ) );

		expect( spy ).not.toHaveBeenCalled();
	} );

	it( 'should not fire `loadImage` event if an image has an ancestor with `data-cke-ignore-events` attribute', () => {
		const spy = vi.fn();

		viewDocument.on( 'imageLoaded', spy );

		_setViewData( view, '<div data-cke-ignore-events="true"><p><img src="/sample.png" /></p></div>' );

		domRoot.querySelector( 'img' ).dispatchEvent( new Event( 'load' ) );

		expect( spy ).not.toHaveBeenCalled();
	} );

	it( 'should do nothing with an image when changes are in the other parent', () => {
		_setViewData(
			view,
			'<container:p><attribute:b>foo</attribute:b></container:p><container:div><img src="/sample.png" /></container:div>'
		);

		const viewP = viewRoot.getChild( 0 );
		const viewDiv = viewRoot.getChild( 1 );

		const mapSpy = vi.spyOn( view.domConverter, 'mapViewToDom' );

		// Change only the paragraph.
		view.change( writer => {
			const text = writer.createText( 'foo', { b: true } );

			writer.insert( writer.createPositionAt( viewRoot.getChild( 0 ).getChild( 0 ), 0 ), text );
			writer.wrap( writer.createRangeOn( text ), writer.createAttributeElement( 'b' ) );
		} );

		expect( mapSpy ).toHaveBeenCalledWith( viewP );
		expect( mapSpy ).not.toHaveBeenCalledWith( viewDiv );
	} );

	it( 'should not throw when synced child was removed in the meanwhile', () => {
		let viewDiv;

		const mapSpy = vi.spyOn( view.domConverter, 'mapViewToDom' );

		view.change( writer => {
			viewDiv = writer.createContainerElement( 'div' );
			viewRoot.fire( 'change:children', viewDiv );
		} );

		expect( () => {
			view._renderer.render();
			expect( mapSpy ).toHaveBeenCalledWith( viewDiv );
		} ).not.toThrow();
	} );

	it( 'should stop listening to events on given DOM element', () => {
		const spy = vi.fn();

		viewDocument.on( 'imageLoaded', spy );

		_setViewData( view, '<img src="/sample.png" />' );

		observer.stopObserving( domRoot );

		domRoot.querySelector( 'img' ).dispatchEvent( new Event( 'load' ) );

		expect( spy ).not.toHaveBeenCalled();
	} );

	it( 'should stop observing images on destroy', () => {
		const spy = vi.fn();

		viewDocument.on( 'imageLoaded', spy );

		_setViewData( view, '<img src="/sample.png" />' );

		observer.destroy();

		domRoot.querySelector( 'img' ).dispatchEvent( new Event( 'load' ) );

		expect( spy ).not.toHaveBeenCalled();
	} );
} );
