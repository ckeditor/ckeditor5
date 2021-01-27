/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module clipboard/clipboardobserver
 */

import DomEventObserver from '@ckeditor/ckeditor5-engine/src/view/observer/domeventobserver';
import EventInfo from '@ckeditor/ckeditor5-utils/src/eventinfo';
import DataTransfer from './datatransfer';

/**
 * Clipboard events observer.
 *
 * Fires the following events:
 *
 * * {@link module:engine/view/document~Document#event:clipboardInput}
 * * {@link module:engine/view/document~Document#event:dragover}
 * * {@link module:engine/view/document~Document#event:drop}
 * * {@link module:engine/view/document~Document#event:paste}
 * * {@link module:engine/view/document~Document#event:copy}
 * * {@link module:engine/view/document~Document#event:cut}
 *
 * Note that this observer is not available by default (it is not added by the engine).
 * To make it available, it needs to be added to {@link module:engine/view/document~Document} by
 * the {@link module:engine/view/view~View#addObserver `View#addObserver()`} method. You can also load the
 * {@link module:clipboard/clipboard~Clipboard} plugin which adds this observer automatically (because it uses it).
 *
 * @extends module:engine/view/observer/domeventobserver~DomEventObserver
 */
export default class ClipboardObserver extends DomEventObserver {
	constructor( view ) {
		super( view );

		const viewDocument = this.document;

		this.domEventType = [ 'paste', 'copy', 'cut', 'drop', 'dragover' ];

		this.listenTo( viewDocument, 'paste', handleInput, { priority: 'low' } );
		this.listenTo( viewDocument, 'drop', handleInput, { priority: 'low' } );

		function handleInput( evt, data ) {
			data.preventDefault();

			const targetRanges = data.dropRange ? [ data.dropRange ] : Array.from( viewDocument.selection.getRanges() );

			const eventInfo = new EventInfo( viewDocument, 'clipboardInput' );

			viewDocument.fire( eventInfo, {
				dataTransfer: data.dataTransfer,
				targetRanges
			} );

			// If CKEditor handled the input, do not bubble the original event any further.
			// This helps external integrations recognize that fact and act accordingly.
			// https://github.com/ckeditor/ckeditor5-upload/issues/92
			if ( eventInfo.stop.called ) {
				data.stopPropagation();
			}
		}
	}

	onDomEvent( domEvent ) {
		const evtData = {
			dataTransfer: new DataTransfer( domEvent.clipboardData ? domEvent.clipboardData : domEvent.dataTransfer )
		};

		if ( domEvent.type == 'drop' ) {
			evtData.dropRange = getDropViewRange( this.view, domEvent );
		}

		this.fire( domEvent.type, domEvent, evtData );
	}
}

function getDropViewRange( view, domEvent ) {
	const domDoc = domEvent.target.ownerDocument;
	const x = domEvent.clientX;
	const y = domEvent.clientY;
	let domRange;

	// Webkit & Blink.
	if ( domDoc.caretRangeFromPoint && domDoc.caretRangeFromPoint( x, y ) ) {
		domRange = domDoc.caretRangeFromPoint( x, y );
	}
	// FF.
	else if ( domEvent.rangeParent ) {
		domRange = domDoc.createRange();
		domRange.setStart( domEvent.rangeParent, domEvent.rangeOffset );
		domRange.collapse( true );
	}

	if ( domRange ) {
		return view.domConverter.domRangeToView( domRange );
	} else {
		return view.document.selection.getFirstRange();
	}
}

/**
 * Fired as a continuation of the {@link #event:paste} and {@link #event:drop} events.
 *
 * It is a part of the {@glink framework/guides/deep-dive/clipboard#input-pipeline "clipboard input pipeline"}.
 *
 * Fired with a `dataTransfer` which comes from the clipboard and whose content should be processed
 * and inserted into the editor.
 *
 * Note that this event is not available by default. To make it available, {@link module:clipboard/clipboardobserver~ClipboardObserver}
 * needs to be added to the {@link module:engine/view/document~Document} by the {@link module:engine/view/view~View#addObserver} method.
 * This is done by the {@link module:clipboard/clipboard~Clipboard} feature. If it is not loaded, it must be done manually.
 *
 * @see module:clipboard/clipboardobserver~ClipboardObserver
 * @see module:clipboard/clipboard~Clipboard
 * @event module:engine/view/document~Document#event:clipboardInput
 * @param {Object} data Event data.
 * @param {module:clipboard/datatransfer~DataTransfer} data.dataTransfer The data transfer instance.
 * @param {Array.<module:engine/view/range~Range>} data.targetRanges Ranges which are the target of the operation
 * (usually – into which the content should be inserted).
 * If clipboard input was triggered by a paste operation, then these are the selection ranges. If by a drop operation,
 * then it is the drop position (which can be different than the selection at the moment of drop).
 */

