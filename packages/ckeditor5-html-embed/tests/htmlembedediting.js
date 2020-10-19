/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global console, document, HTMLTextAreaElement, HTMLDivElement, Event */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import HtmlEmbedEditing from '../src/htmlembedediting';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import HtmlEmbedUpdateCommand from '../src/htmlembedupdatecommand';
import HtmlEmbedInsertCommand from '../src/htmlembedinsertcommand';
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
		it( 'should register htmlEmbedUpdate command', () => {
			expect( editor.commands.get( 'htmlEmbedUpdate' ) ).to.be.instanceOf( HtmlEmbedUpdateCommand );
		} );

		it( 'should register htmlEmbedInsert command', () => {
			expect( editor.commands.get( 'htmlEmbedInsert' ) ).to.be.instanceOf( HtmlEmbedInsertCommand );
		} );
	} );

	describe( 'config', () => {
		let htmlEmbed;

		beforeEach( () => {
			htmlEmbed = editor.config.get( 'htmlEmbed' );
		} );

		describe( 'htmlEmbed.previewsInData', () => {
			it( 'should be set to `false` by default', () => {
				expect( htmlEmbed.previewsInData ).to.equal( false );
			} );
		} );

		describe( 'htmlEmbed.sanitizeHtml', () => {
			beforeEach( () => {
				sinon.stub( console, 'warn' );
			} );

			it( 'should return an object with cleaned html and a note whether something has changed', () => {
				expect( htmlEmbed.sanitizeHtml( 'foo' ) ).to.deep.equal( {
					html: 'foo',
					hasModified: false
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

	describe( 'conversion in data pipeline', () => {
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

	describe( 'conversion in editing pipeline (model to view)', () => {
		describe( 'without previews (htmlEmbed.dataInPreviews=false)', () => {
			it( 'converted element should be widgetized', () => {
				setModelData( model, '<rawHtml></rawHtml>' );
				const widget = viewDocument.getRoot().getChild( 0 );

				expect( widget.name ).to.equal( 'div' );
				expect( isRawHtmlWidget( widget ) ).to.be.true;

				const rawHtmlContainer = widget.getChild( 0 );

				expect( rawHtmlContainer ).to.not.be.undefined;
			} );

			it( 'should not contain a class that informs about available preview mode', () => {
				setModelData( model, '<rawHtml></rawHtml>' );

				const widget = viewDocument.getRoot().getChild( 0 );

				expect( widget.hasClass( 'raw-html--preview-enabled' ) ).to.equal( false );
			} );

			it( 'should render the toggle mode icon and edit source elements', () => {
				setModelData( model, '<rawHtml></rawHtml>' );

				const widgetWrapper = viewDocument.getRoot().getChild( 0 );
				const viewHtmlContainer = widgetWrapper.getChild( 0 );

				expect( viewHtmlContainer.childCount ).to.equal( 2 );

				const toggleIconElement = viewHtmlContainer.getChild( 0 );

				expect( toggleIconElement.is( 'uiElement' ) ).to.equal( true );
				expect( toggleIconElement.getCustomProperty( 'domElement' ) ).to.be.an.instanceOf( HTMLDivElement );

				const sourceElement = viewHtmlContainer.getChild( 1 );

				expect( sourceElement.is( 'uiElement' ) ).to.equal( true );
				expect( sourceElement.getCustomProperty( 'domElement' ) ).to.be.an.instanceOf( HTMLTextAreaElement );
			} );

			it( 'source element should have a placeholder', () => {
				setModelData( model, '<rawHtml></rawHtml>' );

				const widgetWrapper = viewDocument.getRoot().getChild( 0 );
				const viewHtmlContainer = widgetWrapper.getChild( 0 );
				const sourceElement = viewHtmlContainer.getChild( 1 );

				expect( sourceElement.getAttribute( 'placeholder' ) ).to.equal( 'Paste the raw code here.' );
			} );

			it( 'should update the edit source element when the `value` attribute has changed', () => {
				setModelData( model, '<rawHtml></rawHtml>' );

				model.change( writer => {
					writer.setAttribute( 'value', '<b>Foo.</b>', model.document.getRoot().getChild( 0 ) );
				} );

				const widgetWrapper = viewDocument.getRoot().getChild( 0 );
				const viewHtmlContainer = widgetWrapper.getChild( 0 );
				const sourceElement = viewHtmlContainer.getChild( 1 );

				expect( sourceElement.getCustomProperty( 'domElement' ).value ).to.equal( '<b>Foo.</b>' );
			} );

			it( 'should update the `value` attribute after applying changes in the edit source element', () => {
				setModelData( model, '<rawHtml></rawHtml>' );

				const event = new Event( 'input' );

				const widgetWrapper = viewDocument.getRoot().getChild( 0 );
				const viewHtmlContainer = widgetWrapper.getChild( 0 );
				const sourceElement = viewHtmlContainer.getChild( 1 );

				const textarea = sourceElement.getCustomProperty( 'domElement' );

				textarea.value = '<b>Foo.</b>';
				textarea.dispatchEvent( event );

				expect( model.document.getRoot().getChild( 0 ).getAttribute( 'value' ) ).to.equal( '<b>Foo.</b>' );
			} );

			it( 'should show the preview element by default', () => {
				setModelData( model, '<rawHtml value="Foo"></rawHtml>' );

				const widgetWrapper = viewDocument.getRoot().getChild( 0 );
				const viewHtmlContainer = widgetWrapper.getChild( 0 );
				const sourceElement = viewHtmlContainer.getChild( 1 );

				const textarea = sourceElement.getCustomProperty( 'domElement' );

				expect( textarea.disabled ).to.equal( true );
				expect( textarea.value ).to.equal( 'Foo' );
			} );

			it( 'should allows modifying the source after clicking the toggle icon', () => {
				setModelData( model, '<rawHtml></rawHtml>' );

				const widgetWrapper = viewDocument.getRoot().getChild( 0 );
				const viewHtmlContainer = widgetWrapper.getChild( 0 );

				const toggleIconElement = viewHtmlContainer.getChild( 0 );
				toggleIconElement.getCustomProperty( 'domElement' ).click();

				const sourceElement = viewHtmlContainer.getChild( 1 );

				expect( sourceElement.is( 'uiElement' ) ).to.equal( true );
				expect( sourceElement.getCustomProperty( 'domElement' ).disabled ).to.equal( false );
			} );
		} );

		describe( 'with previews (htmlEmbed.dataInPreviews=true)', () => {
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
							previewsInData: true,
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

			it( 'converted element should be widgetized', () => {
				setModelData( model, '<rawHtml></rawHtml>' );
				const widget = viewDocument.getRoot().getChild( 0 );

				expect( widget.name ).to.equal( 'div' );
				expect( isRawHtmlWidget( widget ) ).to.be.true;

				const rawHtmlContainer = widget.getChild( 0 );

				expect( rawHtmlContainer ).to.not.be.undefined;
			} );

			it( 'should contain a class that informs about available preview mode', () => {
				setModelData( model, '<rawHtml></rawHtml>' );

				const widget = viewDocument.getRoot().getChild( 0 );

				expect( widget.hasClass( 'raw-html--preview-enabled' ) ).to.equal( true );
			} );

			it( 'should update the source and preview elements when the `value` attribute has changed', () => {
				setModelData( model, '<rawHtml></rawHtml>' );

				model.change( writer => {
					writer.setAttribute( 'value', '<b>Foo.</b>', model.document.getRoot().getChild( 0 ) );
				} );

				const widgetWrapper = viewDocument.getRoot().getChild( 0 );
				const viewHtmlContainer = widgetWrapper.getChild( 0 );
				const sourceElement = viewHtmlContainer.getChild( 1 );
				const previewElement = viewHtmlContainer.getChild( 2 );

				expect( sourceElement.getCustomProperty( 'domElement' ).value ).to.equal( '<b>Foo.</b>' );
				expect( previewElement.getCustomProperty( 'domElement' ).innerHTML ).to.equal( '<b>Foo.</b>' );
			} );

			it( 'should render the toggle mode icon, edit source and preview container elements', () => {
				setModelData( model, '<rawHtml></rawHtml>' );

				const widgetWrapper = viewDocument.getRoot().getChild( 0 );
				const viewHtmlContainer = widgetWrapper.getChild( 0 );

				expect( viewHtmlContainer.childCount ).to.equal( 3 );

				const toggleIconElement = viewHtmlContainer.getChild( 0 );

				expect( toggleIconElement.is( 'uiElement' ) ).to.equal( true );
				expect( toggleIconElement.getCustomProperty( 'domElement' ) ).to.be.an.instanceOf( HTMLDivElement );

				const sourceElement = viewHtmlContainer.getChild( 1 );

				expect( sourceElement.is( 'uiElement' ) ).to.equal( true );
				expect( sourceElement.getCustomProperty( 'domElement' ) ).to.be.an.instanceOf( HTMLTextAreaElement );

				const previewElement = viewHtmlContainer.getChild( 2 );

				expect( previewElement.is( 'rawElement' ) ).to.equal( true );
				expect( previewElement.getCustomProperty( 'domElement' ) ).to.be.an.instanceOf( HTMLDivElement );
			} );

			it( 'source element should have a placeholder', () => {
				setModelData( model, '<rawHtml></rawHtml>' );

				const widgetWrapper = viewDocument.getRoot().getChild( 0 );
				const viewHtmlContainer = widgetWrapper.getChild( 0 );
				const sourceElement = viewHtmlContainer.getChild( 1 );

				expect( sourceElement.getAttribute( 'placeholder' ) ).to.equal( 'Paste the raw code here.' );
			} );

			it( 'should update the `value` attribute after applying changes in the edit source element', () => {
				setModelData( model, '<rawHtml></rawHtml>' );

				const event = new Event( 'input' );

				const widgetWrapper = viewDocument.getRoot().getChild( 0 );
				const viewHtmlContainer = widgetWrapper.getChild( 0 );
				const sourceElement = viewHtmlContainer.getChild( 1 );

				const textarea = sourceElement.getCustomProperty( 'domElement' );

				textarea.value = '<b>Foo.</b>';
				textarea.dispatchEvent( event );

				expect( model.document.getRoot().getChild( 0 ).getAttribute( 'value' ) ).to.equal( '<b>Foo.</b>' );
			} );

			it( 'should re-render the preview element after applying changes in the edit source element', () => {
				setModelData( model, '<rawHtml></rawHtml>' );

				const event = new Event( 'input' );

				const widgetWrapper = viewDocument.getRoot().getChild( 0 );
				const viewHtmlContainer = widgetWrapper.getChild( 0 );
				const sourceElement = viewHtmlContainer.getChild( 1 );

				const textarea = sourceElement.getCustomProperty( 'domElement' );

				textarea.value = '<b>Foo.</b>';
				textarea.dispatchEvent( event );

				const previewElement = viewHtmlContainer.getChild( 2 );

				expect( previewElement.getCustomProperty( 'domElement' ).innerHTML ).to.equal( '<b>Foo.</b>' );
			} );

			it( 'should show the preview element by default', () => {
				setModelData( model, '<rawHtml value="Foo"></rawHtml>' );

				const widgetWrapper = viewDocument.getRoot().getChild( 0 );

				expect( widgetWrapper.hasClass( 'raw-html--display-preview' ) ).to.equal( true );

				const viewHtmlContainer = widgetWrapper.getChild( 0 );
				const sourceElement = viewHtmlContainer.getChild( 1 );

				const textarea = sourceElement.getCustomProperty( 'domElement' );

				expect( textarea.disabled ).to.equal( true );
				expect( textarea.value ).to.equal( 'Foo' );

				const previewElement = viewHtmlContainer.getChild( 2 ).getCustomProperty( 'domElement' );
				expect( previewElement.innerHTML ).to.equal( 'Foo' );
			} );

			it( 'should allows modifying the source after clicking the toggle icon', () => {
				setModelData( model, '<rawHtml></rawHtml>' );

				const widgetWrapper = viewDocument.getRoot().getChild( 0 );
				const viewHtmlContainer = widgetWrapper.getChild( 0 );

				const toggleIconElement = viewHtmlContainer.getChild( 0 );
				toggleIconElement.getCustomProperty( 'domElement' ).click();

				expect( widgetWrapper.hasClass( 'raw-html--display-preview' ) ).to.equal( false );

				const sourceElement = viewHtmlContainer.getChild( 1 );
				expect( sourceElement.getCustomProperty( 'domElement' ).disabled ).to.equal( false );
			} );

			it( 'should display preview element after clicking the toggle icon when displaying edit source mode', () => {
				setModelData( model, '<rawHtml></rawHtml>' );

				const widgetWrapper = viewDocument.getRoot().getChild( 0 );
				const viewHtmlContainer = widgetWrapper.getChild( 0 );

				const toggleIconElement = viewHtmlContainer.getChild( 0 );
				// Switch to edit source mode.
				toggleIconElement.getCustomProperty( 'domElement' ).click();
				// Switch to preview mode.
				toggleIconElement.getCustomProperty( 'domElement' ).click();

				expect( widgetWrapper.hasClass( 'raw-html--display-preview' ) ).to.equal( true );

				const sourceElement = viewHtmlContainer.getChild( 1 );
				expect( sourceElement.getCustomProperty( 'domElement' ).disabled ).to.equal( true );
			} );
		} );
	} );
} );

function isRawHtmlWidget( viewElement ) {
	return !!viewElement.getCustomProperty( 'rawHtml' ) && isWidget( viewElement );
}
