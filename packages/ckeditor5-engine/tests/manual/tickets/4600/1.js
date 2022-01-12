/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, document, window */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';

import ClickObserver from '../../../../src/view/observer/clickobserver';
import CompositionObserver from '../../../../src/view/observer/compositionobserver';
import FocusObserver from '../../../../src/view/observer/focusobserver';
import InputObserver from '../../../../src/view/observer/inputobserver';
import KeyObserver from '../../../../src/view/observer/keyobserver';
import MouseObserver from '../../../../src/view/observer/mouseobserver';
import MouseEventsObserver from '@ckeditor/ckeditor5-table/src/tablemouse/mouseeventsobserver';
import DeleteObserver from '@ckeditor/ckeditor5-typing/src/deleteobserver';
import ClipboardObserver from '@ckeditor/ckeditor5-clipboard/src/clipboardobserver';
import EnterObserver from '@ckeditor/ckeditor5-enter/src/enterobserver';
import ImageLoadObserver from '@ckeditor/ckeditor5-image/src/image/imageloadobserver';

class SimpleWidgetEditing extends Plugin {
	static get requires() {
		return [ Widget ];
	}

	init() {
		this._defineSchema();
		this._defineConverters();
		this._addObservers();
	}

	_defineSchema() {
		const schema = this.editor.model.schema;

		schema.register( 'simpleWidgetElement', {
			inheritAllFrom: '$block',
			isObject: true
		} );
	}

	_defineConverters() {
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

		function createWidgetView( modelElement, { writer } ) {
			const simpleWidgetContainer = writer.createContainerElement( 'section', { class: 'simple-widget-container' } );
			const simpleWidgetElement = writer.createRawElement( 'div', { class: 'simple-widget-element' }, domElement => {
				domElement.innerHTML = `
					<fieldset data-cke-ignore-events="true">
						<legend>Ignored container with <strong>data-cke-ignore-events="true"</strong></legend>
						<input>
						<button>Click!</button>
						<img src="https://placekitten.com/30/30" height="30">
					</fieldset>
					<fieldset>
						<legend>Regular container</legend>
						<input>
						<button>Click!</button>
						<img src="https://placekitten.com/30/30" height="30">
					</fieldset>
				`;
			} );

			writer.insert( writer.createPositionAt( simpleWidgetContainer, 0 ), simpleWidgetElement );

			return simpleWidgetContainer;
		}
	}

	_addObservers() {
		const view = this.editor.editing.view;

		const observers = new Map( [
			[ ClickObserver, [ 'click' ] ],
			[ CompositionObserver, [ 'compositionstart', 'compositionupdate', 'compositionend' ] ],
			[ FocusObserver, [ 'focus', 'blur' ] ],
			[ InputObserver, [ 'beforeinput' ] ],
			[ KeyObserver, [ 'keydown', 'keyup' ] ],
			[ MouseEventsObserver, [ 'mousemove', 'mouseup', 'mouseleave' ] ],
			[ MouseObserver, [ 'mousedown' ] ],
			[ ClipboardObserver, [ 'paste', 'copy', 'cut', 'drop', 'dragover' ] ], // It's inheriting domEventObserver
			[ DeleteObserver, [ 'delete' ] ], // Is ignored for some reason, even though there's no explicit support.
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
	static get requires() {
		return [ SimpleWidgetEditing ];
	}
}

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Essentials, Paragraph, SimpleWidget ]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( error => {
		console.error( error.stack );
	} );
