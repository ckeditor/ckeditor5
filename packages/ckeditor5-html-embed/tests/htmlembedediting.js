/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global console, document */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import HtmlEmbedEditing from '../src/htmlembedediting';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import UpdateHtmlEmbedCommand from '../src/updatehtmlembedcommand';
import InsertHtmlEmbedCommand from '../src/inserthtmlembedcommand';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { isWidget } from '@ckeditor/ckeditor5-widget/src/utils';

describe( 'HtmlEmbedEditing', () => {
	let element, editor, model, view, viewDocument;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [ HtmlEmbedEditing ]
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

	describe( 'commands', () => {
		it( 'should register updateHtmlEmbed command', () => {
			expect( editor.commands.get( 'updateHtmlEmbed' ) ).to.be.instanceOf( UpdateHtmlEmbedCommand );
		} );

		it( 'should register insertHtmlEmbed command', () => {
			expect( editor.commands.get( 'insertHtmlEmbed' ) ).to.be.instanceOf( InsertHtmlEmbedCommand );
		} );
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

				const executeStub = sinon.stub( editor.commands.get( 'updateHtmlEmbed' ), 'execute' );

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

			it( 'renders a div with a preview', () => {
				setModelData( model, '<rawHtml value="foo"></rawHtml>' );
				const widget = viewDocument.getRoot().getChild( 0 );
				const contentWrapper = widget.getChild( 1 );
				const domContentWrapper = editor.editing.view.domConverter.mapViewToDom( contentWrapper );

				expect( domContentWrapper.querySelector( 'div.raw-html-embed__preview' ).innerHTML ).to.equal( 'foo' );
			} );

			it( 'updates the preview once the model changes', () => {
				setModelData( model, '<rawHtml value="foo"></rawHtml>' );

				editor.model.change( writer => writer.setAttribute( 'value', 'bar', editor.model.document.getRoot().getChild( 0 ) ) );

				const widget = viewDocument.getRoot().getChild( 0 );
				const contentWrapper = widget.getChild( 1 );
				const domContentWrapper = editor.editing.view.domConverter.mapViewToDom( contentWrapper );

				expect( domContentWrapper.querySelector( 'div.raw-html-embed__preview' ).innerHTML ).to.equal( 'bar' );
			} );
		} );
	} );
} );

function isRawHtmlWidget( viewElement ) {
	return !!viewElement.getCustomProperty( 'rawHtml' ) && isWidget( viewElement );
}
