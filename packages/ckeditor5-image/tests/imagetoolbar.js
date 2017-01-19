/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global Event */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classic';
import ImageToolbar from '../src/imagetoolbar';
import Image from '../src/image';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import BalloonPanelView from '@ckeditor/ckeditor5-ui/src/balloonpanel/balloonpanelview';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'ImageToolbar', () => {
	let editor, button, editingView, doc, panel;

	beforeEach( () => {
		const editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicEditor.create( editorElement, {
			plugins: [ Image, ImageToolbar, FakeButton ],
			image: {
				toolbar: [ 'fake_button' ]
			}
		} )
		.then( newEditor => {
			editor = newEditor;
			editingView = editor.editing.view;
			doc = editor.document;
			panel = getBalloonPanelView( editor.ui.view.body );
		} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( ImageToolbar ) ).to.be.instanceOf( ImageToolbar );
	} );

	it( 'should initialize image.defaultToolbar to an empty array', () => {
		expect( editor.config.get( 'image.defaultToolbar' ) ).to.eql( [] );
	} );

	it( 'should not initialize if there is no configuration', () => {
		const editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicEditor.create( editorElement, {
			plugins: [ ImageToolbar ],
		} )
			.then( newEditor => {
				const viewBody = newEditor.ui.view.body;
				expect( getBalloonPanelView( viewBody ) ).to.be.undefined;

				newEditor.destroy();
			} );
	} );

	it( 'should allow other plugins to alter default config', () => {
		const editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicEditor.create( editorElement, {
			plugins: [ ImageToolbar, FakeButton, AlterDefaultConfig ]
		} )
			.then( newEditor => {
				const panel = getBalloonPanelView( newEditor.ui.view.body );
				const toolbar = panel.content.get( 0 );
				const button = toolbar.items.get( 0 );

				expect( newEditor.config.get( 'image.defaultToolbar' ) ).to.eql( [ 'fake_button' ] );
				expect( button.label ).to.equal( 'fake button' );

				newEditor.destroy();
			} );
	} );

	it( 'should add BalloonPanelView to view body', () => {
		expect( panel ).to.be.instanceOf( BalloonPanelView );
	} );

	it( 'should attach toolbar when image is selected', () => {
		const spy = sinon.spy( panel, 'attachTo' );
		setData( doc, '[<image src=""></image>]' );

		testPanelAttach( spy );
	} );

	it( 'should calculate panel position on scroll event', () => {
		setData( doc, '[<image src=""></image>]' );
		const spy = sinon.spy( panel, 'attachTo' );

		global.window.dispatchEvent( new Event( 'scroll' ) );

		testPanelAttach( spy );
	} );

	it( 'should calculate panel position on resize event', () => {
		setData( doc, '[<image src=""></image>]' );
		const spy = sinon.spy( panel, 'attachTo' );

		global.window.dispatchEvent( new Event( 'resize' ) );

		testPanelAttach( spy );
	} );

	it( 'should not calculate panel position on scroll if no image is selected', () => {
		setData( doc, '<image src=""></image>' );
		const spy = sinon.spy( panel, 'attachTo' );

		global.window.dispatchEvent( new Event( 'scroll' ) );

		sinon.assert.notCalled( spy );
	} );

	it( 'should not calculate panel position on resize if no image is selected', () => {
		setData( doc, '<image src=""></image>' );
		const spy = sinon.spy( panel, 'attachTo' );

		global.window.dispatchEvent( new Event( 'resize' ) );

		sinon.assert.notCalled( spy );
	} );

	it( 'should hide the panel when editor looses focus', () => {
		setData( doc, '[<image src=""></image>]' );
		editor.ui.focusTracker.isFocused = true;
		const spy = sinon.spy( panel, 'hide' );
		editor.ui.focusTracker.isFocused = false;

		sinon.assert.calledOnce( spy );
	} );

	// Returns BalloonPanelView from provided collection.
	function getBalloonPanelView( viewCollection ) {
		return viewCollection.find( item => item instanceof BalloonPanelView );
	}

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

		// Check if north/south calculation is correct.
		const [ north, south ] = options.positions;
		const targetRect = { top: 10, left: 20, width: 200, height: 100, bottom: 110, right: 220 };
		const balloonRect = { width: 50, height: 20 };

		const northPosition = north( targetRect, balloonRect );
		expect( northPosition.name ).to.equal( 'n' );
		expect( northPosition.top ).to.equal( targetRect.top - balloonRect.height - BalloonPanelView.arrowVerticalOffset );
		expect( northPosition.left ).to.equal( targetRect.left + targetRect.width / 2 - balloonRect.width / 2 );

		const southPosition = south( targetRect, balloonRect );
		expect( southPosition.name ).to.equal( 's' );
		expect( southPosition.top ).to.equal( targetRect.bottom + BalloonPanelView.arrowVerticalOffset );
		expect( southPosition.left ).to.equal( targetRect.left + targetRect.width / 2 - balloonRect.width / 2 );
	}

	// Plugin that adds fake_button to editor's component factory.
	class FakeButton extends Plugin {
		init() {
			this.editor.ui.componentFactory.add( 'fake_button', ( locale ) => {
				const view = new ButtonView( locale );

				view.set( {
					label: 'fake button'
				} );

				button = view;

				return view;
			} );
		}
	}

	class AlterDefaultConfig extends Plugin {
		init() {
			const defaultImageToolbarConfig = this.editor.config.get( 'image.defaultToolbar' );

			if ( defaultImageToolbarConfig ) {
				defaultImageToolbarConfig.push( 'fake_button' );
			}
		}
	}
} );
