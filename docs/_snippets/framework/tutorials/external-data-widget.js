/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	ClassicEditor,
	Bold,
	Italic,
	Command,
	Plugin,
	Essentials,
	Heading,
	List,
	Paragraph,
	ButtonView,
	Widget,
	toWidget
} from 'ckeditor5';
import {
	attachTourBalloon,
	findToolbarItem
} from '@snippets/index.js';

import BitcoinLogoIcon from '@assets/img/bitcoin-logo.svg';

const RESOURCE_URL = 'https://api2.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT';

class ExternalDataWidgetCommand extends Command {
	execute() {
		const editor = this.editor;
		const selection = editor.model.document.selection;

		editor.model.change( writer => {
			const externalWidget = writer.createElement(
				'externalElement', {
					...Object.fromEntries( selection.getAttributes() ),
					'data-resource-url': RESOURCE_URL
				}
			);

			editor.model.insertObject( externalWidget, null, null, {
				setSelection: 'on'
			} );
		} );
	}

	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;

		const isAllowed = model.schema.checkChild( selection.focus.parent, 'externalElement' );

		this.isEnabled = isAllowed;
	}
}

class ExternalDataWidget extends Plugin {
	static get requires() {
		return [ ExternalDataWidgetEditing, ExternalDataWidgetUI ];
	}
}

class ExternalDataWidgetUI extends Plugin {
	init() {
		const editor = this.editor;
		const externalWidgetCommand = editor.commands.get( 'external' );

		editor.ui.componentFactory.add( 'external', locale => {
			const button = new ButtonView( locale );

			button.set( {
				label: 'Bitcoin rate',
				tooltip: true,
				withText: false,
				icon: BitcoinLogoIcon
			} );

			button.bind( 'isEnabled' ).to( externalWidgetCommand );

			button.on( 'execute', () => {
				editor.execute( 'external' );
				editor.editing.view.focus();
			} );

			return button;
		} );
	}
}

class ExternalDataWidgetEditing extends Plugin {
	constructor( editor ) {
		super( editor );

		this.intervalId = this._intervalFetch();

		this.externalDataValue = '';
	}

	static get requires() {
		return [ Widget ];
	}

	destroy() {
		clearInterval( this.intervalId );
	}

	init() {
		this._defineSchema();
		this._defineConverters();
		this._updateWidgetData();

		this.editor.commands.add( 'external', new ExternalDataWidgetCommand( this.editor ) );
	}

	_intervalFetch() {
		return setInterval( () => this._updateWidgetData(), 10000 );
	}

	async _updateWidgetData( externalUrl = RESOURCE_URL ) {
		try {
			const response = await fetch( externalUrl );
			const data = await response.json();
			const updateTime = new Date( data.closeTime );
			const parsedData = '$' + Number( data.lastPrice ).toFixed( 2 ) + ' - ' + updateTime.toLocaleString();

			this.externalDataValue = parsedData;

			const rootElement = this.editor.model.document.getRoot();

			for ( const { item } of this.editor.model.createRangeIn( rootElement ) ) {
				if ( item.is( 'element', 'externalElement' ) ) {
					this.editor.editing.reconvertItem( item );
				}
			}
		} catch ( error ) {
			console.error( error );
		}
	}

	_defineSchema() {
		const schema = this.editor.model.schema;

		schema.register( 'externalElement', {
			inheritAllFrom: '$inlineObject',
			allowAttributes: [ 'data-resource-url' ]
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
				return writer.createEmptyElement( 'span', {
					'data-resource-url': modelElement.getAttribute( 'data-resource-url' )
				} );
			}
		} );

		editor.conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'externalElement',
			view: ( modelElement, { writer } ) => {
				const externalValueToShow = this.externalDataValue;

				const externalDataPreviewElement = writer.createRawElement( 'span', null, function( domElement ) {
					domElement.classList.add( 'external-data-widget' );
					domElement.textContent = externalValueToShow || 'Fetching data...';

					if ( externalValueToShow ) {
						domElement.classList.add( 'external-data-widget-bounce' );
						setTimeout( () => domElement.classList.remove( 'external-data-widget-bounce' ), 1100 );
					}
				} );

				const externalWidgetContainer = writer.createContainerElement( 'span', null, externalDataPreviewElement );

				return toWidget( externalWidgetContainer, writer, {
					label: 'External widget'
				} );
			}
		} );
	}
}

ClassicEditor
	.create( document.querySelector( '#snippet-external-data-widget' ), {
		plugins: [ Essentials, Paragraph, Heading, List, Bold, Italic, ExternalDataWidget ],
		toolbar: [ 'undo', 'redo', '|', 'external', '|', 'heading', '|', 'bold', 'italic', '|', 'numberedList', 'bulletedList' ]
	} )
	.then( editor => {
		console.log( 'Editor was initialized', editor );

		// Expose for playing in the console.
		window.editor = editor;

		attachTourBalloon( {
			target: findToolbarItem( editor.ui.view.toolbar, item => item.label && item.label === 'Bitcoin rate' ),
			text: 'Click to add Bitcoin rate.',
			tippyOptions: {
				placement: 'bottom-start'
			},
			editor
		} );
	} )
	.catch( error => {
		console.error( error.stack );
	} );

const metaElement = document.createElement( 'meta' );

metaElement.name = 'x-cke-crawler-ignore-patterns';
metaElement.content = JSON.stringify( {
	'console-error': [ 'Access to fetch at', 'Failed to fetch' ]
} );

document.head.appendChild( metaElement );
