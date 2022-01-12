/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
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
 * * {@link module:engine/view/document~Document#event:clipboardInput},
 * * {@link module:engine/view/document~Document#event:paste},
 * * {@link module:engine/view/document~Document#event:copy},
 * * {@link module:engine/view/document~Document#event:cut},
 * * {@link module:engine/view/document~Document#event:drop},
 * * {@link module:engine/view/document~Document#event:dragover},
 * * {@link module:engine/view/document~Document#event:dragging},
 * * {@link module:engine/view/document~Document#event:dragstart},
 * * {@link module:engine/view/document~Document#event:dragend},
 * * {@link module:engine/view/document~Document#event:dragenter},
 * * {@link module:engine/view/document~Document#event:dragleave}.
 *
 * **Note**: This observer is not available by default (ckeditor5-engine does not add it on its own).
 * To make it available, it needs to be added to {@link module:engine/view/document~Document} by using
 * the {@link module:engine/view/view~View#addObserver `View#addObserver()`} method. Alternatively, you can load the
 * {@link module:clipboard/clipboard~Clipboard} plugin which adds this observer automatically (because it uses it).
 *
 * @extends module:engine/view/observer/domeventobserver~DomEventObserver
 */
export default class ClipboardObserver extends DomEventObserver {
	constructor( view ) {
		super( view );

		const viewDocument = this.document;

		this.domEventType = [ 'paste', 'copy', 'cut', 'drop', 'dragover', 'dragstart', 'dragend', 'dragenter', 'dragleave' ];

		this.listenTo( viewDocument, 'paste', handleInput( 'clipboardInput' ), { priority: 'low' } );
		this.listenTo( viewDocument, 'drop', handleInput( 'clipboardInput' ), { priority: 'low' } );
		this.listenTo( viewDocument, 'dragover', handleInput( 'dragging' ), { priority: 'low' } );

		function handleInput( type ) {
			return ( evt, data ) => {
				data.preventDefault();

				const targetRanges = data.dropRange ? [ data.dropRange ] : null;
				const eventInfo = new EventInfo( viewDocument, type );

				viewDocument.fire( eventInfo, {
					dataTransfer: data.dataTransfer,
					method: evt.name,
					targetRanges,
					target: data.target
				} );

				// If CKEditor handled the input, do not bubble the original event any further.
				// This helps external integrations recognize that fact and act accordingly.
				// https://github.com/ckeditor/ckeditor5-upload/issues/92
				if ( eventInfo.stop.called ) {
					data.stopPropagation();
				}
			};
		}
	}

	onDomEvent( domEvent ) {
		const evtData = {
			dataTransfer: new DataTransfer( domEvent.clipboardData ? domEvent.clipboardData : domEvent.dataTransfer )
		};

		if ( domEvent.type == 'drop' || domEvent.type == 'dragover' ) {
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
	}

	return null;
}

/**
 * Fired as a continuation of the {@link #event:paste} and {@link #event:drop} events.
 *
 * It is a part of the {@glink framework/guides/deep-dive/clipboard#input-pipeline clipboard input pipeline}.
 *
 * This event carries a `dataTransfer` object which comes from the clipboard and whose content should be processed
 * and inserted into the editor.
 *
 * **Note**: This event is not available by default. To make it available, {@link module:clipboard/clipboardobserver~ClipboardObserver}
 * needs to be added to the {@link module:engine/view/document~Document} by using the {@link module:engine/view/view~View#addObserver}
 * method. This is usually done by the {@link module:clipboard/clipboard~Clipboard} plugin, but if for some reason it is not loaded,
 * the observer must be added manually.
 *
 * @see module:clipboard/clipboardobserver~ClipboardObserver
 * @see module:clipboard/clipboard~Clipboard
 * @event module:engine/view/document~Document#event:clipboardInput
 * @param {Object} data The event data.
 * @param {module:clipboard/datatransfer~DataTransfer} data.dataTransfer The data transfer instance.
 * @param {'paste'|'drop'} method Whether the event was triggered by a paste or drop operation.
 * @param {module:engine/view/element~Element} target The tree view element representing the target.
 * @param {Array.<module:engine/view/range~Range>} data.targetRanges Ranges which are the target of the operation
 * (usually – into which the content should be inserted).
 * If the clipboard input was triggered by a paste operation, this property is not set. If by a drop operation,
 * then it is the drop position (which can be different than the selection at the moment of drop).
 */

/**
 * Fired when the user drags the content over one of the editing roots of the editor.
 *
 * Introduced by {@link module:clipboard/clipboardobserver~ClipboardObserver}.
 *
 * **Note**: This event is not available by default. To make it available, {@link module:clipboard/clipboardobserver~ClipboardObserver}
 * needs to be added to the {@link module:engine/view/document~Document} by using the {@link module:engine/view/view~View#addObserver}
 * method. This is usually done by the {@link module:clipboard/clipboard~Clipboard} plugin, but if for some reason it is not loaded,
 * the observer must be added manually.
 *
 * @see module:engine/view/document~Document#event:clipboardInput
 * @event module:engine/view/document~Document#event:dragover
 * @param {module:clipboard/clipboardobserver~ClipboardEventData} data The event data.
 */

/**
 * Fired when the user dropped the content into one of the editing roots of the editor.
 *
 * Introduced by {@link module:clipboard/clipboardobserver~ClipboardObserver}.
 *
 * **Note**: This event is not available by default. To make it available, {@link module:clipboard/clipboardobserver~ClipboardObserver}
 * needs to be added to the {@link module:engine/view/document~Document} by using the {@link module:engine/view/view~View#addObserver}
 * method. This is usually done by the {@link module:clipboard/clipboard~Clipboard} plugin, but if for some reason it is not loaded,
 * the observer must be added manually.
 *
 * @see module:engine/view/document~Document#event:clipboardInput
 * @event module:engine/view/document~Document#event:drop
 * @param {module:clipboard/clipboardobserver~ClipboardEventData} data The event data.
 * @param {module:engine/view/range~Range} dropRange The position into which the content is dropped.
 */

/**
 * Fired when the user pasted the content into one of the editing roots of the editor.
 *
 * Introduced by {@link module:clipboard/clipboardobserver~ClipboardObserver}.
 *
 * **Note**: This event is not available by default. To make it available, {@link module:clipboard/clipboardobserver~ClipboardObserver}
 * needs to be added to the {@link module:engine/view/document~Document} by using the {@link module:engine/view/view~View#addObserver}
 * method. This is usually done by the {@link module:clipboard/clipboard~Clipboard} plugin, but if for some reason it is not loaded,
 * the observer must be added manually.
 *
 * @see module:engine/view/document~Document#event:clipboardInput
 * @event module:engine/view/document~Document#event:paste
 * @param {module:clipboard/clipboardobserver~ClipboardEventData} data The event data.
 */

/**
 * Fired when the user copied the content from one of the editing roots of the editor.
 *
 * Introduced by {@link module:clipboard/clipboardobserver~ClipboardObserver}.
 *
 * **Note**: This event is not available by default. To make it available, {@link module:clipboard/clipboardobserver~ClipboardObserver}
 * needs to be added to the {@link module:engine/view/document~Document} by using the {@link module:engine/view/view~View#addObserver}
 * method. This is usually done by the {@link module:clipboard/clipboard~Clipboard} plugin, but if for some reason it is not loaded,
 * the observer must be added manually.
 *
 * @see module:clipboard/clipboardobserver~ClipboardObserver
 * @event module:engine/view/document~Document#event:copy
 * @param {module:clipboard/clipboardobserver~ClipboardEventData} data The event data.
 */

/**
 * Fired when the user cut the content from one of the editing roots of the editor.
 *
 * Introduced by {@link module:clipboard/clipboardobserver~ClipboardObserver}.
 *
 * **Note**: This event is not available by default. To make it available, {@link module:clipboard/clipboardobserver~ClipboardObserver}
 * needs to be added to the {@link module:engine/view/document~Document} by using the {@link module:engine/view/view~View#addObserver}
 * method. This is usually done by the {@link module:clipboard/clipboard~Clipboard} plugin, but if for some reason it is not loaded,
 * the observer must be added manually.
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

/**
 * Fired as a continuation of the {@link #event:dragover} event.
 *
 * It is a part of the {@glink framework/guides/deep-dive/clipboard#input-pipeline clipboard input pipeline}.
 *
 * This event carries a `dataTransfer` object which comes from the clipboard and whose content should be processed
 * and inserted into the editor.
 *
 * **Note**: This event is not available by default. To make it available, {@link module:clipboard/clipboardobserver~ClipboardObserver}
 * needs to be added to the {@link module:engine/view/document~Document} by using the {@link module:engine/view/view~View#addObserver}
 * method. This is usually done by the {@link module:clipboard/clipboard~Clipboard} plugin, but if for some reason it is not loaded,
 * the observer must be added manually.
 *
 * @see module:clipboard/clipboardobserver~ClipboardObserver
 * @see module:clipboard/clipboard~Clipboard
 * @event module:engine/view/document~Document#event:dragging
 * @param {Object} data The event data.
 * @param {module:clipboard/datatransfer~DataTransfer} data.dataTransfer The data transfer instance.
 * @param {module:engine/view/element~Element} target The tree view element representing the target.
 * @param {Array.<module:engine/view/range~Range>} data.targetRanges Ranges which are the target of the operation
 * (usually – into which the content should be inserted).
 * It is the drop position (which can be different than the selection at the moment of drop).
 */

/**
 * Fired when the user starts dragging the content in one of the editing roots of the editor.
 *
 * Introduced by {@link module:clipboard/clipboardobserver~ClipboardObserver}.
 *
 * **Note**: This event is not available by default. To make it available, {@link module:clipboard/clipboardobserver~ClipboardObserver}
 * needs to be added to the {@link module:engine/view/document~Document} by using the {@link module:engine/view/view~View#addObserver}
 * method. This is usually done by the {@link module:clipboard/clipboard~Clipboard} plugin, but if for some reason it is not loaded,
 * the observer must be added manually.
 *
 * @see module:engine/view/document~Document#event:clipboardInput
 * @event module:engine/view/document~Document#event:dragstart
 * @param {module:clipboard/clipboardobserver~ClipboardEventData} data The event data.
 */

/**
 * Fired when the user ended dragging the content.
 *
 * Introduced by {@link module:clipboard/clipboardobserver~ClipboardObserver}.
 *
 * **Note**: This event is not available by default. To make it available, {@link module:clipboard/clipboardobserver~ClipboardObserver}
 * needs to be added to the {@link module:engine/view/document~Document} by using the {@link module:engine/view/view~View#addObserver}
 * method. This is usually done by the {@link module:clipboard/clipboard~Clipboard} plugin, but if for some reason it is not loaded,
 * the observer must be added manually.
 *
 * @see module:engine/view/document~Document#event:clipboardInput
 * @event module:engine/view/document~Document#event:dragend
 * @param {module:clipboard/clipboardobserver~ClipboardEventData} data The event data.
 */

/**
 * Fired when the user drags the content into one of the editing roots of the editor.
 *
 * Introduced by {@link module:clipboard/clipboardobserver~ClipboardObserver}.
 *
 * **Note**: This event is not available by default. To make it available, {@link module:clipboard/clipboardobserver~ClipboardObserver}
 * needs to be added to the {@link module:engine/view/document~Document} by using the {@link module:engine/view/view~View#addObserver}
 * method. This is usually done by the {@link module:clipboard/clipboard~Clipboard} plugin, but if for some reason it is not loaded,
 * the observer must be added manually.
 *
 * @see module:engine/view/document~Document#event:clipboardInput
 * @event module:engine/view/document~Document#event:dragenter
 * @param {module:clipboard/clipboardobserver~ClipboardEventData} data The event data.
 */

/**
 * Fired when the user drags the content out of one of the editing roots of the editor.
 *
 * Introduced by {@link module:clipboard/clipboardobserver~ClipboardObserver}.
 *
 * **Note**: This event is not available by default. To make it available, {@link module:clipboard/clipboardobserver~ClipboardObserver}
 * needs to be added to the {@link module:engine/view/document~Document} by using the {@link module:engine/view/view~View#addObserver}
 * method. This is usually done by the {@link module:clipboard/clipboard~Clipboard} plugin, but if for some reason it is not loaded,
 * the observer must be added manually.
 *
 * @see module:engine/view/document~Document#event:clipboardInput
 * @event module:engine/view/document~Document#event:dragleave
 * @param {module:clipboard/clipboardobserver~ClipboardEventData} data The event data.
 */
