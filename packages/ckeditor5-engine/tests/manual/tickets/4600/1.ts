/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Essentials } from '@ckeditor/ckeditor5-essentials';

import { Plugin } from '@ckeditor/ckeditor5-core';
import { Widget, toWidget } from '@ckeditor/ckeditor5-widget';

import { ClickObserver } from '../../../../src/view/observer/clickobserver.js';
import { CompositionObserver } from '../../../../src/view/observer/compositionobserver.js';
import { FocusObserver } from '../../../../src/view/observer/focusobserver.js';
import { InputObserver } from '../../../../src/view/observer/inputobserver.js';
import { KeyObserver } from '../../../../src/view/observer/keyobserver.js';
import { MouseObserver } from '../../../../src/view/observer/mouseobserver.js';
import { _TableMouseEventsObserver } from '@ckeditor/ckeditor5-table';
import { _DeleteObserver } from '@ckeditor/ckeditor5-typing';
import { ClipboardObserver } from '@ckeditor/ckeditor5-clipboard';
import { EnterObserver } from '@ckeditor/ckeditor5-enter';
import { ImageLoadObserver } from '@ckeditor/ckeditor5-image';

declare global {
	interface Window { editor: any }
}

class SimpleWidgetEditing extends Plugin {
	public static get requires() {
		return [ Widget ];
	}

	public init(): void {
		this._defineSchema();
		this._defineConverters();
		this._addObservers();
	}

	private _defineSchema() {
		const schema = this.editor.model.schema;

		schema.register( 'simpleWidgetElement', {
			inheritAllFrom: '$block',
			isObject: true
		} );
	}

	private _defineConverters() {
		const conversion = this.editor.conversion;

		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'simpleWidgetElement',
			view: ( modelElement, { writer } ) => {
				const widgetElement = createWidgetView( modelElement, { writer } );

				return toWidget( widgetElement, writer );
			}
		} );

		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'simpleWidgetElement',
			view: createWidgetView
		} );

		conversion.for( 'upcast' ).elementToElement( {
			model: 'simpleWidgetElement',
			view: {
				name: 'section',
				classes: 'simple-widget-container'
			}
		} );

		function createWidgetView( modelElement: any, { writer }: any ) {
			const simpleWidgetContainer = writer.createContainerElement( 'section', { class: 'simple-widget-container' } );
			const simpleWidgetElement = writer.createRawElement( 'div', { class: 'simple-widget-element' }, ( domElement: any ) => {
				domElement.innerHTML = `
					<fieldset data-cke-ignore-events="true">
						<legend>Ignored container with <strong>data-cke-ignore-events="true"</strong></legend>
						<input>
						<button>Click!</button>
						<img src="https://placehold.co/60x30" height="30">
					</fieldset>
					<fieldset>
						<legend>Regular container</legend>
						<input>
						<button>Click!</button>
						<img src="https://placehold.co/60x30" height="30">
					</fieldset>
				`;
			} );

			writer.insert( writer.createPositionAt( simpleWidgetContainer, 0 ), simpleWidgetElement );

			return simpleWidgetContainer;
		}
	}

	private _addObservers() {
		const view = this.editor.editing.view;

		const observers = new Map<any, Array<string>>( [
			[ ClickObserver, [ 'click' ] ],
			[ CompositionObserver, [ 'compositionstart', 'compositionupdate', 'compositionend' ] ],
			[ FocusObserver, [ 'focus', 'blur' ] ],
			[ InputObserver, [ 'beforeinput' ] ],
			[ KeyObserver, [ 'keydown', 'keyup' ] ],
			[ _TableMouseEventsObserver, [ 'mousemove', 'mouseup', 'mouseleave' ] ],
			[ MouseObserver, [ 'mousedown' ] ],
			[ ClipboardObserver, [ 'paste', 'copy', 'cut', 'drop', 'dragover' ] ], // It's inheriting domEventObserver
			[ _DeleteObserver, [ 'delete' ] ], // Is ignored for some reason, even though there's no explicit support.
			[ EnterObserver, [ 'enter' ] ], // Is ignored for some reason, even though there's no explicit support.
			[ ImageLoadObserver, [ 'imageLoaded' ] ]
		] );

		observers.forEach( ( events, observer ) => {
			view.addObserver( observer );

			events.forEach( eventName => {
				this.listenTo( view.document, eventName, ( event, eventData ) => {
					if ( eventName.startsWith( 'mouse' ) ) {
						console.log( `Received ${ eventName } event.` );
					} else {
						console.log( `Received ${ eventName } event. Target: `, eventData.domTarget || eventData.target );
					}
				} );
			} );
		} );
	}
}

class SimpleWidget extends Plugin {
	public static get requires() {
		return [ SimpleWidgetEditing ];
	}
}

ClassicEditor
	.create( {
		attachTo: document.querySelector( '#editor' ) as HTMLElement,
		plugins: [ Essentials, Paragraph, SimpleWidget ]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( error => {
		console.error( error.stack );
	} );
