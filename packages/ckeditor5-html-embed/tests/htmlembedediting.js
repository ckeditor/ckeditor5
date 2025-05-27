/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import HtmlEmbedEditing from '../src/htmlembedediting.js';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import HtmlEmbedCommand from '../src/htmlembedcommand.js';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { isWidget } from '@ckeditor/ckeditor5-widget/src/utils.js';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard.js';
import { ButtonView } from '@ckeditor/ckeditor5-ui';

describe( 'HtmlEmbedEditing', () => {
	let element, editor, model, view, viewDocument;

	testUtils.createSinonSandbox();

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
		expect( HtmlEmbedEditing.pluginName ).to.equal( 'HtmlEmbedEditing' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( HtmlEmbedEditing.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( HtmlEmbedEditing.isPremiumPlugin ).to.be.false;
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( HtmlEmbedEditing ) ).to.be.instanceOf( HtmlEmbedEditing );
	} );

	it( 'should set proper schema rules', () => {
		expect( model.schema.checkChild( [ '$root' ], 'rawHtml' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$root', 'rawHtml' ], 'value' ) ).to.be.true;

		expect( model.schema.isObject( 'rawHtml' ) ).to.be.true;

		expect( model.schema.checkChild( [ '$root', 'rawHtml' ], '$text' ) ).to.be.false;
		expect( model.schema.checkChild( [ '$root', '$block' ], 'rawHtml' ) ).to.be.false;
	} );

	it( 'inherits attributes from $blockObject', () => {
		model.schema.extend( '$blockObject', {
			allowAttributes: 'foo'
		} );

		expect( model.schema.checkAttribute( 'rawHtml', 'foo' ) ).to.be.true;
	} );

	it( 'should register the htmlEmbed command', () => {
		expect( editor.commands.get( 'htmlEmbed' ) ).to.be.instanceOf( HtmlEmbedCommand );
	} );

	describe( 'config', () => {
		let htmlEmbed;

		beforeEach( () => {
			htmlEmbed = editor.config.get( 'htmlEmbed' );
		} );

		describe( 'htmlEmbed.showPreviews', () => {
			it( 'should be set to `false` by default', () => {
				expect( htmlEmbed.showPreviews ).to.equal( false );
			} );
		} );

		describe( 'htmlEmbed.sanitizeHtml', () => {
			beforeEach( () => {
				sinon.stub( console, 'warn' );
			} );

			it( 'should return an object with cleaned html and a note whether something has changed', () => {
				expect( htmlEmbed.sanitizeHtml( 'foo' ) ).to.deep.equal( {
					html: 'foo',
					hasChanged: false
				} );
			} );

			it( 'should return an input string (without any modifications)', () => {
				const unsafeHtml = '<img src="data:/xxx,<script>void</script>" onload="void;">';

				expect( htmlEmbed.sanitizeHtml( unsafeHtml ).html ).to.deep.equal( unsafeHtml );
			} );

			it( 'should display a warning when using the default sanitizer', () => {
				htmlEmbed.sanitizeHtml( 'foo' );

				expect( console.warn.callCount ).to.equal( 1 );
				expect( console.warn.firstCall.args[ 0 ] ).to.equal( 'html-embed-provide-sanitize-function' );
			} );
		} );
	} );

	describe( 'conversion in the data pipeline', () => {
		describe( 'model to view', () => {
			it( 'should convert an empty `rawHtml` element', () => {
				setModelData( model, '[<rawHtml></rawHtml>]' );

				expect( editor.getData() ).to.equal( '<div class="raw-html-embed"></div>' );
			} );

			it( 'should put the HTML from the `value` attribute (in `rawHtml`) into the data', () => {
				setModelData( model, '[<rawHtml></rawHtml>]' );

				model.change( writer => {
					writer.setAttribute( 'value', '<b>Foo.</b>', model.document.getRoot().getChild( 0 ) );
				} );

				expect( editor.getData() ).to.equal(
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
				expect( rawHtml.getAttribute( 'value' ) ).to.equal( '<b>Foo.</b>' );
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

				expect( rawHtml.getAttribute( 'value' ) ).to.equal(
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

				expect( rawHtml.getAttribute( 'value' ) ).to.equal(
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

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( '<div></div>' );
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

				expect( rawHtml.getAttribute( 'value' ) ).to.equal(
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

				expect( rawHtml.getAttribute( 'value' ) ).to.equal( rawContent );
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
					stopPropagation: sinon.spy(),
					preventDefault: sinon.spy()
				} );

				const rawHtml = model.document.getRoot().getChild( 0 );

				expect( rawHtml.getAttribute( 'value' ) ).to.equal(
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
				setModelData( model, '<rawHtml></rawHtml>' );
				const widget = viewDocument.getRoot().getChild( 0 );

				expect( widget.name ).to.equal( 'div' );
				expect( isRawHtmlWidget( widget ) ).to.be.true;

				const contentWrapper = widget.getChild( 1 );

				expect( contentWrapper.hasClass( 'raw-html-embed__content-wrapper' ) );
			} );

			it( 'the widget should have the data-html-embed-label attribute for the CSS label', () => {
				setModelData( model, '<rawHtml></rawHtml>' );
				const widget = viewDocument.getRoot().getChild( 0 );

				expect( widget.getAttribute( 'data-html-embed-label' ) ).to.equal( 'HTML snippet' );
			} );

			it( 'the main element should expose rawHtmlApi custom property', () => {
				setModelData( model, '<rawHtml></rawHtml>' );
				const widget = viewDocument.getRoot().getChild( 0 );

				expect( widget.getCustomProperty( 'rawHtmlApi' ) ).has.keys( [ 'makeEditable', 'save', 'cancel' ] );
			} );

			it( 'renders a disabled textarea as a preview', () => {
				setModelData( model, '<rawHtml value="foo"></rawHtml>' );
				const widget = viewDocument.getRoot().getChild( 0 );
				const contentWrapper = widget.getChild( 1 );
				const domContentWrapper = editor.editing.view.domConverter.mapViewToDom( contentWrapper );

				expect( domContentWrapper.querySelector( 'textarea.raw-html-embed__source' ).value ).to.equal( 'foo' );
				expect( domContentWrapper.querySelector( 'textarea.raw-html-embed__source' ).disabled ).to.be.true;
			} );

			it( 'updates the textarea preview once the model changes', () => {
				setModelData( model, '<rawHtml value="foo"></rawHtml>' );

				editor.model.change( writer => writer.setAttribute( 'value', 'bar', editor.model.document.getRoot().getChild( 0 ) ) );

				const widget = viewDocument.getRoot().getChild( 0 );
				const contentWrapper = widget.getChild( 1 );
				const domContentWrapper = editor.editing.view.domConverter.mapViewToDom( contentWrapper );

				expect( domContentWrapper.querySelector( 'textarea.raw-html-embed__source' ).value ).to.equal( 'bar' );
				expect( domContentWrapper.querySelector( 'textarea.raw-html-embed__source' ).disabled ).to.be.true;
			} );

			it( 'renders the "edit" button', () => {
				setModelData( model, '<rawHtml value="foo"></rawHtml>' );
				const widget = viewDocument.getRoot().getChild( 0 );
				const contentWrapper = widget.getChild( 1 );
				const domContentWrapper = editor.editing.view.domConverter.mapViewToDom( contentWrapper );

				// There's exactly this button, and nothing else.
				expect( domContentWrapper.querySelectorAll( 'button' ) ).to.have.lengthOf( 1 );
				expect( domContentWrapper.querySelectorAll( '.raw-html-embed__edit-button' ) ).to.have.lengthOf( 1 );
			} );

			it( 'allows editing the source after clicking the "edit" button', () => {
				setModelData( model, '<rawHtml value="foo"></rawHtml>' );
				const widget = viewDocument.getRoot().getChild( 0 );
				const contentWrapper = widget.getChild( 1 );
				const domContentWrapper = editor.editing.view.domConverter.mapViewToDom( contentWrapper );

				const makeEditableStub = sinon.stub( widget.getCustomProperty( 'rawHtmlApi' ), 'makeEditable' );

				domContentWrapper.querySelector( '.raw-html-embed__edit-button' ).click();

				expect( makeEditableStub.callCount ).to.equal( 1 );
			} );

			it( 'renders the "save changes" and "cancel" button in edit source mode', () => {
				setModelData( model, '<rawHtml value="foo"></rawHtml>' );
				const widget = viewDocument.getRoot().getChild( 0 );
				const contentWrapper = widget.getChild( 1 );
				const domContentWrapper = editor.editing.view.domConverter.mapViewToDom( contentWrapper );

				widget.getCustomProperty( 'rawHtmlApi' ).makeEditable();

				expect( domContentWrapper.querySelectorAll( 'button' ) ).to.have.lengthOf( 2 );
				expect( domContentWrapper.querySelectorAll( '.raw-html-embed__save-button' ) ).to.have.lengthOf( 1 );
				expect( domContentWrapper.querySelectorAll( '.raw-html-embed__cancel-button' ) ).to.have.lengthOf( 1 );
			} );

			it( 'updates the model state after clicking the "save changes" button', () => {
				setModelData( model, '<rawHtml value="foo"></rawHtml>' );
				const widget = viewDocument.getRoot().getChild( 0 );
				const contentWrapper = widget.getChild( 1 );
				const domContentWrapper = editor.editing.view.domConverter.mapViewToDom( contentWrapper );

				widget.getCustomProperty( 'rawHtmlApi' ).makeEditable();

				domContentWrapper.querySelector( 'textarea' ).value = 'Foo Bar.';
				domContentWrapper.querySelector( '.raw-html-embed__save-button' ).click();

				expect( getModelData( model ) ).to.equal( '[<rawHtml value="Foo Bar."></rawHtml>]' );
			} );

			it( 'switches to "preview mode" after saving changes', () => {
				setModelData( model, '<rawHtml value="foo"></rawHtml>' );

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
				expect( domContentWrapper.querySelectorAll( 'button' ) ).to.have.lengthOf( 1 );
				expect( domContentWrapper.querySelectorAll( '.raw-html-embed__edit-button' ) ).to.have.lengthOf( 1 );
			} );

			it( 'switches to "preview mode" after clicking save button when there are no changes', () => {
				setModelData( model, '<rawHtml value="foo"></rawHtml>' );

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
				expect( domContentWrapper.querySelectorAll( 'button' ) ).to.have.lengthOf( 1 );
				expect( domContentWrapper.querySelectorAll( '.raw-html-embed__edit-button' ) ).to.have.lengthOf( 1 );
			} );

			it( 'destroys unused buttons when the editing view is re-rendered to prevent memory leaks', () => {
				setModelData( model, '<rawHtml value="foo"></rawHtml>' );
				const widget = viewDocument.getRoot().getChild( 0 );
				const contentWrapper = widget.getChild( 1 );
				const domContentWrapper = editor.editing.view.domConverter.mapViewToDom( contentWrapper );

				const buttonDestroySpy = testUtils.sinon.spy( ButtonView.prototype, 'destroy' );
				const buttonRenderSpy = testUtils.sinon.spy( ButtonView.prototype, 'render' );

				domContentWrapper.querySelector( '.raw-html-embed__edit-button' ).click();

				// The edit button was destroyed.
				sinon.assert.calledOn( buttonDestroySpy.firstCall, sinon.match.instanceOf( ButtonView ) );
				sinon.assert.callCount( buttonDestroySpy, 1 );

				// Save and cancel button were created.
				sinon.assert.calledOn( buttonRenderSpy.firstCall, sinon.match.instanceOf( ButtonView ) );
				sinon.assert.calledOn( buttonRenderSpy.secondCall, sinon.match.instanceOf( ButtonView ) );
				sinon.assert.callCount( buttonRenderSpy, 2 );

				buttonDestroySpy.resetHistory();
				domContentWrapper.querySelector( '.raw-html-embed__cancel-button' ).click();

				// Save and cancel button were destroyed.
				sinon.assert.calledOn( buttonDestroySpy.firstCall, sinon.match.instanceOf( ButtonView ) );
				sinon.assert.calledOn( buttonDestroySpy.secondCall, sinon.match.instanceOf( ButtonView ) );
				sinon.assert.callCount( buttonDestroySpy, 2 );
			} );

			it( 'does not lose editor focus after saving changes', () => {
				setModelData( model, '<rawHtml value="foo"></rawHtml>' );
				const widget = viewDocument.getRoot().getChild( 0 );
				const contentWrapper = widget.getChild( 1 );
				const domContentWrapper = editor.editing.view.domConverter.mapViewToDom( contentWrapper );
				const spy = sinon.spy( editor.editing.view, 'focus' );

				widget.getCustomProperty( 'rawHtmlApi' ).makeEditable();

				domContentWrapper.querySelector( 'textarea' ).value = 'Foo Bar.';
				domContentWrapper.querySelector( '.raw-html-embed__save-button' ).click();

				sinon.assert.calledOnce( spy );
			} );

			it( 'does not update the model state after saving the same changes', () => {
				setModelData( model, '<rawHtml value="foo"></rawHtml>' );
				const widget = viewDocument.getRoot().getChild( 0 );
				const contentWrapper = widget.getChild( 1 );
				const domContentWrapper = editor.editing.view.domConverter.mapViewToDom( contentWrapper );

				const executeStub = sinon.stub( editor.commands.get( 'htmlEmbed' ), 'execute' );

				widget.getCustomProperty( 'rawHtmlApi' ).makeEditable();
				domContentWrapper.querySelector( '.raw-html-embed__save-button' ).click();

				expect( executeStub.callCount ).to.equal( 0 );
			} );

			it( 'does not update the model state after clicking the "cancel" button', () => {
				setModelData( model, '<rawHtml value="foo"></rawHtml>' );
				const widget = viewDocument.getRoot().getChild( 0 );
				const contentWrapper = widget.getChild( 1 );
				const domContentWrapper = editor.editing.view.domConverter.mapViewToDom( contentWrapper );

				widget.getCustomProperty( 'rawHtmlApi' ).makeEditable();
				domContentWrapper.querySelector( '.raw-html-embed__cancel-button' ).click();

				expect( getModelData( model ) ).to.equal( '[<rawHtml value="foo"></rawHtml>]' );
			} );

			it( 'switches to "preview mode" after canceling editing', () => {
				setModelData( model, '<rawHtml value="foo"></rawHtml>' );
				const widget = viewDocument.getRoot().getChild( 0 );
				const contentWrapper = widget.getChild( 1 );
				const domContentWrapper = editor.editing.view.domConverter.mapViewToDom( contentWrapper );

				widget.getCustomProperty( 'rawHtmlApi' ).makeEditable();

				domContentWrapper.querySelector( '.raw-html-embed__cancel-button' ).click();

				expect( domContentWrapper.querySelector( 'textarea.raw-html-embed__source' ).value ).to.equal( 'foo' );
				expect( domContentWrapper.querySelector( 'textarea.raw-html-embed__source' ).disabled ).to.be.true;
			} );

			it( 'does not lose editor focus after canceling editing', () => {
				setModelData( model, '<rawHtml value="foo"></rawHtml>' );
				const widget = viewDocument.getRoot().getChild( 0 );
				const contentWrapper = widget.getChild( 1 );
				const domContentWrapper = editor.editing.view.domConverter.mapViewToDom( contentWrapper );
				const spy = sinon.spy( editor.editing.view, 'focus' );

				widget.getCustomProperty( 'rawHtmlApi' ).makeEditable();

				domContentWrapper.querySelector( '.raw-html-embed__cancel-button' ).click();

				sinon.assert.calledOnce( spy );
			} );

			it( 'does not select the unselected `rawHtml` element, if it is not in the editable mode', () => {
				setModelData( model, '[<rawHtml value="foo"></rawHtml>]<rawHtml value="bar"></rawHtml>' );

				// Get the second widget.
				const widget = viewDocument.getRoot().getChild( 1 );
				const contentWrapper = widget.getChild( 1 );
				const domContentWrapper = editor.editing.view.domConverter.mapViewToDom( contentWrapper );

				domContentWrapper.querySelector( 'textarea' ).dispatchEvent( new Event( 'mousedown' ) );

				expect( getModelData( model ) ).to.equal( '[<rawHtml value="foo"></rawHtml>]<rawHtml value="bar"></rawHtml>' );
			} );

			it( 'does not unnecessarily select an already selected `rawHtml` element in the editable mode', () => {
				setModelData( model, '[<rawHtml value="foo"></rawHtml>]' );

				const spy = sinon.spy();

				model.document.selection.on( 'change:range', spy );

				const widget = viewDocument.getRoot().getChild( 0 );
				const contentWrapper = widget.getChild( 1 );
				const domContentWrapper = editor.editing.view.domConverter.mapViewToDom( contentWrapper );

				widget.getCustomProperty( 'rawHtmlApi' ).makeEditable();

				domContentWrapper.querySelector( 'textarea' ).dispatchEvent( new Event( 'mousedown' ) );

				expect( spy.notCalled ).to.be.true;
			} );

			it( 'selects the unselected `rawHtml` element in editable mode after clicking on its textarea', () => {
				setModelData( model, '<rawHtml value="foo"></rawHtml><rawHtml value="bar"></rawHtml>' );

				const widgetFoo = viewDocument.getRoot().getChild( 0 );
				const widgetBar = viewDocument.getRoot().getChild( 1 );

				const contentWrapperFoo = widgetFoo.getChild( 1 );
				const contentWrapperBar = widgetBar.getChild( 1 );

				const domContentWrapperFoo = editor.editing.view.domConverter.mapViewToDom( contentWrapperFoo );
				const domContentWrapperBar = editor.editing.view.domConverter.mapViewToDom( contentWrapperBar );

				widgetFoo.getCustomProperty( 'rawHtmlApi' ).makeEditable();
				widgetBar.getCustomProperty( 'rawHtmlApi' ).makeEditable();

				domContentWrapperFoo.querySelector( 'textarea' ).dispatchEvent( new Event( 'mousedown' ) );

				expect( getModelData( model ) ).to.equal( '[<rawHtml value="foo"></rawHtml>]<rawHtml value="bar"></rawHtml>' );

				domContentWrapperBar.querySelector( 'textarea' ).dispatchEvent( new Event( 'mousedown' ) );

				expect( getModelData( model ) ).to.equal( '<rawHtml value="foo"></rawHtml>[<rawHtml value="bar"></rawHtml>]' );
			} );

			describe( 'different setting of ui language', () => {
				it( 'the widget should have the dir attribute for LTR language', () => {
					sinon.stub( editor.locale, 'uiLanguageDirection' ).value( 'ltr' );

					setModelData( model, '<rawHtml></rawHtml>' );
					const widget = viewDocument.getRoot().getChild( 0 );

					expect( widget.getAttribute( 'dir' ) ).to.equal( 'ltr' );
				} );

				it( 'the widget should have the dir attribute for RTL language', () => {
					sinon.stub( editor.locale, 'uiLanguageDirection' ).value( 'rtl' );

					setModelData( model, '<rawHtml></rawHtml>' );
					const widget = viewDocument.getRoot().getChild( 0 );

					expect( widget.getAttribute( 'dir' ) ).to.equal( 'rtl' );
				} );
			} );

			describe( 'rawHtmlApi.makeEditable()', () => {
				it( 'makes the textarea editable', () => {
					setModelData( model, '<rawHtml value="foo"></rawHtml>' );
					const widget = viewDocument.getRoot().getChild( 0 );
					const contentWrapper = widget.getChild( 1 );
					const domContentWrapper = editor.editing.view.domConverter.mapViewToDom( contentWrapper );

					widget.getCustomProperty( 'rawHtmlApi' ).makeEditable();

					expect( domContentWrapper.querySelector( 'textarea.raw-html-embed__source' ).value ).to.equal( 'foo' );
					expect( domContentWrapper.querySelector( 'textarea.raw-html-embed__source' ).disabled ).to.be.false;
				} );
			} );

			describe( 'rawHtmlApi.save()', () => {
				it( 'saves the new value to the model', () => {
					setModelData( model, '<rawHtml value="foo"></rawHtml>' );
					const widget = viewDocument.getRoot().getChild( 0 );

					widget.getCustomProperty( 'rawHtmlApi' ).makeEditable();
					widget.getCustomProperty( 'rawHtmlApi' ).save( 'bar' );

					expect( getModelData( model ) ).to.equal( '[<rawHtml value="bar"></rawHtml>]' );
				} );

				it( 'saves the new value to the model if given `rawHtml` element is not selected', () => {
					setModelData( model, '<rawHtml value="foo"></rawHtml><rawHtml value="bar"></rawHtml>' );

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

					expect( getModelData( model ) ).to.equal( '<rawHtml value="FOO"></rawHtml>[<rawHtml value="BAR"></rawHtml>]' );
				} );

				it( 'turns back to the non-editable mode and updates the textarea value', () => {
					setModelData( model, '<rawHtml value="foo"></rawHtml>' );
					const widget = viewDocument.getRoot().getChild( 0 );

					widget.getCustomProperty( 'rawHtmlApi' ).makeEditable();
					widget.getCustomProperty( 'rawHtmlApi' ).save( 'bar' );

					const newWidget = viewDocument.getRoot().getChild( 0 );
					const contentWrapper = newWidget.getChild( 1 );
					const domContentWrapper = editor.editing.view.domConverter.mapViewToDom( contentWrapper );
					expect( domContentWrapper.querySelector( 'textarea.raw-html-embed__source' ).value ).to.equal( 'bar' );
					expect( domContentWrapper.querySelector( 'textarea.raw-html-embed__source' ).disabled ).to.be.true;
				} );
			} );
		} );

		describe( 'with previews (htmlEmbed.showPreviews=true)', () => {
			let element, editor, model, view, viewDocument, sanitizeHtml;

			testUtils.createSinonSandbox();

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
				setModelData( model, '<rawHtml value="foo"></rawHtml>' );
				const widget = viewDocument.getRoot().getChild( 0 );
				const contentWrapper = widget.getChild( 1 );
				const domContentWrapper = editor.editing.view.domConverter.mapViewToDom( contentWrapper );

				expect( domContentWrapper.querySelector( 'div.raw-html-embed__preview-content' ).innerHTML )
					.to.equal( 'foo' );

				expect( domContentWrapper.querySelector( 'div.raw-html-embed__preview-placeholder' ) )
					.to.not.equal( null );
			} );

			it( 'should update the preview once the model changes', () => {
				setModelData( model, '<rawHtml value="foo"></rawHtml>' );

				editor.model.change( writer => writer.setAttribute( 'value', 'bar', editor.model.document.getRoot().getChild( 0 ) ) );

				const widget = viewDocument.getRoot().getChild( 0 );
				const contentWrapper = widget.getChild( 1 );
				const domContentWrapper = editor.editing.view.domConverter.mapViewToDom( contentWrapper );

				expect( domContentWrapper.querySelector( 'div.raw-html-embed__preview-content' ).innerHTML ).to.equal( 'bar' );
			} );

			describe( 'placeholder', () => {
				function getPlaceholder() {
					const widget = viewDocument.getRoot().getChild( 0 );
					const contentWrapper = widget.getChild( 1 );
					const domContentWrapper = editor.editing.view.domConverter.mapViewToDom( contentWrapper );

					return domContentWrapper.querySelector( 'div.raw-html-embed__preview-placeholder' );
				}

				it( 'should inherit the styles from the editor', () => {
					setModelData( model, '<rawHtml value=""></rawHtml>' );
					const placeholder = getPlaceholder();

					expect( placeholder.classList.value ).to.contain( 'ck ck-reset_all' );
				} );

				it( 'should display the proper information if the snippet is empty', () => {
					setModelData( model, '<rawHtml value=""></rawHtml>' );
					const placeholder = getPlaceholder();

					expect( placeholder.innerHTML ).to.equal( 'Empty snippet content' );
				} );

				it( 'should display the proper information if the snippet is not empty', () => {
					setModelData( model, '<rawHtml value="foo"></rawHtml>' );
					const placeholder = getPlaceholder();

					expect( placeholder.innerHTML ).to.equal( 'No preview available' );
				} );

				// #8326.
				it( 'should execute vulnerable scripts inside the <script> element', () => {
					const logWarn = sinon.stub( console, 'warn' );

					setModelData( model, '[<rawHtml value=""></rawHtml>]' );
					editor.execute( 'htmlEmbed', '<script>console.warn( \'Should be called.\' )</script>' );

					logWarn.restore();

					expect( logWarn.callCount ).to.equal( 1 );
					expect( logWarn.firstCall.args[ 0 ] ).to.equal( 'Should be called.' );

					expect( editor.getData() ).to.equal(
						'<div class="raw-html-embed"><script>console.warn( \'Should be called.\' )</script></div>'
					);
				} );
			} );

			describe( 'different setting of ui and content language', () => {
				it( 'the widget and preview should have the dir attribute for LTR language', () => {
					sinon.stub( editor.locale, 'uiLanguageDirection' ).value( 'ltr' );
					sinon.stub( editor.locale, 'contentLanguageDirection' ).value( 'ltr' );

					setModelData( model, '<rawHtml></rawHtml>' );
					const widget = viewDocument.getRoot().getChild( 0 );
					const domPreview = getDomPreview( widget );

					expect( widget.getAttribute( 'dir' ) ).to.equal( 'ltr' );
					expect( domPreview.getAttribute( 'dir' ) ).to.equal( 'ltr' );
				} );

				it( 'the widget and preview should have the dir attribute for RTL language', () => {
					sinon.stub( editor.locale, 'uiLanguageDirection' ).value( 'rtl' );
					sinon.stub( editor.locale, 'contentLanguageDirection' ).value( 'rtl' );

					setModelData( model, '<rawHtml></rawHtml>' );
					const widget = viewDocument.getRoot().getChild( 0 );
					const domPreview = getDomPreview( widget );

					expect( widget.getAttribute( 'dir' ) ).to.equal( 'rtl' );
					expect( domPreview.getAttribute( 'dir' ) ).to.equal( 'rtl' );
				} );

				it( 'the widget should have the dir attribute for LTR language, but preview for RTL', () => {
					sinon.stub( editor.locale, 'uiLanguageDirection' ).value( 'ltr' );
					sinon.stub( editor.locale, 'contentLanguageDirection' ).value( 'rtl' );

					setModelData( model, '<rawHtml></rawHtml>' );
					const widget = viewDocument.getRoot().getChild( 0 );
					const domPreview = getDomPreview( widget );

					expect( widget.getAttribute( 'dir' ) ).to.equal( 'ltr' );
					expect( domPreview.getAttribute( 'dir' ) ).to.equal( 'rtl' );
				} );

				it( 'the widget should have the dir attribute for RTL language, butPreview for LTR', () => {
					sinon.stub( editor.locale, 'uiLanguageDirection' ).value( 'rtl' );
					sinon.stub( editor.locale, 'contentLanguageDirection' ).value( 'ltr' );

					setModelData( model, '<rawHtml></rawHtml>' );
					const widget = viewDocument.getRoot().getChild( 0 );
					const domPreview = getDomPreview( widget );

					expect( widget.getAttribute( 'dir' ) ).to.equal( 'rtl' );
					expect( domPreview.getAttribute( 'dir' ) ).to.equal( 'ltr' );
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
				setModelData( model, '<rawHtml value="foo"></rawHtml>' );

				const widget = viewDocument.getRoot().getChild( 0 );
				const contentWrapper = widget.getChild( 1 );
				const domContentWrapper = editor.editing.view.domConverter.mapViewToDom( contentWrapper );
				const editButton = domContentWrapper.querySelector( '.raw-html-embed__edit-button' );

				editor.enableReadOnlyMode( 'unit-test' );
				expect( editButton.classList.contains( 'ck-disabled' ) ).to.be.true;

				editor.disableReadOnlyMode( 'unit-test' );
				expect( editButton.classList.contains( 'ck-disabled' ) ).to.be.false;
			} );

			it( 'should disable the edit button when the command gets disabled', () => {
				setModelData( model, '<rawHtml value="foo"></rawHtml>' );

				const widget = viewDocument.getRoot().getChild( 0 );
				const contentWrapper = widget.getChild( 1 );
				const domContentWrapper = editor.editing.view.domConverter.mapViewToDom( contentWrapper );
				const htmlEmbedCommand = editor.commands.get( 'htmlEmbed' );
				const editButton = domContentWrapper.querySelector( '.raw-html-embed__edit-button' );

				htmlEmbedCommand.forceDisabled();
				expect( editButton.classList.contains( 'ck-disabled' ) ).to.be.true;

				htmlEmbedCommand.clearForceDisabled();
				expect( editButton.classList.contains( 'ck-disabled' ) ).to.be.false;
			} );

			it( 'should disable the save button (but not the cancel button) when the editor goes read-only', () => {
				setModelData( model, '<rawHtml value="foo"></rawHtml>' );

				const widget = viewDocument.getRoot().getChild( 0 );
				const contentWrapper = widget.getChild( 1 );
				const domContentWrapper = editor.editing.view.domConverter.mapViewToDom( contentWrapper );

				// Go to edit mode.
				domContentWrapper.querySelector( '.raw-html-embed__edit-button' ).click();

				const saveButton = domContentWrapper.querySelector( '.raw-html-embed__save-button' );
				const cancelButton = domContentWrapper.querySelector( '.raw-html-embed__cancel-button' );

				editor.enableReadOnlyMode( 'unit-test' );
				expect( saveButton.classList.contains( 'ck-disabled' ) ).to.be.true;
				expect( cancelButton.classList.contains( 'ck-disabled' ) ).to.be.false;

				editor.disableReadOnlyMode( 'unit-test' );
				expect( saveButton.classList.contains( 'ck-disabled' ) ).to.be.false;
				expect( cancelButton.classList.contains( 'ck-disabled' ) ).to.be.false;
			} );

			it( 'should disable the save button (but not the cancel button) when the command gets disabled', () => {
				setModelData( model, '<rawHtml value="foo"></rawHtml>' );

				const widget = viewDocument.getRoot().getChild( 0 );
				const contentWrapper = widget.getChild( 1 );
				const domContentWrapper = editor.editing.view.domConverter.mapViewToDom( contentWrapper );
				const htmlEmbedCommand = editor.commands.get( 'htmlEmbed' );

				// Go to edit mode.
				domContentWrapper.querySelector( '.raw-html-embed__edit-button' ).click();

				const saveButton = domContentWrapper.querySelector( '.raw-html-embed__save-button' );
				const cancelButton = domContentWrapper.querySelector( '.raw-html-embed__cancel-button' );

				htmlEmbedCommand.forceDisabled();
				expect( saveButton.classList.contains( 'ck-disabled' ) ).to.be.true;
				expect( cancelButton.classList.contains( 'ck-disabled' ) ).to.be.false;

				htmlEmbedCommand.clearForceDisabled();
				expect( saveButton.classList.contains( 'ck-disabled' ) ).to.be.false;
				expect( cancelButton.classList.contains( 'ck-disabled' ) ).to.be.false;
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