/**
 * Fired when the user drags the content over one of the editables.
 *
 * Introduced by {@link module:clipboard/clipboardobserver~ClipboardObserver}.
 *
 * Note that this event is not available by default. To make it available, {@link module:clipboard/clipboardobserver~ClipboardObserver}
 * needs to be added to the {@link module:engine/view/document~Document} by the {@link module:engine/view/view~View#addObserver} method.
 * This is done by the {@link module:clipboard/clipboard~Clipboard} feature. If it is not loaded, it must be done manually.
 *
 * @see module:engine/view/document~Document#event:clipboardInput
 * @event module:engine/view/document~Document#event:dragover
 * @param {module:clipboard/clipboardobserver~ClipboardEventData} data The event data.
 */

/**
 * Fired when the user dropped the content into one of the editables.
 *
 * Introduced by {@link module:clipboard/clipboardobserver~ClipboardObserver}.
 *
 * Note that this event is not available by default. To make it available, {@link module:clipboard/clipboardobserver~ClipboardObserver}
 * needs to be added to the {@link module:engine/view/document~Document} by the {@link module:engine/view/view~View#addObserver} method.
 * This is done by the {@link module:clipboard/clipboard~Clipboard} feature. If it is not loaded, it must be done manually.
 *
 * @see module:engine/view/document~Document#event:clipboardInput
 * @event module:engine/view/document~Document#event:drop
 * @param {module:clipboard/clipboardobserver~ClipboardEventData} data The event data.
 * @param {module:engine/view/range~Range} dropRange The position into which the content is dropped.
 */

/**
 * Fired when the user pasted the content into one of the editables.
 *
 * Introduced by {@link module:clipboard/clipboardobserver~ClipboardObserver}.
 *
 * Note that this event is not available by default. To make it available, {@link module:clipboard/clipboardobserver~ClipboardObserver}
 * needs to be added to the {@link module:engine/view/document~Document} by the {@link module:engine/view/view~View#addObserver} method.
 * This is done by the {@link module:clipboard/clipboard~Clipboard} feature. If it is not loaded, it must be done manually.
 *
 * @see module:engine/view/document~Document#event:clipboardInput
 * @event module:engine/view/document~Document#event:paste
 * @param {module:clipboard/clipboardobserver~ClipboardEventData} data The event data.
 */

/**
 * Fired when the user copied the content from one of the editables.
 *
 * Introduced by {@link module:clipboard/clipboardobserver~ClipboardObserver}.
 *
 * Note that this event is not available by default. To make it available, {@link module:clipboard/clipboardobserver~ClipboardObserver}
 * needs to be added to the {@link module:engine/view/document~Document} by the {@link module:engine/view/view~View#addObserver} method.
 * This is done by the {@link module:clipboard/clipboard~Clipboard} feature. If it is not loaded, it must be done manually.
 *
 * @see module:clipboard/clipboardobserver~ClipboardObserver
 * @event module:engine/view/document~Document#event:copy
 * @param {module:clipboard/clipboardobserver~ClipboardEventData} data The event data.
 */

/**
 * Fired when the user cut the content from one of the editables.
 *
 * Introduced by {@link module:clipboard/clipboardobserver~ClipboardObserver}.
 *
 * Note that this event is not available by default. To make it available, {@link module:clipboard/clipboardobserver~ClipboardObserver}
 * needs to be added to the {@link module:engine/view/document~Document} by the {@link module:engine/view/view~View#addObserver} method.
 * This is done by the {@link module:clipboard/clipboard~Clipboard} feature. If it is not loaded, it must be done manually.
 *
 * @see module:clipboard/clipboardobserver~ClipboardObserver
 * @event module:engine/view/document~Document#event:cut
 * @param {module:clipboard/clipboardobserver~ClipboardEventData} data The event data.
 */

/**
 * The value of the {@link module:engine/view/document~Document#event:paste},
 * {@link module:engine/view/document~Document#event:copy} and {@link module:engine/view/document~Document#event:cut} events.
 *
 * In order to access the clipboard data, use the `dataTransfer` property.
 *
 * @class module:clipboard/clipboardobserver~ClipboardEventData
 * @extends module:engine/view/observer/domeventdata~DomEventData
 */

/**
 * The data transfer instance.
 *
 * @readonly
 * @member {module:clipboard/datatransfer~DataTransfer} module:clipboard/clipboardobserver~ClipboardEventData#dataTransfer
 */
