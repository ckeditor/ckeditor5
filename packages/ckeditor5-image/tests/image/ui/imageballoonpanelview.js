/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global window, document, Event */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import ImageEngine from '../../../src/image/imageengine';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import ImageBalloonPanel from '../../../src/image/ui/imageballoonpanelview';
import BalloonPanelView from '@ckeditor/ckeditor5-ui/src/panel/balloon/balloonpanelview';

import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'ImageBalloonPanel', () => {
	let editor, panel, doc, editorElement;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicEditor
			.create( editorElement, {
				plugins: [ ImageEngine, Paragraph ]
			} )
			.then( newEditor => {
				editor = newEditor;
				panel = new ImageBalloonPanel( editor );
				doc = editor.document;

				return editor.ui.view.body.add( panel );
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should add element to editor\'s focus tracker after init', () => {
		const spy = sinon.spy( editor.ui.focusTracker, 'add' );
		const panel = new ImageBalloonPanel( editor );

		sinon.assert.notCalled( spy );

		panel.init();
		sinon.assert.calledOnce( spy );
		sinon.assert.calledWithExactly( spy, panel.element );
	} );

	it( 'should detach panel when focus is removed', () => {
		const spy = sinon.spy( panel, 'detach' );
		editor.ui.focusTracker.isFocused = true;
		editor.ui.focusTracker.isFocused = false;

		sinon.assert.calledOnce( spy );
	} );

	it( 'should detach when image element is no longer selected', () => {
		const spy = sinon.spy( panel, 'detach' );

		setData( doc, '<paragraph>foo</paragraph>[<image src=""></image>]' );
		panel.attach();

		doc.enqueueChanges( () => {
			doc.selection.removeAllRanges();
		} );

		sinon.assert.calledOnce( spy );
	} );

	it( 'should attach panel correctly', () => {
		const spy = sinon.spy( panel, 'attachTo' );

		setData( doc, '[<image src=""></image>]' );
		panel.attach();

		testPanelAttach( spy );
	} );

	it( 'should calculate panel position on scroll event', () => {
		setData( doc, '[<image src=""></image>]' );
		panel.attach();

		const spy = sinon.spy( panel, 'attachTo' );

		window.dispatchEvent( new Event( 'scroll' ) );

		testPanelAttach( spy );
	} );

	it( 'should calculate panel position on resize event event', () => {
		setData( doc, '[<image src=""></image>]' );
		panel.attach();

		const spy = sinon.spy( panel, 'attachTo' );

		window.dispatchEvent( new Event( 'resize' ) );

		testPanelAttach( spy );
	} );

	it( 'should hide panel on detach', () => {
		setData( doc, '[<image src=""></image>]' );
		panel.attach();

		const spy = sinon.spy( panel, 'hide' );

		panel.detach();

		sinon.assert.calledOnce( spy );
	} );

	it( 'should not reposition panel after detaching', () => {
		setData( doc, '[<image src=""></image>]' );
		panel.attach();

		const spy = sinon.spy( panel, 'attachTo' );

		panel.detach();
		window.dispatchEvent( new Event( 'resize' ) );
		window.dispatchEvent( new Event( 'scroll' ) );

		sinon.assert.notCalled( spy );
	} );

	// Tests if panel.attachTo() was called correctly.
	function testPanelAttach( spy ) {
		sinon.assert.calledOnce( spy );
		const options = spy.firstCall.args[ 0 ];

		// Check if proper target element was used.
		expect( options.target.tagName.toLowerCase() ).to.equal( 'figure' );

		// Check if correct positions are used.
		const [ north, south ] = options.positions;

		expect( north ).to.equal( BalloonPanelView.defaultPositions.northArrowSouth );
		expect( south ).to.equal( BalloonPanelView.defaultPositions.southArrowNorth );
	}
} );
