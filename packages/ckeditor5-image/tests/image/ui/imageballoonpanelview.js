/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global Event */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classic';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import ImageBalloonPanel from '../../../src/image/ui/imageballoonpanelview';
import BalloonPanelView from '@ckeditor/ckeditor5-ui/src/panel/balloon/balloonpanelview';
import ImageEngine from '../../../src/image/imageengine';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'ImageBalloonPanel', () => {
	let editor, panel, document, editingView;

	beforeEach( () => {
		const editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicEditor.create( editorElement, {
			plugins: [ ImageEngine ]
		} )
			.then( newEditor => {
				editor = newEditor;
				panel = new ImageBalloonPanel( editor );
				document = editor.document;
				editingView = editor.editing.view;

				return editor.ui.view.body.add( panel );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'init method should return a promise', () => {
		const panel = new ImageBalloonPanel( editor );
		const promise  = panel.init();

		expect( promise ).to.be.instanceof( Promise );

		return promise;
	} );

	it( 'should add element to editor\'s focus tracker after init', () => {
		const spy = sinon.spy( editor.ui.focusTracker, 'add' );
		const panel = new ImageBalloonPanel( editor );

		sinon.assert.notCalled( spy );

		return panel.init().then( () => {
			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, panel.element );
		} );
	} );

	it( 'should detach panel when focus is removed', () => {
		const spy = sinon.spy( panel, 'detach' );
		editor.ui.focusTracker.isFocused = true;
		editor.ui.focusTracker.isFocused = false;

		sinon.assert.calledOnce( spy );
	} );

	it( 'should detach when image element is no longer selected', () => {
		const spy = sinon.spy( panel, 'detach' );
		setData( document, '[<image src=""></image>]' );
		panel.attach();

		document.enqueueChanges( () => {
			document.selection.removeAllRanges();
		} );

		sinon.assert.calledOnce( spy );
	} );

	it( 'should attach panel correctly', () => {
		const spy = sinon.spy( panel, 'attachTo' );
		panel.attach();

		testPanelAttach( spy );
	} );

	it( 'should calculate panel position on scroll event', () => {
		panel.attach();
		const spy = sinon.spy( panel, 'attachTo' );

		global.window.dispatchEvent( new Event( 'scroll' ) );

		testPanelAttach( spy );
	} );

	it( 'should calculate panel position on resize event event', () => {
		panel.attach();
		const spy = sinon.spy( panel, 'attachTo' );

		global.window.dispatchEvent( new Event( 'resize' ) );

		testPanelAttach( spy );
	} );

	it( 'should hide panel on detach', () => {
		panel.attach();
		const spy = sinon.spy( panel, 'hide' );

		panel.detach();

		sinon.assert.calledOnce( spy );
	} );

	it( 'should not reposition panel after detaching', () => {
		panel.attach();
		const spy = sinon.spy( panel, 'attachTo' );

		panel.detach();
		global.window.dispatchEvent( new Event( 'resize' ) );
		global.window.dispatchEvent( new Event( 'scroll' ) );

		sinon.assert.notCalled( spy );
	} );

	// Tests if panel.attachTo() was called correctly.
	function testPanelAttach( spy ) {
		const domRange = editor.editing.view.domConverter.viewRangeToDom( editingView.selection.getFirstRange() );

		sinon.assert.calledOnce( spy );
		const options = spy.firstCall.args[ 0 ];

		// Check if proper range was used.
		expect( options.target.startContainer ).to.equal( domRange.startContainer );
		expect( options.target.startOffset ).to.equal( domRange.startOffset );
		expect( options.target.endContainer ).to.equal( domRange.endContainer );
		expect( options.target.endOffset ).to.equal( domRange.endOffset );

		// Check if correct positions are used.
		const [ north, south ] = options.positions;

		expect( north ).to.equal( BalloonPanelView.defaultPositions.northArrowSouth );
		expect( south ).to.equal( BalloonPanelView.defaultPositions.southArrowNorth );
	}
} );
