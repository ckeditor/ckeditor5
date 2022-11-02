/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document, fetch, setInterval, setTimeout */

import { Plugin } from '@ckeditor/ckeditor5-core';
import { ButtonView } from '@ckeditor/ckeditor5-ui/src';
import Command from '@ckeditor/ckeditor5-core/src/command';
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
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
					'data-resource-url': RESOURCE_URL
				}
			);

			editor.model.insertContent( externalWidget );
		} );
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

			button.set( {
				label: 'Insert Bitcoin rate',
				tooltip: true,
				withText: true,
				isEnabled: true
			} );

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
			allowAttributes: [ 'data-resource-url' ]
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

		editor.conversion.for( 'upcast' ).elementToElement( {
			view: {
				name: 'span',
				attributes: [ 'data-resource-url' ]
			},
			model: ( viewElement, { writer } ) => {
				const externalUrl = viewElement.getAttribute( 'data-resource-url' );

				return writer.createElement( 'externalElement', {
					'data-resource-url': externalUrl
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
			view: ( modelElement, { writer: viewWriter } ) => {
				const viewContentWrapper = viewWriter.createRawElement( 'span', {
					class: 'js-external-data-embed'
				}, async function( domElement ) {
					domElement.textContent = 'Fetching data...';

					const externalUrl = modelElement.getAttribute( 'data-resource-url' );
					const data = await initialFetch( externalUrl );

					domElement.textContent = data;
				} );

				const viewContainerWrapper = viewWriter.createContainerElement( 'span', null, viewContentWrapper );

				return toWidget( viewContainerWrapper, viewWriter, {
					widgetLabel: 'External widget',
					hasSelectionHandle: true
				} );
			}
		} );
	}
}

async function initialFetch( resourceUrl ) {
	const response = await fetch( resourceUrl );
	const data = await response.json();
	const updateTime = new Date( data.closeTime );
	return '$' + Number( data.lastPrice ).toFixed( 2 ) + ' - ' + updateTime.toLocaleString();
}

function intervalFetch() {
	// let intervalId = null;
	function fetchBtcToUsdPrice() {
		if ( document.querySelectorAll( '.js-external-data-embed' ).length === 0 ) {
			// clearInterval( intervalId );
			return;
		}

		fetch( 'https://api2.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT' )
			.then( response => response.json() )
			.then( data => {
				const allItems = document.querySelectorAll( '.js-external-data-embed' );

				allItems.forEach( item => {
					item.classList.add( 'external-widget-bounce' );
					const updateTime = new Date( data.closeTime );
					item.textContent = '$' + Number( data.lastPrice ).toFixed( 2 ) + ' - ' + updateTime.toLocaleString();
					setTimeout( () => item.classList.remove( 'external-widget-bounce' ), 1200 );
				} );
			} );
	}
	/* const intervalId = */setInterval( fetchBtcToUsdPrice, 20000 ); // every 20s
	fetchBtcToUsdPrice(); // initial run
}

ClassicEditor
	.create( document.querySelector( '#snippet-external-widget' ), {
		plugins: [ Essentials, Paragraph, Heading, List, Bold, Italic, ExternalWidget ],
		toolbar: [ 'heading', 'bold', 'italic', 'numberedList', 'bulletedList', '|', 'external' ]
	} )
	.then( editor => {
		console.log( 'Editor was initialized', editor );

		// Expose for playing in the console.
		window.editor = editor;

		intervalFetch();
	} )
	.catch( error => {
		console.error( error.stack );
	} );
