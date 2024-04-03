/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
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

export type {
	ClipboardEventData
} from './clipboardobserver.js';

export { default as DragDrop } from './dragdrop.js';
export { default as PastePlainText } from './pasteplaintext.js';
export { default as DragDropTarget } from './dragdroptarget.js';
export { default as DragDropBlockToolbar } from './dragdropblocktoolbar.js';

export type {
	ViewDocumentClipboardInputEvent,
	ViewDocumentCopyEvent,
	ViewDocumentCutEvent
} from './clipboardobserver.js';

import './augmentation.js';
