/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import LinkImage from '@ckeditor/ckeditor5-link/src/linkimage.js';
import ImageToolbar from '../src/imagetoolbar.js';
import ImageCaption from '../src/imagecaption.js';
import Image from '../src/image.js';
import global from '@ckeditor/ckeditor5-utils/src/dom/global.js';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin.js';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import View from '@ckeditor/ckeditor5-ui/src/view.js';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import ImageStyle from '../src/imagestyle.js';

describe( 'ImageToolbar', () => {
	let editor, model, doc, toolbar, balloon, widgetToolbarRepository, editorElement;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicEditor
			.create( editorElement, {
				plugins: [ Paragraph, Image, ImageToolbar, ImageCaption, LinkImage, FakeButton, ImageStyle ],
				image: {
					toolbar: [
						'fake_button',
						{
							name: 'imageStyle:fake_dropdown',
							items: [ 'imageStyle:block' ],
							defaultItem: 'imageStyle:block',
							title: 'Fake dropdown'
						}
					]
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

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ImageToolbar.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ImageToolbar.isPremiumPlugin ).to.be.false;
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( ImageToolbar ) ).to.be.instanceOf( ImageToolbar );
	} );

	it( 'should not initialize if there is no configuration', () => {
		const consoleWarnStub = sinon.stub( console, 'warn' );
		const editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicEditor.create( editorElement, {
			plugins: [ ImageToolbar ]
		} )
			.then( editor => {
				expect( editor.plugins.get( ImageToolbar )._toolbar ).to.be.undefined;
				expect( consoleWarnStub.calledOnce ).to.equal( true );
				expect( consoleWarnStub.firstCall.args[ 0 ] ).to.match( /widget-toolbar-no-items/ );

				editorElement.remove();
				return editor.destroy();
			} );
	} );

	describe( 'toolbar', () => {
		it( 'should use the config.image.toolbar to create items', () => {
			// Make sure that toolbar is empty before first show.
			expect( toolbar.items.length ).to.equal( 0 );

			editor.ui.focusTracker.isFocused = true;

			setData( model, '[<imageBlock src=""></imageBlock>]' );

			expect( toolbar.items ).to.have.length( 2 );
			expect( toolbar.items.get( 0 ).label ).to.equal( 'fake button' );
		} );

		it( 'should convert the declarative dropdown definition to the component factory item name', () => {
			// Make sure that toolbar is empty before first show.
			expect( toolbar.items.length ).to.equal( 0 );

			editor.ui.focusTracker.isFocused = true;

			setData( model, '[<imageBlock src=""></imageBlock>]' );

			expect( toolbar.items.get( 1 ).buttonView.label ).to.equal( 'Fake dropdown: Centered image' );
			expect( toolbar.items.get( 1 ).buttonView.arrowView.label ).to.equal( 'Fake dropdown' );
		} );

		it( 'should set proper CSS classes', () => {
			const spy = sinon.spy( balloon, 'add' );

			editor.ui.focusTracker.isFocused = true;

			setData( model, '[<imageBlock src=""></imageBlock>]' );

			sinon.assert.calledWithMatch( spy, sinon.match( ( { balloonClassName, view } ) => {
				return view === toolbar && balloonClassName === 'ck-toolbar-container';
			} ) );
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

			setData( model, '[<imageBlock src=""></imageBlock>]' );

			editor.ui.focusTracker.isFocused = false;
			expect( balloon.visibleView ).to.be.null;

			editor.ui.focusTracker.isFocused = true;
			expect( balloon.visibleView ).to.equal( toolbar );
		} );

		it( 'should hide the toolbar when the editor loses focus and the image is selected', () => {
			editor.ui.focusTracker.isFocused = false;

			setData( model, '[<imageBlock src=""></imageBlock>]' );

			editor.ui.focusTracker.isFocused = true;
			expect( balloon.visibleView ).to.equal( toolbar );

			editor.ui.focusTracker.isFocused = false;
			expect( balloon.visibleView ).to.be.null;
		} );

		it( 'should show the toolbar when the editor gains focus and the selection is in a caption', () => {
			editor.ui.focusTracker.isFocused = true;

			setData( model, '<imageBlock src=""><caption>[foo]</caption></imageBlock>' );

			editor.ui.focusTracker.isFocused = false;
			expect( balloon.visibleView ).to.be.null;

			editor.ui.focusTracker.isFocused = true;
			expect( balloon.visibleView ).to.equal( toolbar );
		} );

		it( 'should hide the toolbar when the editor loses focus and the selection is in a caption', () => {
			editor.ui.focusTracker.isFocused = false;

			setData( model, '<imageBlock src=""><caption>[]foo</caption></imageBlock>' );

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
			setData( model, '<paragraph>[foo]</paragraph><imageBlock src=""></imageBlock>' );

			expect( balloon.visibleView ).to.be.null;

			editor.ui.fire( 'update' );

			expect( balloon.visibleView ).to.be.null;

			model.change( writer => {
				// Select the [<imageBlock></imageBlock>]
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

		it( 'should show the toolbar on ui#update when the inline image is selected', () => {
			setData( model, '<paragraph>[foo]<imageInline src=""></imageInline></paragraph>' );

			expect( balloon.visibleView ).to.be.null;

			editor.ui.fire( 'update' );

			expect( balloon.visibleView ).to.be.null;

			model.change( writer => {
				// Select the [<imageInline src=""></imageInline>]
				writer.setSelection(
					writer.createRangeOn( doc.getRoot().getChild( 0 ).getChild( 1 ) )
				);
			} );

			expect( balloon.visibleView ).to.equal( toolbar );

			// Make sure successive change does not throw, e.g. attempting
			// to insert the toolbar twice.
			editor.ui.fire( 'update' );
			expect( balloon.visibleView ).to.equal( toolbar );
		} );

		it( 'should show the toolbar on ui#update when the linked inline image is selected', () => {
			setData( model, '<paragraph>[foo]<imageInline linkHref="https://ckeditor.com" src=""></imageInline></paragraph>' );

			expect( balloon.visibleView ).to.be.null;

			editor.ui.fire( 'update' );

			expect( balloon.visibleView ).to.be.null;

			model.change( writer => {
				// Select the [<a href="https://ckeditor.com"><imageInline src=""></imageInline></a>]
				writer.setSelection(
					writer.createRangeOn( doc.getRoot().getChild( 0 ).getChild( 1 ) )
				);
			} );

			expect( balloon.visibleView ).to.equal( toolbar );

			// Make sure successive change does not throw, e.g. attempting
			// to insert the toolbar twice.
			editor.ui.fire( 'update' );
			expect( balloon.visibleView ).to.equal( toolbar );
		} );

		it( 'should show the toolbar on ui#update when the selection is in a caption', () => {
			setData( model, '<paragraph>[foo]</paragraph><imageBlock src=""><caption>bar</caption></imageBlock>' );

			expect( balloon.visibleView ).to.be.null;

			editor.ui.fire( 'update' );

			expect( balloon.visibleView ).to.be.null;

			model.change( writer => {
				// Select the <imageBlock><caption>[bar]</caption></imageBlock>
				writer.setSelection(
					writer.createRangeIn( doc.getRoot().getChild( 1 ).getChild( 0 ) )
				);
			} );

			expect( balloon.visibleView ).to.equal( toolbar );

			// Make sure successive change does not throw, e.g. attempting
			// to insert the toolbar twice.
			editor.ui.fire( 'update' );
			expect( balloon.visibleView ).to.equal( toolbar );
		} );

		it( 'should not engage when the toolbar is in the balloon yet invisible', () => {
			setData( model, '[<imageBlock src=""></imageBlock>]' );

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
			setData( model, '<paragraph>foo</paragraph>[<imageBlock src=""></imageBlock>]' );

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

		it( 'should hide the toolbar on ui#update if the selection is being moved outside of a caption', () => {
			setData( model, '<paragraph>foo</paragraph><imageBlock src=""><caption>[]</caption></imageBlock>' );

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

		it( 'should not hide the toolbar on ui#update if the selection is being moved from an image to a caption', () => {
			setData( model, '[<imageBlock src=""><caption>bar</caption></imageBlock>]' );

			expect( balloon.visibleView ).to.equal( toolbar );

			model.change( writer => {
				// Select the <imageBlock><caption>[bar]</caption></imageBlock>
				writer.setSelection(
					writer.createRangeIn( doc.getRoot().getChild( 0 ).getChild( 0 ) )
				);
			} );

			expect( balloon.visibleView ).to.equal( toolbar );

			// Make sure successive change does not throw, e.g. attempting
			// to insert the toolbar twice.
			editor.ui.fire( 'update' );
			expect( balloon.visibleView ).to.equal( toolbar );
		} );

		it( 'should not hide the toolbar on ui#update if the selection is being moved from a caption to an image', () => {
			setData( model, '<imageBlock src=""><caption>[b]ar</caption></imageBlock>' );

			expect( balloon.visibleView ).to.equal( toolbar );

			model.change( writer => {
				// Select the <imageBlock><caption>[bar]</caption></imageBlock>
				writer.setSelection(
					writer.createRangeIn( doc.getRoot().getChild( 0 ) )
				);
			} );

			expect( balloon.visibleView ).to.equal( toolbar );

			// Make sure successive change does not throw, e.g. attempting
			// to insert the toolbar twice.
			editor.ui.fire( 'update' );
			expect( balloon.visibleView ).to.equal( toolbar );
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
