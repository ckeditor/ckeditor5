/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import { Plugin } from '@ckeditor/ckeditor5-core';
import { ButtonView } from '@ckeditor/ckeditor5-ui/src';
import Command from '@ckeditor/ckeditor5-core/src/command';
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import { createElement } from 'ckeditor5/src/utils';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import List from '@ckeditor/ckeditor5-list/src/list';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';

class ExternalWidgetCommand extends Command {
	execute() {
		const editor = this.editor;

		const RESOURCE_URL = 'https://api2.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT';

		editor.model.change( writer => {
			const externalWidget = writer.createElement(
				'externalElement',
				{
					'data-resource-url': RESOURCE_URL,
					value: htmlToEmbed( RESOURCE_URL )
				}
			);

			editor.model.insertContent( externalWidget );
		} );
	}

	refresh() {
		this.isEnabled = true;
	}
}

class ExternalWidget extends Plugin {
	static get requires() {
		return [ ExternalWidgetEditing, ExternalWidgetUI ];
	}
}

class ExternalWidgetUI extends Plugin {
	init() {
		const editor = this.editor;

		editor.ui.componentFactory.add( 'external', locale => {
			const button = new ButtonView( locale );

			button.isEnabled = true;
			button.label = 'Insert Bitcoin rate';
			button.tooltip = true;
			button.withText = true;

			button.on( 'execute', () => {
				editor.execute( 'external' );
			} );

			return button;
		} );
	}
}

class ExternalWidgetEditing extends Plugin {
	static get requires() {
		return [ Widget ];
	}

	init() {
		const schema = this.editor.model.schema;

		schema.register( 'externalElement', {
			allowWhere: '$text',
			isObject: true,
			isInline: true,
			allowChildren: '$text',
			allowAttributesOf: '$text',
			allowAttributes: [ 'value', 'data-resource-url' ]
		} );

		this._defineSchema();
		this._defineConverters();

		this.editor.commands.add( 'external', new ExternalWidgetCommand( this.editor ) );
	}

	_defineSchema() {
		this.editor.data.registerRawContentMatcher( {
			name: 'span',
			classes: 'externalData'
		} );
	}

	_defineConverters() {
		const editor = this.editor;

		const htmlEmbedConfig = editor.config.get( 'externalDataEmbed' );

		editor.conversion.for( 'upcast' ).elementToElement( {
			view: {
				name: 'span',
				attributes: [ 'data-resource-url' ]
			},
			model: ( viewElement, { writer } ) => {
				const externalUrl = viewElement.getAttribute( 'data-resource-url' );

				return writer.createElement( 'externalElement', {
					value: htmlToEmbed( externalUrl )
				} );
			}
		} );

		editor.conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'externalElement',
			view: ( modelElement, { writer } ) => {
				return writer.createRawElement( 'span', {
					'data-resource-url': modelElement.getAttribute( 'data-resource-url' )
				} );
			}
		} );

		editor.conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'externalElement',
			view: ( modelItem, { writer: viewWriter } ) => {
				const rawHtmlValue = modelItem.getAttribute( 'value' ) || '';

				const viewContentWrapper = viewWriter.createRawElement( 'span', {
					class: 'external-data-embed__content-wrapper'
				}, function( domElement ) {
					renderContent( { domElement, editor, rawHtmlValue } );
				} );

				const viewContainer = viewWriter.createContainerElement( 'span', {
					class: 'external-data-embed',
					dir: editor.locale.uiLanguageDirection
				}, viewContentWrapper );

				viewWriter.setCustomProperty( 'externalElement', true, viewContainer );

				return toWidget( viewContainer, viewWriter, {
					widgetLabel: 'external data widget',
					hasSelectionHandle: true
				} );
			}
		} );

		function renderContent( { domElement, editor, rawHtmlValue } ) {
			// Remove all children;
			domElement.textContent = '';

			const domDocument = domElement.ownerDocument;

			const sanitizedOutput = htmlEmbedConfig.sanitizeHtml( rawHtmlValue );

			const domPreviewContent = createElement( domDocument, 'span', {
				class: 'external-data-embed__preview-content',
				dir: editor.locale.contentLanguageDirection
			} );

			// Creating a contextual document fragment allows executing scripts when inserting into the preview element.
			const domRange = domDocument.createRange();
			const domDocumentFragment = domRange.createContextualFragment( sanitizedOutput.html );

			domPreviewContent.appendChild( domDocumentFragment );

			domElement.append( createElement( domDocument, 'span', {
				class: 'external-data-embed__preview'
			}, [ domPreviewContent ] ) );
		}
	}
}

function htmlToEmbed( resourceUrl ) {
	const elementID = `external_${ Date.now() }`; // super-simple non-unique ID generator

	return `<span id="${ elementID }"></span>
		<script>

		let intervalId_${ elementID } = null;

		function fetchBtcToUsdPrice() {
			if (!document.querySelector('#${ elementID }')) {
				clearInterval( intervalId_${ elementID } );
				return;
			}

			fetch( '${ resourceUrl }' )
				.then( ( response ) => response.json() )
				.then( ( data ) => {
					const span = document.querySelector( '#${ elementID }' );
					span.classList.add( 'external-data-embed-bounce' );
					const updateTime = new Date( data.closeTime );
					span.textContent = '$' + Number( data.lastPrice ).toFixed( 2 ) + ' - ' + updateTime.toLocaleString();
					setTimeout(() => span.classList.remove( 'external-data-embed-bounce' ), 2000);
				});
		}

		intervalId_${ elementID } = setInterval( fetchBtcToUsdPrice, 20000 ); // every 20s

		fetchBtcToUsdPrice() // initial run

		</script>`;
}

ClassicEditor
	.create( document.querySelector( '#snippet-external-widget' ), {
		plugins: [ Essentials, Paragraph, Heading, List, Bold, Italic, ExternalWidget ],
		toolbar: [ 'heading', 'bold', 'italic', 'numberedList', 'bulletedList', '|', 'external' ],
		externalDataEmbed: {
			sanitizeHtml: html => ( { html, hasChange: false } )
		}
	} )
	.then( editor => {
		console.log( 'Editor was initialized', editor );

		// Expose for playing in the console.
		window.editor = editor;
	} )
	.catch( error => {
		console.error( error.stack );
	} );
