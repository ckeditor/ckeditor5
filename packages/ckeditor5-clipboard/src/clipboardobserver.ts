/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module clipboard/clipboardobserver
 */

import { EventInfo } from '@ckeditor/ckeditor5-utils';

import {
	DataTransfer,
	DomEventObserver,
	type DomEventData,
	type View,
	type ViewDocumentFragment,
	type ViewElement,
	type ViewRange
} from '@ckeditor/ckeditor5-engine';

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
 */
export default class ClipboardObserver extends DomEventObserver<
	'paste' | 'copy' | 'cut' | 'drop' | 'dragover' | 'dragstart' | 'dragend' | 'dragenter' | 'dragleave',
	ClipboardEventData
> {
	constructor( view: View ) {
		super( view );

		const viewDocument = this.document;

		this.domEventType = [ 'paste', 'copy', 'cut', 'drop', 'dragover', 'dragstart', 'dragend', 'dragenter', 'dragleave' ];

		this.listenTo<ViewDocumentClipboardEvent>( viewDocument, 'paste', handleInput( 'clipboardInput' ), { priority: 'low' } );
		this.listenTo<ViewDocumentDragEvent>( viewDocument, 'drop', handleInput( 'clipboardInput' ), { priority: 'low' } );
		this.listenTo<ViewDocumentDragEvent>( viewDocument, 'dragover', handleInput( 'dragging' ), { priority: 'low' } );

		function handleInput( type: 'clipboardInput' | 'dragging' ) {
			return ( evt: EventInfo, data: DomEventData<ClipboardEvent | DragEvent> & ClipboardEventData ) => {
				data.preventDefault();

				const targetRanges = data.dropRange ? [ data.dropRange ] : null;
				const eventInfo = new EventInfo( viewDocument, type );

				viewDocument.fire<ViewDocumentClipboardInputEvent>( eventInfo, {
					dataTransfer: data.dataTransfer,
					method: evt.name as 'paste' | 'dragover' | 'drop',
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

	public onDomEvent( domEvent: ClipboardEvent | DragEvent ): void {
		const evtData: ClipboardEventData = {
			dataTransfer: new DataTransfer( 'clipboardData' in domEvent ? domEvent.clipboardData! : domEvent.dataTransfer! )
		};

		if ( domEvent.type == 'drop' || domEvent.type == 'dragover' ) {
			evtData.dropRange = getDropViewRange( this.view, domEvent as DragEvent );
		}

		this.fire( domEvent.type, domEvent, evtData );
	}
}

export type ViewDocumentClipboardEvent = {
	name: 'paste' | 'copy' | 'cut';
	args: [ data: DomEventData<ClipboardEvent> & ClipboardEventData ];
};

export type ViewDocumentDragEvent = {
	name: 'drop' | 'dragover' | 'dragstart' | 'dragend' | 'dragenter' | 'dragleave';
	args: [ data: DomEventData<DragEvent> & ClipboardEventData ];
};

export type ClipboardEventData = {

	/**
	 * The data transfer instance.
	 */
	readonly dataTransfer: DataTransfer;

	/**
	 * The position into which the content is dropped.
	 */
	dropRange?: ViewRange | null;
};

export type ViewDocumentClipboardInputEvent = {
	name: 'clipboardInput' | 'dragging';
	args: [ data: {
		dataTransfer: DataTransfer;
		method: 'paste' | 'dragover' | 'drop';
		targetRanges: Array<ViewRange> | null;
		target: ViewElement;
		content?: ViewDocumentFragment;
	} ];
};

function getDropViewRange( view: View, domEvent: DragEvent & { rangeParent?: Node; rangeOffset?: number } ) {
	const domDoc = ( domEvent.target as Node ).ownerDocument!;
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
		domRange.setStart( domEvent.rangeParent, domEvent.rangeOffset! );
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
 *
 * @eventName clipboardInput
 * @param data The event data.
 */
export type ClipboardInputEvent = {
	name: 'clipboardInput';
	args: [ data: ClipboardInputEventData ];
};

/**
 * The value of the {@link module:engine/view/document~Document#event:paste},
 * {@link module:engine/view/document~Document#event:copy} and {@link module:engine/view/document~Document#event:cut} events.
 *
 * In order to access the clipboard data, use the `dataTransfer` property.
 */
export interface ClipboardInputEventData extends DomEventData {

	/**
	 * Data transfer instance.
	 */
	dataTransfer: DataTransfer;

	/**
	 * Whether the event was triggered by a paste or drop operation.
	 */
	method: 'paste' | 'drop';

	/**
	 * The tree view element representing the target.
	 */
	target: ViewElement;

	/**
	 * Ranges which are the target of the operation (usually – into which the content should be inserted).
	 * If the clipboard input was triggered by a paste operation, this property is not set. If by a drop operation,
	 * then it is the drop position (which can be different than the selection at the moment of drop).
	 */
	targetRanges?: Array<Range>;
}

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
 *
 * @eventName dragover
 * @param data The event data.
 */
export type DragoverEvent = {
	name: 'dragover';
	args: [ data: ClipboardEventData ];
};

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
 *
 * @eventName drop
 * @param data The event data.
 */
export type DropEvent = {
	name: 'drop';
	args: [ data: ClipboardEventData ];
};

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
 *
 * @eventName paste
 * @param {module:clipboard/clipboardobserver~ClipboardEventData} data The event data.
 */
export type PasteEvent = {
	name: 'paste';
	args: [ data: ClipboardEventData ];
};

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
 *
 * @eventName copy
 * @param data The event data.
 */
export type CopyEvent = {
	name: 'copy';
	args: [ data: ClipboardEventData ];
};

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
 *
 * @eventName cut
 * @param data The event data.
 */
export type CutEvent = {
	name: 'cut';
	args: [ data: ClipboardEventData ];
};

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
 *
 * @eventName dragging
 * @param data The event data.
 */
export type DraggingEvent = {
	name: 'dragging';
	args: [ data: DraggingEventData ];
};

export type DraggingEventData = {

	/**
	 * The data transfer instance.
	 */
	dataTransfer: DataTransfer;

	/**
	 * The tree view element representing the target.
	 */
	target: Element;

	/**
	 * Ranges which are the target of the operation (usually – into which the content should be inserted).
	 * It is the drop position (which can be different than the selection at the moment of drop).
	 */
	targetRanges: Array<Range>;

};

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
 *
 * @eventName dragstart
 * @param data The event data.
 */
export type DragStartEvent = {
	name: 'dragstart';
	args: [ data: ClipboardEventData ];
};

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
 *
 * @eventName dragend
 * @param data The event data.
 */
export type DragEndEvent = {
	name: 'dragend';
	args: [ data: ClipboardEventData ];
};

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
 *
 * @eventName dragenter
 * @param data The event data.
 */
export type DragEnterEvent = {
	name: 'dragenter';
	args: [ data: ClipboardEventData ];
};

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
 *
 * @eventName dragleave
 * @param data The event data.
 */
export type DragLeaveEvent = {
	name: 'dragleave';
	args: [ data: ClipboardEventData ];
};
