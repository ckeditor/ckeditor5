/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ImageToolbar from '../src/imagetoolbar';
import Image from '../src/image';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import View from '@ckeditor/ckeditor5-ui/src/view';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import env from '@ckeditor/ckeditor5-utils/src/env';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'ImageToolbar', () => {
	let editor, model, doc, toolbar, balloon, widgetToolbarRepository, editorElement;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		// Most tests assume non-edge environment but we do not set `contenteditable=false` on Edge so stub `env.isEdge`.
		testUtils.sinon.stub( env, 'isEdge' ).get( () => false );

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
				model = newEditor.model;
				doc = model.document;
				widgetToolbarRepository = editor.plugins.get( 'WidgetToolbarRepository' );
				toolbar = widgetToolbarRepository._toolbarDefinitions.get( 'image' ).view;
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
			plugins: [ ImageToolbar ]
		} )
			.then( editor => {
				expect( editor.plugins.get( ImageToolbar )._toolbar ).to.be.undefined;

				editorElement.remove();
				return editor.destroy();
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

			setData( model, '[<image src=""></image>]' );

			sinon.assert.calledWithMatch( spy, {
				view: toolbar,
				balloonClassName: 'ck-toolbar-container'
			} );
		} );

		it( 'should set aria-label attribute', () => {
			toolbar.render();

			expect( toolbar.element.getAttribute( 'aria-label' ) ).to.equal( 'Image toolbar' );

			toolbar.destroy();
		} );
	} );

	describe( 'integration with the editor focus', () => {
		it( 'should show the toolbar when the editor gains focus and the image is selected', () => {
			editor.ui.focusTracker.isFocused = true;

			setData( model, '[<image src=""></image>]' );

			editor.ui.focusTracker.isFocused = false;
			expect( balloon.visibleView ).to.be.null;

			editor.ui.focusTracker.isFocused = true;
			expect( balloon.visibleView ).to.equal( toolbar );
		} );

		it( 'should hide the toolbar when the editor loses focus and the image is selected', () => {
			editor.ui.focusTracker.isFocused = false;

			setData( model, '[<image src=""></image>]' );

			editor.ui.focusTracker.isFocused = true;
			expect( balloon.visibleView ).to.equal( toolbar );

			editor.ui.focusTracker.isFocused = false;
			expect( balloon.visibleView ).to.be.null;
		} );
	} );

	describe( 'integration with the editor selection', () => {
		beforeEach( () => {
			editor.ui.focusTracker.isFocused = true;
		} );

		it( 'should show the toolbar on ui#update when the image is selected', () => {
			setData( model, '<paragraph>[foo]</paragraph><image src=""></image>' );

			expect( balloon.visibleView ).to.be.null;

			editor.ui.fire( 'update' );

			expect( balloon.visibleView ).to.be.null;

			model.change( writer => {
				// Select the [<image></image>]
				writer.setSelection(
					writer.createRangeOn( doc.getRoot().getChild( 1 ) )
				);
			} );

			expect( balloon.visibleView ).to.equal( toolbar );

			// Make sure successive change does not throw, e.g. attempting
			// to insert the toolbar twice.
			editor.ui.fire( 'update' );
			expect( balloon.visibleView ).to.equal( toolbar );
		} );

		it( 'should not engage when the toolbar is in the balloon yet invisible', () => {
			setData( model, '[<image src=""></image>]' );

			expect( balloon.visibleView ).to.equal( toolbar );

			const lastView = new View();
			lastView.element = document.createElement( 'div' );

			balloon.add( {
				view: lastView,
				position: {
					target: document.body
				}
			} );

			expect( balloon.visibleView ).to.equal( lastView );

			editor.ui.fire( 'update' );

			expect( balloon.visibleView ).to.equal( lastView );
		} );

		it( 'should hide the toolbar on ui#update if the image is de–selected', () => {
			setData( model, '<paragraph>foo</paragraph>[<image src=""></image>]' );

			expect( balloon.visibleView ).to.equal( toolbar );

			model.change( writer => {
				// Select the <paragraph>[...]</paragraph>
				writer.setSelection(
					writer.createRangeIn( doc.getRoot().getChild( 0 ) )
				);
			} );

			expect( balloon.visibleView ).to.be.null;

			// Make sure successive change does not throw, e.g. attempting
			// to remove the toolbar twice.
			editor.ui.fire( 'update' );
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
