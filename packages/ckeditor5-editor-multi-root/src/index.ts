/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module editor-multi-root
 */

export { MultiRootEditor } from './multirooteditor.js';
export { MultiRootEditorUI } from './multirooteditorui.js';
export { MultiRootEditorUIView } from './multirooteditoruiview.js';

export type {
	AddRootEvent,
	DetachRootEvent,
	LoadRootEvent,
	AddRootOptions,
	LoadRootOptions,
	AddRootRootConfig,
	RootEditableOptions
} from './multirooteditor.js';

// Re-export for backward compatibility.
export type { EditorRootAttributes as RootAttributes } from '@ckeditor/ckeditor5-core';

import './augmentation.js';
