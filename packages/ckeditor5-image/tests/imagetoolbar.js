/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ImageToolbar from '../src/imagetoolbar';
import Image from '../src/image';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Range from '@ckeditor/ckeditor5-engine/src/model/range';
import View from '@ckeditor/ckeditor5-ui/src/view';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'ImageToolbar', () => {
	let editor, doc, editingView, plugin, toolbar, balloon, editorElement;

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicEditor
			.create( editorElement, {
				plugins: [ Paragraph, Image, ImageToolbar, FakeButton ],
				image: {
					toolbar: [ 'fake_button' ]
				}
			} )
			.then( newEditor => {
				editor = newEditor;
				doc = editor.document;
				plugin = editor.plugins.get( ImageToolbar );
				toolbar = plugin._toolbar;
				editingView = editor.editing.view;
				balloon = editor.plugins.get( 'ContextualBalloon' );
			} );
	} );

	afterEach( () => {
		editorElement.remove();

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
			.then( editor => {
				expect( editor.plugins.get( ImageToolbar )._toolbar ).to.be.undefined;

				editorElement.remove();
				editor.destroy();
			} );
	} );

	describe( 'toolbar', () => {
		it( 'should use the config.image.toolbar to create items', () => {
			expect( toolbar.items ).to.have.length( 1 );
			expect( toolbar.items.get( 0 ).label ).to.equal( 'fake button' );
		} );

		it( 'should set proper CSS classes', () => {
			const spy = sinon.spy( balloon, 'add' );

			editor.ui.focusTracker.isFocused = true;

			setData( doc, '[<image src=""></image>]' );

			expect( toolbar.element.classList.contains( 'ck-editor-toolbar' ) ).to.be.true;

			sinon.assert.calledWithMatch( spy, {
				view: toolbar,
				balloonClassName: 'ck-toolbar-container ck-editor-toolbar-container'
			} );
		} );
	} );

	describe( 'integration with the editor focus', () => {
		it( 'should show the toolbar when the editor gains focus and the image is selected', () => {
			editor.ui.focusTracker.isFocused = true;

			setData( doc, '[<image src=""></image>]' );

			editor.ui.focusTracker.isFocused = false;
			expect( balloon.visibleView ).to.be.null;

			editor.ui.focusTracker.isFocused = true;
			expect( balloon.visibleView ).to.equal( toolbar );
		} );

		it( 'should hide the toolbar when the editor loses focus and the image is selected', () => {
			editor.ui.focusTracker.isFocused = false;

			setData( doc, '[<image src=""></image>]' );

			editor.ui.focusTracker.isFocused = true;
			expect( balloon.visibleView ).to.equal( toolbar );

			editor.ui.focusTracker.isFocused = false;
			expect( balloon.visibleView ).to.be.null;
		} );
	} );

	describe( 'integration with the editor selection (#render event)', () => {
		beforeEach( () => {
			editor.ui.focusTracker.isFocused = true;
		} );

		it( 'should show the toolbar on render when the image is selected', () => {
			setData( doc, '<paragraph>[foo]</paragraph><image src=""></image>' );

			expect( balloon.visibleView ).to.be.null;

			editingView.fire( 'render' );
			expect( balloon.visibleView ).to.be.null;

			doc.enqueueChanges( () => {
				// Select the [<image></image>]
				doc.selection.setRanges( [
					Range.createOn( doc.getRoot().getChild( 1 ) )
				] );
			} );

			expect( balloon.visibleView ).to.equal( toolbar );

			// Make sure successive render does not throw, e.g. attempting
			// to insert the toolbar twice.
			editingView.fire( 'render' );
			expect( balloon.visibleView ).to.equal( toolbar );
		} );

		it( 'should not engage when the toolbar is in the balloon yet invisible', () => {
			setData( doc, '[<image src=""></image>]' );
			expect( balloon.visibleView ).to.equal( toolbar );

			const lastView = new View();
			lastView.element = document.createElement( 'div' );

			balloon.add( { view: lastView } );
			expect( balloon.visibleView ).to.equal( lastView );

			editingView.fire( 'render' );
			expect( balloon.visibleView ).to.equal( lastView );
		} );

		it( 'should hide the toolbar on render if the image is de–selected', () => {
			setData( doc, '<paragraph>foo</paragraph>[<image src=""></image>]' );

			expect( balloon.visibleView ).to.equal( toolbar );

			doc.enqueueChanges( () => {
				// Select the <paragraph>[...]</paragraph>
				doc.selection.setRanges( [
					Range.createIn( doc.getRoot().getChild( 0 ) )
				] );
			} );

			expect( balloon.visibleView ).to.be.null;

			// Make sure successive render does not throw, e.g. attempting
			// to remove the toolbar twice.
			editingView.fire( 'render' );
			expect( balloon.visibleView ).to.be.null;
		} );
	} );

	// Plugin that adds fake_button to editor's component factory.
	class FakeButton extends Plugin {
		init() {
			this.editor.ui.componentFactory.add( 'fake_button', locale => {
				const view = new ButtonView( locale );

				view.set( {
					label: 'fake button'
				} );

				return view;
			} );
		}
	}
} );
