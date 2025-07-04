/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module clipboard
 */

export { Clipboard } from './clipboard.js';
export {
	ClipboardPipeline,
	type ClipboardContentInsertionEvent,
	type ClipboardContentInsertionData,
	type ClipboardInputTransformationEvent,
	type ClipboardInputTransformationData,
	type ClipboardOutputTransformationEvent,
	type ClipboardOutputTransformationData,
	type ViewDocumentClipboardOutputEvent,
	type ViewDocumentClipboardOutputEventData
} from './clipboardpipeline.js';

export {
	ClipboardMarkersUtils,
	type ClipboardMarkerRestrictedAction,
	type ClipboardMarkerConfiguration
} from './clipboardmarkersutils.js';

export { plainTextToHtml } from './utils/plaintexttohtml.js';
export { viewToPlainText } from './utils/viewtoplaintext.js';

export { DragDrop } from './dragdrop.js';
export { PastePlainText } from './pasteplaintext.js';
export { DragDropTarget } from './dragdroptarget.js';
export { DragDropBlockToolbar } from './dragdropblocktoolbar.js';

export {
	ClipboardObserver,
	type ClipboardEventData,
	type ClipboardInputEventData,
	type DraggingEventData,
	type ViewDocumentClipboardInputEvent,
	type ViewDocumentCopyEvent,
	type ViewDocumentPasteEvent,
	type ViewDocumentCutEvent,
	type ViewDocumentDragOverEvent,
	type ViewDocumentDropEvent,
	type ViewDocumentDraggingEvent,
	type ViewDocumentDragStartEvent,
	type ViewDocumentDragEndEvent,
	type ViewDocumentDragEnterEvent,
	type ViewDocumentDragLeaveEvent
} from './clipboardobserver.js';

export { DragDrop as _DragDrop } from './dragdrop.js';
export { DragDropBlockToolbar as _DragDropBlockToolbar } from './dragdropblocktoolbar.js';
export { DragDropTarget as _DragDropTarget } from './dragdroptarget.js';
export { LineView as _ClipboardLineView } from './lineview.js';

export { normalizeClipboardData as _normalizeClipboardData } from './utils/normalizeclipboarddata.js';

import './augmentation.js';
