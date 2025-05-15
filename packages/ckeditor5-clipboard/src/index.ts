/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module clipboard
 */

export { default as Clipboard } from './clipboard.js';
export {
	default as ClipboardPipeline,
	type ClipboardContentInsertionEvent,
	type ClipboardContentInsertionData,
	type ClipboardInputTransformationEvent,
	type ClipboardInputTransformationData,
	type ClipboardOutputTransformationEvent,
	type ClipboardOutputTransformationData,
	type ViewDocumentClipboardOutputEvent
} from './clipboardpipeline.js';

export {
	default as ClipboardMarkersUtils,
	type ClipboardMarkerRestrictedAction,
	type ClipboardMarkerConfiguration
} from './clipboardmarkersutils.js';

export { default as plainTextToHtml } from './utils/plaintexttohtml.js';
export { default as viewToPlainText } from './utils/viewtoplaintext.js';

export { default as DragDrop } from './dragdrop.js';
export { default as PastePlainText } from './pasteplaintext.js';
export { default as DragDropTarget } from './dragdroptarget.js';
export { default as DragDropBlockToolbar } from './dragdropblocktoolbar.js';

export {
	default as ClipboardObserver,
	type ClipboardEventData,
	type ViewDocumentClipboardInputEvent,
	type ViewDocumentCopyEvent,
	type ViewDocumentPasteEvent,
	type ViewDocumentCutEvent
} from './clipboardobserver.js';

import './augmentation.js';
