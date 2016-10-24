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

/**
 * The clipboard feature. Currently, it's only responsible for intercepting the `paste` event and
 * passing the pasted content through the clipboard pipeline.
 *
 * ## Clipboard Pipeline
 *
 * The feature creates the clipboard pipeline which allows processing clipboard content
 * before it gets inserted into the editor. The pipeline consists of two events on which
 * the features can listen to modify or totally override the default behavior.
 *
 * ### On {@link engine.view.Document#paste}
 *
 * 1. Get HTML or plain text from the clipboard,
 * 2. Fire {@link engine.view.Document#clipboardInput} with the clipboard data parsed to
 * a {@link engine.view.DocumentFragment view document fragment}.
 * 3. Prevent default action of the native `paste` event.
 *
 * This action is performed by a low priority listener, so it can be overridden by a normal one.
 * You'd only need to do this when a deeper change in pasting behavior was needed. For example,
 * a feature which wants to differently read data from the clipboard (the {@link clipboard.DataTransfer `DataTransfer`}).
 * should plug a listener at this stage.
 *
 * ### On {@link engine.view.Document#clipboardInput}
 *
 * If the content being processed (`data.content` represented by a {@link engine.view.DocumentFragment})
 * is not empty insert it to the editor using the {@link clipboard.ClipboardInput `clipboardInput` command}.
 *
 * This action is performed by a low priority listener, so it can be overridden by a normal one.
 *
 * At this stage the pasted content can be processed by the features. E.g. a feature which wants to transform
 * a pasted text into a link can be implemented in this way:
 *
 *		this.listenTo( editor.editing.view, 'clipboardInput', ( evt, data ) => {
 *			if ( data.content.childCount == 1 && isUrlText( data.content.getChild( 0 ) ) ) {
 *				const linkUrl = data.content.getChild( 0 ).data;
 *
 *				data.content = new ViewDocumentFragment(
 *					ViewElement(
 *						'a',
 *						{ href: linkUrl },
 *						[ new ViewText( linkUrl ) ]
 *					)
 *				);
 *			}
 *		} );
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
			if ( !data.content.isEmpty ) {
				editor.execute( 'clipboardInput', { content: data.content } );
			}
		}, { priority: 'low' } );
	}
}

/**
 * Fired with a content which comes from the clipboard (was pasted or dropped) and
 * should be processed in order to be inserted into the editor. It's part of the {@link clipboard.Clipboard "clipboard pipeline"}.
 *
 * @see clipboard.ClipboardObserver
 * @see clipboard.Clipboard
 * @event engine.view.Document#clipboardInput
 * @param {engine.view.observer.ClipboardInputEventData} data Event data.
 */

/**
 * The value of the {@link engine.view.Document#clipboardInput} event.
 *
 * @class engine.view.observer.ClipboardInputEventData
 * @extends engine.view.observer.DomEventData
 */

/**
 * Data transfer instance.
 *
 * @readonly
 * @member {clipboard.DataTransfer} engine.view.observer.ClipboardEventData#dataTransfer
 */

/**
 * Content to be inserted into the editor.
 *
 * @readonly
 * @member {engine.view.DocumentFragment} engine.view.observer.ClipboardEventData#content
 */
