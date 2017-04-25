/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classic';
import ImageToolbar from '../src/imagetoolbar';
import Image from '../src/image';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import ImageBalloonPanel from '../src/image/ui/imageballoonpanelview';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'ImageToolbar', () => {
	let editor, button, editingView, doc, panel, plugin;

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
			plugin = editor.plugins.get( ImageToolbar );
			panel = plugin._panel;
		} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( ImageToolbar ) ).to.be.instanceOf( ImageToolbar );
	} );

	it( 'should not initialize if there is no configuration', () => {
		const editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicEditor.create( editorElement, {
			plugins: [ ImageToolbar ],
		} )
			.then( newEditor => {
				expect( newEditor.plugins.get( ImageToolbar )._panel ).to.be.undefined;

				newEditor.destroy();
			} );
	} );

	it( 'should set css classes', () => {
		expect( panel.element.classList.contains( 'ck-toolbar-container' ) ).to.be.true;
		expect( panel.content.get( 0 ).element.classList.contains( 'ck-editor-toolbar' ) ).to.be.true;
	} );

	it( 'should add ImageBalloonPanel to view body', () => {
		expect( panel ).to.be.instanceOf( ImageBalloonPanel );
	} );

	it( 'should show the panel when editor gains focus and image is selected', () => {
		setData( doc, '[<image src=""></image>]' );

		editor.ui.focusTracker.isFocused = false;
		const spy = sinon.spy( plugin, 'show' );
		editor.ui.focusTracker.isFocused = true;

		sinon.assert.calledOnce( spy );
	} );

	it( 'should not show the panel automatically when it is disabled', () => {
		plugin.isEnabled = false;
		setData( doc, '[<image src=""></image>]' );
		editor.ui.focusTracker.isFocused = true;
		const spy = sinon.spy( plugin, 'show' );

		editingView.render();

		sinon.assert.notCalled( spy );
	} );

	it( 'should not show the panel when editor looses focus', () => {
		editor.ui.focusTracker.isFocused = true;
		const spy = sinon.spy( plugin, 'show' );
		editor.ui.focusTracker.isFocused = false;

		sinon.assert.notCalled( spy );
	} );

	it( 'should detach panel with hide() method', () => {
		const spy = sinon.spy( panel, 'detach' );
		plugin.hide();

		sinon.assert.calledOnce( spy );
	} );

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
} );
