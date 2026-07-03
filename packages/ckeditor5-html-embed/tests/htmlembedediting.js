/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HtmlEmbedEditing } from '../src/htmlembedediting.js';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { HtmlEmbedCommand } from '../src/htmlembedcommand.js';
import { _getModelData, _setModelData } from '@ckeditor/ckeditor5-engine';
import { isWidget } from '@ckeditor/ckeditor5-widget';
import { Clipboard } from '@ckeditor/ckeditor5-clipboard';
import { ButtonView } from '@ckeditor/ckeditor5-ui';

describe( 'HtmlEmbedEditing', () => {
	let element, editor, model, view, viewDocument;

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [ HtmlEmbedEditing, Clipboard ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				view = editor.editing.view;
				viewDocument = view.document;
			} );
	} );

	afterEach( () => {
		return editor.destroy()
			.then( () => {
				element.remove();
			} );
	} );

	it( 'should have pluginName', () => {
		expect( HtmlEmbedEditing.pluginName ).toBe( 'HtmlEmbedEditing' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( HtmlEmbedEditing.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `true`', () => {
		expect( HtmlEmbedEditing.isPremiumPlugin ).toBe( true );
	} );

	it( 'should have `licenseFeatureCode` static flag set to `HE`', () => {
		expect( HtmlEmbedEditing.licenseFeatureCode ).toBe( 'HE' );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( HtmlEmbedEditing ) ).toBeInstanceOf( HtmlEmbedEditing );
	} );

	it( 'should set proper schema rules', () => {
		expect( model.schema.checkChild( [ '$root' ], 'rawHtml' ) ).toBe( true );
		expect( model.schema.checkAttribute( [ '$root', 'rawHtml' ], 'value' ) ).toBe( true );

		expect( model.schema.isObject( 'rawHtml' ) ).toBe( true );

		expect( model.schema.checkChild( [ '$root', 'rawHtml' ], '$text' ) ).toBe( false );
		expect( model.schema.checkChild( [ '$root', '$block' ], 'rawHtml' ) ).toBe( false );
	} );

	it( 'inherits attributes from $blockObject', () => {
		model.schema.extend( '$blockObject', {
			allowAttributes: 'foo'
		} );

		expect( model.schema.checkAttribute( 'rawHtml', 'foo' ) ).toBe( true );
	} );

	it( 'should register the htmlEmbed command', () => {
		expect( editor.commands.get( 'htmlEmbed' ) ).toBeInstanceOf( HtmlEmbedCommand );
	} );

	describe( 'config', () => {
		let htmlEmbed;

		beforeEach( () => {
			htmlEmbed = editor.config.get( 'htmlEmbed' );
		} );

		describe( 'htmlEmbed.showPreviews', () => {
			it( 'should be set to `false` by default', () => {
				expect( htmlEmbed.showPreviews ).toBe( false );
			} );
		} );

		describe( 'htmlEmbed.sanitizeHtml', () => {
			beforeEach( () => {
				vi.spyOn( console, 'warn' ).mockImplementation( () => {} );
			} );

			it( 'should return an object with cleaned html and a note whether something has changed', () => {
				expect( htmlEmbed.sanitizeHtml( 'foo' ) ).toEqual( {
					html: 'foo',
					hasChanged: false
				} );
			} );

			it( 'should return an input string (without any modifications)', () => {
				const unsafeHtml = '<img src="data:/xxx,<script>void</script>" onload="void;">';

				expect( htmlEmbed.sanitizeHtml( unsafeHtml ).html ).toBe( unsafeHtml );
			} );

			it( 'should display a warning when using the default sanitizer', () => {
				htmlEmbed.sanitizeHtml( 'foo' );

				expect( console.warn ).toHaveBeenCalledTimes( 1 );
				expect( console.warn.mock.calls[ 0 ][ 0 ] ).toBe( 'html-embed-provide-sanitize-function' );
			} );
		} );
	} );

	describe( 'conversion in the data pipeline', () => {
		describe( 'model to view', () => {
			it( 'should convert an empty `rawHtml` element', () => {
				_setModelData( model, '[<rawHtml></rawHtml>]' );

				expect( editor.getData() ).toBe( '<div class="raw-html-embed"></div>' );
			} );

			it( 'should put the HTML from the `value` attribute (in `rawHtml`) into the data', () => {
				_setModelData( model, '[<rawHtml></rawHtml>]' );

				model.change( writer => {
					writer.setAttribute( 'value', '<b>Foo.</b>', model.document.getRoot().getChild( 0 ) );
				} );

				expect( editor.getData() ).toBe(
					'<div class="raw-html-embed">' +
						'<b>Foo.</b>' +
					'</div>'
				);
			} );
		} );

		describe( 'view to model', () => {
			it( 'should convert innerHTML (single element) of div.raw-html-embed', () => {
				editor.setData(
					'<div class="raw-html-embed">' +
						'<b>Foo.</b>' +
					'</div>'
				);

				const rawHtml = model.document.getRoot().getChild( 0 );
				expect( rawHtml.getAttribute( 'value' ) ).toBe( '<b>Foo.</b>' );
			} );

			it( 'should convert innerHTML (single element with children) of div.raw-html-embed', () => {
				editor.setData(
					'<div class="raw-html-embed">' +
						'<p>' +
							'<b>Foo B.</b>' +
							'<i>Foo I.</i>' +
						'</p>' +
					'</div>'
				);

				const rawHtml = model.document.getRoot().getChild( 0 );

				expect( rawHtml.getAttribute( 'value' ) ).toBe(
					'<p>' +
						'<b>Foo B.</b>' +
						'<i>Foo I.</i>' +
					'</p>'
				);
			} );

			it( 'should convert innerHTML (few elements) of div.raw-html-embed', () => {
				editor.setData(
					'<div class="raw-html-embed">' +
						'<b>Foo B.</b>' +
						'<i>Foo I.</i>' +
						'<u>Foo U.</u>' +
					'</div>'
				);

				const rawHtml = model.document.getRoot().getChild( 0 );

				expect( rawHtml.getAttribute( 'value' ) ).toBe(
					'<b>Foo B.</b>' +
					'<i>Foo I.</i>' +
					'<u>Foo U.</u>'
				);
			} );

			it( 'should not convert in wrong context', () => {
				model.schema.register( 'div', { inheritAllFrom: '$block' } );
				model.schema.addChildCheck( ( ctx, childDef ) => {
					if ( ctx.endsWith( '$root' ) && childDef.name == 'rawHtml' ) {
						return false;
					}
				} );

				editor.conversion.elementToElement( { model: 'div', view: 'div' } );

				editor.setData(
					'<div>' +
						'<div class="raw-html-embed">' +
							'<b>Foo.</b>' +
						'</div>' +
					'</div>'
				);

				expect( _getModelData( model, { withoutSelection: true } ) ).toBe( '<div></div>' );
			} );

			it( 'should not convert inner `div.raw-html-embed` that is a child of outer div.raw-html-embed', () => {
				editor.setData(
					'<div class="raw-html-embed">' +
						'<div class="raw-html-embed">' +
							'<b>Foo B.</b>' +
							'<i>Foo I.</i>' +
							'<u>Foo U.</u>' +
						'</div>' +
					'</div>'
				);

				const rawHtml = model.document.getRoot().getChild( 0 );

				expect( rawHtml.getAttribute( 'value' ) ).toBe(
					'<div class="raw-html-embed">' +
						'<b>Foo B.</b>' +
						'<i>Foo I.</i>' +
						'<u>Foo U.</u>' +
					'</div>'
				);
			} );

			it( 'should convert innerHTML (and preserve comments and raw data formatting) of div.raw-html-embed', () => {
				const rawContent = [
					'	<!-- foo -->',
					'	<p>',
					'		<b>Foo B.</b>',
					'		<!-- abc -->',
					'		<i>Foo I.</i>',
					'	</p>',
					'	<!-- bar -->'
				].join( '\n' );

				editor.setData(
					'<div class="raw-html-embed">' +
						rawContent +
					'</div>'
				);

				const rawHtml = model.document.getRoot().getChild( 0 );

				expect( rawHtml.getAttribute( 'value' ) ).toBe( rawContent );
			} );

			// See https://github.com/ckeditor/ckeditor5/issues/8789.
			it( 'should convert content from clipboard', () => {
				const dataTransferMock = createDataTransfer( {
					'text/html':
						'<div class="raw-html-embed">' +
							'<b>Foo B.</b>' +
							'<i>Foo I.</i>' +
							'<u>Foo U.</u>' +
						'</div>',
					'text/plain': 'plain text'
				} );

				viewDocument.fire( 'paste', {
					dataTransfer: dataTransferMock,
					stopPropagation: vi.fn(),
					preventDefault: vi.fn()
				} );

				const rawHtml = model.document.getRoot().getChild( 0 );

				expect( rawHtml.getAttribute( 'value' ) ).toBe(
					'<b>Foo B.</b>' +
					'<i>Foo I.</i>' +
					'<u>Foo U.</u>'
				);
			} );
		} );
	} );

	describe( 'conversion in the editing pipeline (model to view)', () => {
		describe( 'without previews (htmlEmbed.showPreviews=false)', () => {
			it( 'converted element should be widgetized', () => {
				_setModelData( model, '<rawHtml></rawHtml>' );
				const widget = viewDocument.getRoot().getChild( 0 );

				expect( widget.name ).toBe( 'div' );
				expect( isRawHtmlWidget( widget ) ).toBe( true );

				const contentWrapper = widget.getChild( 1 );

				expect( contentWrapper.hasClass( 'raw-html-embed__content-wrapper' ) ).toBe( true );
			} );

			it( 'the widget should have the data-html-embed-label attribute for the CSS label', () => {
				_setModelData( model, '<rawHtml></rawHtml>' );
				const widget = viewDocument.getRoot().getChild( 0 );

				expect( widget.getAttribute( 'data-html-embed-label' ) ).toBe( 'HTML snippet' );
			} );

			it( 'the main element should expose rawHtmlApi custom property', () => {
				_setModelData( model, '<rawHtml></rawHtml>' );
				const widget = viewDocument.getRoot().getChild( 0 );

				const rawHtmlApi = widget.getCustomProperty( 'rawHtmlApi' );

				expect( Object.keys( rawHtmlApi ) ).toHaveLength( 3 );
				expect( Object.keys( rawHtmlApi ) ).toEqual( expect.arrayContaining( [ 'makeEditable', 'save', 'cancel' ] ) );
			} );

			it( 'renders a disabled textarea as a preview', () => {
				_setModelData( model, '<rawHtml value="foo"></rawHtml>' );
				const widget = viewDocument.getRoot().getChild( 0 );
				const contentWrapper = widget.getChild( 1 );
				const domContentWrapper = editor.editing.view.domConverter.mapViewToDom( contentWrapper );

				expect( domContentWrapper.querySelector( 'textarea.raw-html-embed__source' ).value ).toBe( 'foo' );
				expect( domContentWrapper.querySelector( 'textarea.raw-html-embed__source' ).disabled ).toBe( true );
			} );

			it( 'updates the textarea preview once the model changes', () => {
				_setModelData( model, '<rawHtml value="foo"></rawHtml>' );

				editor.model.change( writer => writer.setAttribute( 'value', 'bar', editor.model.document.getRoot().getChild( 0 ) ) );

				const widget = viewDocument.getRoot().getChild( 0 );
				const contentWrapper = widget.getChild( 1 );
				const domContentWrapper = editor.editing.view.domConverter.mapViewToDom( contentWrapper );

				expect( domContentWrapper.querySelector( 'textarea.raw-html-embed__source' ).value ).toBe( 'bar' );
				expect( domContentWrapper.querySelector( 'textarea.raw-html-embed__source' ).disabled ).toBe( true );
			} );

			it( 'renders the "edit" button', () => {
				_setModelData( model, '<rawHtml value="foo"></rawHtml>' );
				const widget = viewDocument.getRoot().getChild( 0 );
				const contentWrapper = widget.getChild( 1 );
				const domContentWrapper = editor.editing.view.domConverter.mapViewToDom( contentWrapper );

				// There's exactly this button, and nothing else.
				expect( domContentWrapper.querySelectorAll( 'button' ) ).toHaveLength( 1 );
				expect( domContentWrapper.querySelectorAll( '.raw-html-embed__edit-button' ) ).toHaveLength( 1 );
			} );

			it( 'allows editing the source after clicking the "edit" button', () => {
				_setModelData( model, '<rawHtml value="foo"></rawHtml>' );
				const widget = viewDocument.getRoot().getChild( 0 );
				const contentWrapper = widget.getChild( 1 );
				const domContentWrapper = editor.editing.view.domConverter.mapViewToDom( contentWrapper );

				const makeEditableStub = vi.spyOn( widget.getCustomProperty( 'rawHtmlApi' ), 'makeEditable' )
					.mockImplementation( () => {} );

				domContentWrapper.querySelector( '.raw-html-embed__edit-button' ).click();

				expect( makeEditableStub ).toHaveBeenCalledTimes( 1 );
			} );

			it( 'renders the "save changes" and "cancel" button in edit source mode', () => {
				_setModelData( model, '<rawHtml value="foo"></rawHtml>' );
				const widget = viewDocument.getRoot().getChild( 0 );
				const contentWrapper = widget.getChild( 1 );
				const domContentWrapper = editor.editing.view.domConverter.mapViewToDom( contentWrapper );

				widget.getCustomProperty( 'rawHtmlApi' ).makeEditable();

				expect( domContentWrapper.querySelectorAll( 'button' ) ).toHaveLength( 2 );
				expect( domContentWrapper.querySelectorAll( '.raw-html-embed__save-button' ) ).toHaveLength( 1 );
				expect( domContentWrapper.querySelectorAll( '.raw-html-embed__cancel-button' ) ).toHaveLength( 1 );
			} );

			it( 'updates the model state after clicking the "save changes" button', () => {
				_setModelData( model, '<rawHtml value="foo"></rawHtml>' );
				const widget = viewDocument.getRoot().getChild( 0 );
				const contentWrapper = widget.getChild( 1 );
				const domContentWrapper = editor.editing.view.domConverter.mapViewToDom( contentWrapper );

				widget.getCustomProperty( 'rawHtmlApi' ).makeEditable();

				domContentWrapper.querySelector( 'textarea' ).value = 'Foo Bar.';
				domContentWrapper.querySelector( '.raw-html-embed__save-button' ).click();

				expect( _getModelData( model ) ).toBe( '[<rawHtml value="Foo Bar."></rawHtml>]' );
			} );

			it( 'switches to "preview mode" after saving changes', () => {
				_setModelData( model, '<rawHtml value="foo"></rawHtml>' );

				let widget = viewDocument.getRoot().getChild( 0 );
				let contentWrapper = widget.getChild( 1 );
				let domContentWrapper = editor.editing.view.domConverter.mapViewToDom( contentWrapper );

				widget.getCustomProperty( 'rawHtmlApi' ).makeEditable();

				domContentWrapper.querySelector( 'textarea' ).value = 'Foo Bar.';
				domContentWrapper.querySelector( '.raw-html-embed__save-button' ).click();

				// The entire DOM has rendered once again. The references were invalid.
				widget = viewDocument.getRoot().getChild( 0 );
				contentWrapper = widget.getChild( 1 );
				domContentWrapper = editor.editing.view.domConverter.mapViewToDom( contentWrapper );

				// There's exactly this button, and nothing else.
				expect( domContentWrapper.querySelectorAll( 'button' ) ).toHaveLength( 1 );
				expect( domContentWrapper.querySelectorAll( '.raw-html-embed__edit-button' ) ).toHaveLength( 1 );
			} );

			it( 'switches to "preview mode" after clicking save button when there are no changes', () => {
				_setModelData( model, '<rawHtml value="foo"></rawHtml>' );

				let widget = viewDocument.getRoot().getChild( 0 );
				let contentWrapper = widget.getChild( 1 );
				let domContentWrapper = editor.editing.view.domConverter.mapViewToDom( contentWrapper );

				widget.getCustomProperty( 'rawHtmlApi' ).makeEditable();

				domContentWrapper.querySelector( '.raw-html-embed__save-button' ).click();

				// The entire DOM has rendered once again. The references were invalid.
				widget = viewDocument.getRoot().getChild( 0 );
				contentWrapper = widget.getChild( 1 );
				domContentWrapper = editor.editing.view.domConverter.mapViewToDom( contentWrapper );

				// There's exactly this button, and nothing else.
				expect( domContentWrapper.querySelectorAll( 'button' ) ).toHaveLength( 1 );
				expect( domContentWrapper.querySelectorAll( '.raw-html-embed__edit-button' ) ).toHaveLength( 1 );
			} );

			it( 'destroys unused buttons when the editing view is re-rendered to prevent memory leaks', () => {
				_setModelData( model, '<rawHtml value="foo"></rawHtml>' );
				const widget = viewDocument.getRoot().getChild( 0 );
				const contentWrapper = widget.getChild( 1 );
				const domContentWrapper = editor.editing.view.domConverter.mapViewToDom( contentWrapper );

				const buttonDestroySpy = vi.spyOn( ButtonView.prototype, 'destroy' );
				const buttonRenderSpy = vi.spyOn( ButtonView.prototype, 'render' );

				domContentWrapper.querySelector( '.raw-html-embed__edit-button' ).click();

				// The edit button was destroyed.
				expect( buttonDestroySpy.mock.contexts[ 0 ] ).toBeInstanceOf( ButtonView );
				expect( buttonDestroySpy ).toHaveBeenCalledTimes( 1 );

				// Save and cancel button were created.
				expect( buttonRenderSpy.mock.contexts[ 0 ] ).toBeInstanceOf( ButtonView );
				expect( buttonRenderSpy.mock.contexts[ 1 ] ).toBeInstanceOf( ButtonView );
				expect( buttonRenderSpy ).toHaveBeenCalledTimes( 2 );

				buttonDestroySpy.mockClear();
				domContentWrapper.querySelector( '.raw-html-embed__cancel-button' ).click();

				// Save and cancel button were destroyed.
				expect( buttonDestroySpy.mock.contexts[ 0 ] ).toBeInstanceOf( ButtonView );
				expect( buttonDestroySpy.mock.contexts[ 1 ] ).toBeInstanceOf( ButtonView );
				expect( buttonDestroySpy ).toHaveBeenCalledTimes( 2 );
			} );

			it( 'does not lose editor focus after saving changes', () => {
				_setModelData( model, '<rawHtml value="foo"></rawHtml>' );
				const widget = viewDocument.getRoot().getChild( 0 );
				const contentWrapper = widget.getChild( 1 );
				const domContentWrapper = editor.editing.view.domConverter.mapViewToDom( contentWrapper );
				const spy = vi.spyOn( editor.editing.view, 'focus' );

				widget.getCustomProperty( 'rawHtmlApi' ).makeEditable();

				domContentWrapper.querySelector( 'textarea' ).value = 'Foo Bar.';
				domContentWrapper.querySelector( '.raw-html-embed__save-button' ).click();

				expect( spy ).toHaveBeenCalledTimes( 1 );
			} );

			it( 'does not update the model state after saving the same changes', () => {
				_setModelData( model, '<rawHtml value="foo"></rawHtml>' );
				const widget = viewDocument.getRoot().getChild( 0 );
				const contentWrapper = widget.getChild( 1 );
				const domContentWrapper = editor.editing.view.domConverter.mapViewToDom( contentWrapper );

				const executeStub = vi.spyOn( editor.commands.get( 'htmlEmbed' ), 'execute' )
					.mockImplementation( () => {} );

				widget.getCustomProperty( 'rawHtmlApi' ).makeEditable();
				domContentWrapper.querySelector( '.raw-html-embed__save-button' ).click();

				expect( executeStub ).not.toHaveBeenCalled();
			} );

			it( 'does not update the model state after clicking the "cancel" button', () => {
				_setModelData( model, '<rawHtml value="foo"></rawHtml>' );
				const widget = viewDocument.getRoot().getChild( 0 );
				const contentWrapper = widget.getChild( 1 );
				const domContentWrapper = editor.editing.view.domConverter.mapViewToDom( contentWrapper );

				widget.getCustomProperty( 'rawHtmlApi' ).makeEditable();
				domContentWrapper.querySelector( '.raw-html-embed__cancel-button' ).click();

				expect( _getModelData( model ) ).toBe( '[<rawHtml value="foo"></rawHtml>]' );
			} );

			it( 'switches to "preview mode" after canceling editing', () => {
				_setModelData( model, '<rawHtml value="foo"></rawHtml>' );
				const widget = viewDocument.getRoot().getChild( 0 );
				const contentWrapper = widget.getChild( 1 );
				const domContentWrapper = editor.editing.view.domConverter.mapViewToDom( contentWrapper );

				widget.getCustomProperty( 'rawHtmlApi' ).makeEditable();

				domContentWrapper.querySelector( '.raw-html-embed__cancel-button' ).click();

				expect( domContentWrapper.querySelector( 'textarea.raw-html-embed__source' ).value ).toBe( 'foo' );
				expect( domContentWrapper.querySelector( 'textarea.raw-html-embed__source' ).disabled ).toBe( true );
			} );

			it( 'does not lose editor focus after canceling editing', () => {
				_setModelData( model, '<rawHtml value="foo"></rawHtml>' );
				const widget = viewDocument.getRoot().getChild( 0 );
				const contentWrapper = widget.getChild( 1 );
				const domContentWrapper = editor.editing.view.domConverter.mapViewToDom( contentWrapper );
				const spy = vi.spyOn( editor.editing.view, 'focus' );

				widget.getCustomProperty( 'rawHtmlApi' ).makeEditable();

				domContentWrapper.querySelector( '.raw-html-embed__cancel-button' ).click();

				expect( spy ).toHaveBeenCalledTimes( 1 );
			} );

			it( 'does not select the unselected `rawHtml` element, if it is not in the editable mode', () => {
				_setModelData( model, '[<rawHtml value="foo"></rawHtml>]<rawHtml value="bar"></rawHtml>' );

				// Get the second widget.
				const widget = viewDocument.getRoot().getChild( 1 );
				const contentWrapper = widget.getChild( 1 );
				const domContentWrapper = editor.editing.view.domConverter.mapViewToDom( contentWrapper );

				domContentWrapper.querySelector( 'textarea' ).dispatchEvent( new Event( 'mousedown' ) );

				expect( _getModelData( model ) ).toBe( '[<rawHtml value="foo"></rawHtml>]<rawHtml value="bar"></rawHtml>' );
			} );

			it( 'does not unnecessarily select an already selected `rawHtml` element in the editable mode', () => {
				_setModelData( model, '[<rawHtml value="foo"></rawHtml>]' );

				const spy = vi.fn();

				model.document.selection.on( 'change:range', spy );

				const widget = viewDocument.getRoot().getChild( 0 );
				const contentWrapper = widget.getChild( 1 );
				const domContentWrapper = editor.editing.view.domConverter.mapViewToDom( contentWrapper );

				widget.getCustomProperty( 'rawHtmlApi' ).makeEditable();

				domContentWrapper.querySelector( 'textarea' ).dispatchEvent( new Event( 'mousedown' ) );

				expect( spy ).not.toHaveBeenCalled();
			} );

			it( 'selects the unselected `rawHtml` element in editable mode after clicking on its textarea', () => {
				_setModelData( model, '<rawHtml value="foo"></rawHtml><rawHtml value="bar"></rawHtml>' );

				const widgetFoo = viewDocument.getRoot().getChild( 0 );
				const widgetBar = viewDocument.getRoot().getChild( 1 );

				const contentWrapperFoo = widgetFoo.getChild( 1 );
				const contentWrapperBar = widgetBar.getChild( 1 );

				const domContentWrapperFoo = editor.editing.view.domConverter.mapViewToDom( contentWrapperFoo );
				const domContentWrapperBar = editor.editing.view.domConverter.mapViewToDom( contentWrapperBar );

				widgetFoo.getCustomProperty( 'rawHtmlApi' ).makeEditable();
				widgetBar.getCustomProperty( 'rawHtmlApi' ).makeEditable();

				domContentWrapperFoo.querySelector( 'textarea' ).dispatchEvent( new Event( 'mousedown' ) );

				expect( _getModelData( model ) ).toBe( '[<rawHtml value="foo"></rawHtml>]<rawHtml value="bar"></rawHtml>' );

				domContentWrapperBar.querySelector( 'textarea' ).dispatchEvent( new Event( 'mousedown' ) );

				expect( _getModelData( model ) ).toBe( '<rawHtml value="foo"></rawHtml>[<rawHtml value="bar"></rawHtml>]' );
			} );

			describe( 'different setting of ui language', () => {
				it( 'the widget should have the dir attribute for LTR language', () => {
					vi.spyOn( editor.locale, 'uiLanguageDirection', 'get' ).mockReturnValue( 'ltr' );

					_setModelData( model, '<rawHtml></rawHtml>' );
					const widget = viewDocument.getRoot().getChild( 0 );

					expect( widget.getAttribute( 'dir' ) ).toBe( 'ltr' );
				} );

				it( 'the widget should have the dir attribute for RTL language', () => {
					vi.spyOn( editor.locale, 'uiLanguageDirection', 'get' ).mockReturnValue( 'rtl' );

					_setModelData( model, '<rawHtml></rawHtml>' );
					const widget = viewDocument.getRoot().getChild( 0 );

					expect( widget.getAttribute( 'dir' ) ).toBe( 'rtl' );
				} );
			} );

			describe( 'rawHtmlApi.makeEditable()', () => {
				it( 'makes the textarea editable', () => {
					_setModelData( model, '<rawHtml value="foo"></rawHtml>' );
					const widget = viewDocument.getRoot().getChild( 0 );
					const contentWrapper = widget.getChild( 1 );
					const domContentWrapper = editor.editing.view.domConverter.mapViewToDom( contentWrapper );

					widget.getCustomProperty( 'rawHtmlApi' ).makeEditable();

					expect( domContentWrapper.querySelector( 'textarea.raw-html-embed__source' ).value ).toBe( 'foo' );
					expect( domContentWrapper.querySelector( 'textarea.raw-html-embed__source' ).disabled ).toBe( false );
				} );
			} );

			describe( 'rawHtmlApi.save()', () => {
				it( 'saves the new value to the model', () => {
					_setModelData( model, '<rawHtml value="foo"></rawHtml>' );
					const widget = viewDocument.getRoot().getChild( 0 );

					widget.getCustomProperty( 'rawHtmlApi' ).makeEditable();
					widget.getCustomProperty( 'rawHtmlApi' ).save( 'bar' );

					expect( _getModelData( model ) ).toBe( '[<rawHtml value="bar"></rawHtml>]' );
				} );

				it( 'saves the new value to the model if given `rawHtml` element is not selected', () => {
					_setModelData( model, '<rawHtml value="foo"></rawHtml><rawHtml value="bar"></rawHtml>' );

					const widgetFoo = viewDocument.getRoot().getChild( 0 );
					const widgetBar = viewDocument.getRoot().getChild( 1 );

					const contentWrapperFoo = widgetFoo.getChild( 1 );
					const contentWrapperBar = widgetBar.getChild( 1 );

					const domContentWrapperFoo = editor.editing.view.domConverter.mapViewToDom( contentWrapperFoo );
					const domContentWrapperBar = editor.editing.view.domConverter.mapViewToDom( contentWrapperBar );

					widgetFoo.getCustomProperty( 'rawHtmlApi' ).makeEditable();
					widgetBar.getCustomProperty( 'rawHtmlApi' ).makeEditable();

					domContentWrapperFoo.querySelector( 'textarea' ).value = 'FOO';

					const domSaveButtonFoo = domContentWrapperFoo.querySelector( '.raw-html-embed__save-button' );

					// Simulate the click event on the Save button from the first widget.
					domSaveButtonFoo.dispatchEvent( new Event( 'mousedown' ) );
					domSaveButtonFoo.dispatchEvent( new Event( 'mouseup' ) );
					domSaveButtonFoo.dispatchEvent( new Event( 'click' ) );

					domContentWrapperBar.querySelector( 'textarea' ).value = 'BAR';

					const domSaveButtonBar = domContentWrapperBar.querySelector( '.raw-html-embed__save-button' );

					// Simulate the click event on the Save button from the second widget.
					domSaveButtonBar.dispatchEvent( new Event( 'mousedown' ) );
					domSaveButtonBar.dispatchEvent( new Event( 'mouseup' ) );
					domSaveButtonBar.dispatchEvent( new Event( 'click' ) );

					expect( _getModelData( model ) ).toBe( '<rawHtml value="FOO"></rawHtml>[<rawHtml value="BAR"></rawHtml>]' );
				} );

				it( 'turns back to the non-editable mode and updates the textarea value', () => {
					_setModelData( model, '<rawHtml value="foo"></rawHtml>' );
					const widget = viewDocument.getRoot().getChild( 0 );

					widget.getCustomProperty( 'rawHtmlApi' ).makeEditable();
					widget.getCustomProperty( 'rawHtmlApi' ).save( 'bar' );

					const newWidget = viewDocument.getRoot().getChild( 0 );
					const contentWrapper = newWidget.getChild( 1 );
					const domContentWrapper = editor.editing.view.domConverter.mapViewToDom( contentWrapper );
					expect( domContentWrapper.querySelector( 'textarea.raw-html-embed__source' ).value ).toBe( 'bar' );
					expect( domContentWrapper.querySelector( 'textarea.raw-html-embed__source' ).disabled ).toBe( true );
				} );
			} );
		} );

		describe( 'with previews (htmlEmbed.showPreviews=true)', () => {
			let element, editor, model, view, viewDocument, sanitizeHtml;

			beforeEach( () => {
				element = document.createElement( 'div' );
				document.body.appendChild( element );

				// The default sanitize function without `console.warn`.
				sanitizeHtml = input => ( { html: input, hasChanged: false } );

				return ClassicTestEditor
					.create( element, {
						plugins: [ HtmlEmbedEditing ],
						htmlEmbed: {
							showPreviews: true,
							sanitizeHtml
						}
					} )
					.then( newEditor => {
						editor = newEditor;
						model = editor.model;
						view = editor.editing.view;
						viewDocument = view.document;
					} );
			} );

			afterEach( () => {
				return editor.destroy()
					.then( () => {
						element.remove();
					} );
			} );

			it( 'should render a div with a preview and placeholder', () => {
				_setModelData( model, '<rawHtml value="foo"></rawHtml>' );
				const widget = viewDocument.getRoot().getChild( 0 );
				const contentWrapper = widget.getChild( 1 );
				const domContentWrapper = editor.editing.view.domConverter.mapViewToDom( contentWrapper );

				expect( domContentWrapper.querySelector( 'div.raw-html-embed__preview-content' ).innerHTML ).toBe( 'foo' );

				expect( domContentWrapper.querySelector( 'div.raw-html-embed__preview-placeholder' ) ).not.toBeNull();
			} );

			it( 'should update the preview once the model changes', () => {
				_setModelData( model, '<rawHtml value="foo"></rawHtml>' );

				editor.model.change( writer => writer.setAttribute( 'value', 'bar', editor.model.document.getRoot().getChild( 0 ) ) );

				const widget = viewDocument.getRoot().getChild( 0 );
				const contentWrapper = widget.getChild( 1 );
				const domContentWrapper = editor.editing.view.domConverter.mapViewToDom( contentWrapper );

				expect( domContentWrapper.querySelector( 'div.raw-html-embed__preview-content' ).innerHTML ).toBe( 'bar' );
			} );

			describe( 'placeholder', () => {
				function getPlaceholder() {
					const widget = viewDocument.getRoot().getChild( 0 );
					const contentWrapper = widget.getChild( 1 );
					const domContentWrapper = editor.editing.view.domConverter.mapViewToDom( contentWrapper );

					return domContentWrapper.querySelector( 'div.raw-html-embed__preview-placeholder' );
				}

				it( 'should inherit the styles from the editor', () => {
					_setModelData( model, '<rawHtml value=""></rawHtml>' );
					const placeholder = getPlaceholder();

					expect( placeholder.classList.value ).toContain( 'ck ck-reset_all' );
				} );

				it( 'should display the proper information if the snippet is empty', () => {
					_setModelData( model, '<rawHtml value=""></rawHtml>' );
					const placeholder = getPlaceholder();

					expect( placeholder.innerHTML ).toBe( 'Empty snippet content' );
				} );

				it( 'should display the proper information if the snippet is not empty', () => {
					_setModelData( model, '<rawHtml value="foo"></rawHtml>' );
					const placeholder = getPlaceholder();

					expect( placeholder.innerHTML ).toBe( 'No preview available' );
				} );

				// #8326.
				it( 'should execute vulnerable scripts inside the <script> element', () => {
					const logWarn = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

					_setModelData( model, '[<rawHtml value=""></rawHtml>]' );
					editor.execute( 'htmlEmbed', '<script>console.warn( \'Should be called.\' )</script>' );

					expect( logWarn ).toHaveBeenCalledTimes( 1 );
					expect( logWarn ).toHaveBeenNthCalledWith( 1, 'Should be called.' );

					expect( editor.getData() ).toBe(
						'<div class="raw-html-embed"><script>console.warn( \'Should be called.\' )</script></div>'
					);
				} );
			} );

			describe( 'different setting of ui and content language', () => {
				it( 'the widget and preview should have the dir attribute for LTR language', () => {
					vi.spyOn( editor.locale, 'uiLanguageDirection', 'get' ).mockReturnValue( 'ltr' );
					vi.spyOn( editor.locale, 'contentLanguageDirection', 'get' ).mockReturnValue( 'ltr' );

					_setModelData( model, '<rawHtml></rawHtml>' );
					const widget = viewDocument.getRoot().getChild( 0 );
					const domPreview = getDomPreview( widget );

					expect( widget.getAttribute( 'dir' ) ).toBe( 'ltr' );
					expect( domPreview.getAttribute( 'dir' ) ).toBe( 'ltr' );
				} );

				it( 'the widget and preview should have the dir attribute for RTL language', () => {
					vi.spyOn( editor.locale, 'uiLanguageDirection', 'get' ).mockReturnValue( 'rtl' );
					vi.spyOn( editor.locale, 'contentLanguageDirection', 'get' ).mockReturnValue( 'rtl' );

					_setModelData( model, '<rawHtml></rawHtml>' );
					const widget = viewDocument.getRoot().getChild( 0 );
					const domPreview = getDomPreview( widget );

					expect( widget.getAttribute( 'dir' ) ).toBe( 'rtl' );
					expect( domPreview.getAttribute( 'dir' ) ).toBe( 'rtl' );
				} );

				it( 'the widget should have the dir attribute for LTR language, but preview for RTL', () => {
					vi.spyOn( editor.locale, 'uiLanguageDirection', 'get' ).mockReturnValue( 'ltr' );
					vi.spyOn( editor.locale, 'contentLanguageDirection', 'get' ).mockReturnValue( 'rtl' );

					_setModelData( model, '<rawHtml></rawHtml>' );
					const widget = viewDocument.getRoot().getChild( 0 );
					const domPreview = getDomPreview( widget );

					expect( widget.getAttribute( 'dir' ) ).toBe( 'ltr' );
					expect( domPreview.getAttribute( 'dir' ) ).toBe( 'rtl' );
				} );

				it( 'the widget should have the dir attribute for RTL language, butPreview for LTR', () => {
					vi.spyOn( editor.locale, 'uiLanguageDirection', 'get' ).mockReturnValue( 'rtl' );
					vi.spyOn( editor.locale, 'contentLanguageDirection', 'get' ).mockReturnValue( 'ltr' );

					_setModelData( model, '<rawHtml></rawHtml>' );
					const widget = viewDocument.getRoot().getChild( 0 );
					const domPreview = getDomPreview( widget );

					expect( widget.getAttribute( 'dir' ) ).toBe( 'rtl' );
					expect( domPreview.getAttribute( 'dir' ) ).toBe( 'ltr' );
				} );

				function getDomPreview( widget ) {
					const contentWrapper = widget.getChild( 1 );
					const domContentWrapper = editor.editing.view.domConverter.mapViewToDom( contentWrapper );

					return domContentWrapper.querySelector( 'div.raw-html-embed__preview-content' );
				}
			} );
		} );

		describe( 'integration with command and editor states', () => {
			it( 'should disable the edit button when the editor goes read-only', () => {
				_setModelData( model, '<rawHtml value="foo"></rawHtml>' );

				const widget = viewDocument.getRoot().getChild( 0 );
				const contentWrapper = widget.getChild( 1 );
				const domContentWrapper = editor.editing.view.domConverter.mapViewToDom( contentWrapper );
				const editButton = domContentWrapper.querySelector( '.raw-html-embed__edit-button' );

				editor.enableReadOnlyMode( 'unit-test' );
				expect( editButton.classList.contains( 'ck-disabled' ) ).toBe( true );

				editor.disableReadOnlyMode( 'unit-test' );
				expect( editButton.classList.contains( 'ck-disabled' ) ).toBe( false );
			} );

			it( 'should disable the edit button when the command gets disabled', () => {
				_setModelData( model, '<rawHtml value="foo"></rawHtml>' );

				const widget = viewDocument.getRoot().getChild( 0 );
				const contentWrapper = widget.getChild( 1 );
				const domContentWrapper = editor.editing.view.domConverter.mapViewToDom( contentWrapper );
				const htmlEmbedCommand = editor.commands.get( 'htmlEmbed' );
				const editButton = domContentWrapper.querySelector( '.raw-html-embed__edit-button' );

				htmlEmbedCommand.forceDisabled();
				expect( editButton.classList.contains( 'ck-disabled' ) ).toBe( true );

				htmlEmbedCommand.clearForceDisabled();
				expect( editButton.classList.contains( 'ck-disabled' ) ).toBe( false );
			} );

			it( 'should disable the save button (but not the cancel button) when the editor goes read-only', () => {
				_setModelData( model, '<rawHtml value="foo"></rawHtml>' );

				const widget = viewDocument.getRoot().getChild( 0 );
				const contentWrapper = widget.getChild( 1 );
				const domContentWrapper = editor.editing.view.domConverter.mapViewToDom( contentWrapper );

				// Go to edit mode.
				domContentWrapper.querySelector( '.raw-html-embed__edit-button' ).click();

				const saveButton = domContentWrapper.querySelector( '.raw-html-embed__save-button' );
				const cancelButton = domContentWrapper.querySelector( '.raw-html-embed__cancel-button' );

				editor.enableReadOnlyMode( 'unit-test' );
				expect( saveButton.classList.contains( 'ck-disabled' ) ).toBe( true );
				expect( cancelButton.classList.contains( 'ck-disabled' ) ).toBe( false );

				editor.disableReadOnlyMode( 'unit-test' );
				expect( saveButton.classList.contains( 'ck-disabled' ) ).toBe( false );
				expect( cancelButton.classList.contains( 'ck-disabled' ) ).toBe( false );
			} );

			it( 'should disable the save button (but not the cancel button) when the command gets disabled', () => {
				_setModelData( model, '<rawHtml value="foo"></rawHtml>' );

				const widget = viewDocument.getRoot().getChild( 0 );
				const contentWrapper = widget.getChild( 1 );
				const domContentWrapper = editor.editing.view.domConverter.mapViewToDom( contentWrapper );
				const htmlEmbedCommand = editor.commands.get( 'htmlEmbed' );

				// Go to edit mode.
				domContentWrapper.querySelector( '.raw-html-embed__edit-button' ).click();

				const saveButton = domContentWrapper.querySelector( '.raw-html-embed__save-button' );
				const cancelButton = domContentWrapper.querySelector( '.raw-html-embed__cancel-button' );

				htmlEmbedCommand.forceDisabled();
				expect( saveButton.classList.contains( 'ck-disabled' ) ).toBe( true );
				expect( cancelButton.classList.contains( 'ck-disabled' ) ).toBe( false );

				htmlEmbedCommand.clearForceDisabled();
				expect( saveButton.classList.contains( 'ck-disabled' ) ).toBe( false );
				expect( cancelButton.classList.contains( 'ck-disabled' ) ).toBe( false );
			} );
		} );
	} );
} );

function isRawHtmlWidget( viewElement ) {
	return !!viewElement.getCustomProperty( 'rawHtml' ) && isWidget( viewElement );
}

function createDataTransfer( data ) {
	return {
		getData( type ) {
			return data[ type ];
		}
	};
}
