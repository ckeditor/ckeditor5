/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Feature from '../core/feature.js';

import ClipboardObserver from './clipboardobserver.js';
import ClipboardInputCommand from './clipboardinputcommand.js';

import plainTextToHtml from './utils/plaintexttohtml.js';
import normalizeClipboardHtml from './utils/normalizeclipboarddata.js';

import HtmlDataProcessor from '../engine/dataprocessor/htmldataprocessor.js';

import { stringify as stringifyView } from '../engine/dev-utils/view.js';

/**
 * The clipboard feature. Currently, it's only responsible for intercepting the paste event and
 * passing the pasted content through a paste pipeline.
 *
 * ## Clipboard Pipeline
 *
 * The feature creates the clipboard pipeline which allows processing clipboard contents
 * and finally inserts the data to the editor/
 *
 * ### On {@link engine.view.Document#paste}
 *
 * 1. Get HTML or plain text from the clipboard,
 * 2. Fire {@link engine.view.Document#clipboardInput} with the clipboard data parsed to
 * a {@link engine.view.DocumentFragment view document fragment}.
 * 3. Prevent default action of the native `paste` event.
 *
 * This action is performed by a low priority listener, so it can be overriden by a normal one.
 *
 * ### On {@link engine.view.Document#clipboardInput}
 *
 * If the data is not empty insert it to the editor using the `clipboardInput` command.
 *
 * This action is performed by a low priority listener, so it can be overriden by a normal one.
 *
 * @memberOf clipboard
 * @extends core.Feature
 */
export default class Clipboard extends Feature {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const editingView = editor.editing.view;

		this._htmlDataProcessor = new HtmlDataProcessor();

		editor.commands.set( 'clipboardInput', new ClipboardInputCommand( editor ) );

		editingView.addObserver( ClipboardObserver );

		// The clipboard pipeline.

		this.listenTo( editingView, 'paste', ( evt, data ) => {
			const dataTransfer = data.dataTransfer;
			let content = '';

			if ( dataTransfer.getData( 'text/html' ) ) {
				content = normalizeClipboardHtml( dataTransfer.getData( 'text/html' ) );
			} else if ( dataTransfer.getData( 'text/plain' ) ) {
				content = plainTextToHtml( dataTransfer.getData( 'text/plain' ) );
			}

			content = this._htmlDataProcessor.toView( content );

			editingView.fire( 'clipboardInput', { dataTransfer, content } );

			data.preventDefault();
		}, { priority: 'low' } );

		this.listenTo( editingView, 'clipboardInput', ( evt, data ) => {
			if ( data.content.childCount ) {
				console.log( 'pasted (view):' ); // jshint ignore:line
				console.log( stringifyView( data.content ) ); // jshint ignore:line

				editor.execute( 'clipboardInput', { content: data.content } );
			}
		}, { priority: 'low' } );

		// TMP!
		// Create a context in the schema for processing the pasted content.
		// Read: https://github.com/ckeditor/ckeditor5-engine/issues/638#issuecomment-255086588

		const schema = editor.document.schema;

		schema.registerItem( '$clipboardHolder', '$root' );
		schema.allow( { name: '$text', inside: '$clipboardHolder' } );
	}
}

/**
 * Fired with a content which comes from the clipboard (was pasted or dropped) and
 * should be processed in order to be inserted into the editor. It's part of the "clipboard pipeline".
 *
 * @see clipboard.ClipboardObserver
 * @event engine.view.Document#clipboardInput
 * @param {engine.view.observer.ClipboardInputEventData} data Event data.
 */
