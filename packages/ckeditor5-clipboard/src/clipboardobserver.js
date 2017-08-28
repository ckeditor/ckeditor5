/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module clipboard/clipboardobserver
 */

import DomEventObserver from '@ckeditor/ckeditor5-engine/src/view/observer/domeventobserver';
import DataTransfer from './datatransfer';

/**
 * {@link module:engine/view/document~Document#event:paste Paste} event observer.
 *
 * Note that this observer is not available by default. To make it available it needs to be added to
 * {@link module:engine/view/document~Document} by the {@link module:engine/view/document~Document#addObserver} method.
 *
 * @extends module:engine/view/observer/domeventobserver~DomEventObserver
 */
export default class ClipboardObserver extends DomEventObserver {
	constructor( doc ) {
		super( doc );

		this.domEventType = [ 'paste', 'copy', 'cut', 'drop', 'dragover' ];

		this.listenTo( doc, 'paste', handleInput, { priority: 'low' } );
		this.listenTo( doc, 'drop', handleInput, { priority: 'low' } );

		function handleInput( evt, data ) {
			data.preventDefault();

			const targetRanges = data.dropRange ? [ data.dropRange ] : Array.from( doc.selection.getRanges() );

			doc.fire( 'clipboardInput', {
				dataTransfer: data.dataTransfer,
				targetRanges
			} );
		}
	}

	onDomEvent( domEvent ) {
		const evtData = {
			dataTransfer: new DataTransfer( domEvent.clipboardData ? domEvent.clipboardData : domEvent.dataTransfer )
		};

		if ( domEvent.type == 'drop' ) {
			evtData.dropRange = getDropViewRange( this.document, domEvent );
		}

		this.fire( domEvent.type, domEvent, evtData );
	}
}

function getDropViewRange( doc, domEvent ) {
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
		return doc.domConverter.domRangeToView( domRange );
	} else {
		return doc.selection.getFirstRange();
	}
}

/**
 * Fired as a continuation of {@link #event:paste} and {@link #event:drop} events.
 * It's part of the {@link module:clipboard/clipboard~Clipboard "clipboard pipeline"}.
 *
 * Fired with a `dataTransfer` which comes from the clipboard and which content should be processed
 * and inserted into the editor.
 *
 * Note that this event is not available by default. To make it available {@link module:clipboard/clipboardobserver~ClipboardObserver}
 * needs to be added to {@link module:engine/view/document~Document} by the {@link module:engine/view/document~Document#addObserver} method.
 * It's done by the {@link module:clipboard/clipboard~Clipboard} feature. If it's not loaded, it must be done manually.
 *
 * @see module:clipboard/clipboardobserver~ClipboardObserver
 * @see module:clipboard/clipboard~Clipboard
 * @event module:engine/view/document~Document#event:clipboardInput
 * @param {Object} data Event data.
 * @param {module:clipboard/datatransfer~DataTransfer} data.dataTransfer Data transfer instance.
 * @param {Array.<module:engine/view/range~Range>} data.targetRanges Ranges which are the target of the operation
 * (usually – into which the content should be inserted).
 * If clipboard input was triggered by a paste operation, then these are the selection ranges. If by a drop operation,
 * then it's the drop position (which can be different than the selection at the moment of drop).
 */

/**
 * Fired when user drags content over one of the editables.
 *
 * Introduced by {@link module:clipboard/clipboardobserver~ClipboardObserver}.
 *
 * Note that this event is not available by default. To make it available {@link module:clipboard/clipboardobserver~ClipboardObserver}
 * needs to be added to {@link module:engine/view/document~Document} by the {@link module:engine/view/document~Document#addObserver} method.
 * It's done by the {@link module:clipboard/clipboard~Clipboard} feature. If it's not loaded, it must be done manually.
 *
 * @see module:engine/view/document~Document#event:clipboardInput
 * @event module:engine/view/document~Document#event:dragover
 * @param {module:clipboard/clipboardobserver~ClipboardEventData} data Event data.
 */

/**
 * Fired when user dropped content into one of the editables.
 *
 * Introduced by {@link module:clipboard/clipboardobserver~ClipboardObserver}.
 *
 * Note that this event is not available by default. To make it available {@link module:clipboard/clipboardobserver~ClipboardObserver}
 * needs to be added to {@link module:engine/view/document~Document} by the {@link module:engine/view/document~Document#addObserver} method.
 * It's done by the {@link module:clipboard/clipboard~Clipboard} feature. If it's not loaded, it must be done manually.
 *
 * @see module:engine/view/document~Document#event:clipboardInput
 * @event module:engine/view/document~Document#event:drop
 * @param {module:clipboard/clipboardobserver~ClipboardEventData} data Event data.
 * @param {module:engine/view/range~Range} dropRange The position into which the content is dropped.
 */

/**
 * Fired when user pasted content into one of the editables.
 *
 * Introduced by {@link module:clipboard/clipboardobserver~ClipboardObserver}.
 *
 * Note that this event is not available by default. To make it available {@link module:clipboard/clipboardobserver~ClipboardObserver}
 * needs to be added to {@link module:engine/view/document~Document} by the {@link module:engine/view/document~Document#addObserver} method.
 * It's done by the {@link module:clipboard/clipboard~Clipboard} feature. If it's not loaded, it must be done manually.
 *
 * @see module:engine/view/document~Document#event:clipboardInput
 * @event module:engine/view/document~Document#event:paste
 * @param {module:clipboard/clipboardobserver~ClipboardEventData} data Event data.
 */

/**
 * Fired when user copied content from one of the editables.
 *
 * Introduced by {@link module:clipboard/clipboardobserver~ClipboardObserver}.
 *
 * Note that this event is not available by default. To make it available {@link module:clipboard/clipboardobserver~ClipboardObserver}
 * needs to be added to {@link module:engine/view/document~Document} by the {@link module:engine/view/document~Document#addObserver} method.
 * It's done by the {@link module:clipboard/clipboard~Clipboard} feature. If it's not loaded, it must be done manually.
 *
 * @see module:clipboard/clipboardobserver~ClipboardObserver
 * @event module:engine/view/document~Document#event:copy
 * @param {module:clipboard/clipboardobserver~ClipboardEventData} data Event data.
 */

/**
 * Fired when user cut content from one of the editables.
 *
 * Introduced by {@link module:clipboard/clipboardobserver~ClipboardObserver}.
 *
 * Note that this event is not available by default. To make it available {@link module:clipboard/clipboardobserver~ClipboardObserver}
 * needs to be added to {@link module:engine/view/document~Document} by the {@link module:engine/view/document~Document#addObserver} method.
 * It's done by the {@link module:clipboard/clipboard~Clipboard} feature. If it's not loaded, it must be done manually.
 *
 * @see module:clipboard/clipboardobserver~ClipboardObserver
 * @event module:engine/view/document~Document#event:cut
 * @param {module:clipboard/clipboardobserver~ClipboardEventData} data Event data.
 */

/**
 * The value of the {@link module:engine/view/document~Document#event:paste},
 * {@link module:engine/view/document~Document#event:copy} and {@link module:engine/view/document~Document#event:cut} events.
 *
 * In order to access clipboard data use `dataTransfer` property.
 *
 * @class module:clipboard/clipboardobserver~ClipboardEventData
 * @extends module:engine/view/observer/domeventdata~DomEventData
 */

/**
 * Data transfer instance.
 *
 * @readonly
 * @member {module:clipboard/datatransfer~DataTransfer} module:clipboard/clipboardobserver~ClipboardEventData#dataTransfer
 */
