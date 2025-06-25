/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module editor-multi-root
 */

export { MultiRootEditor } from './multirooteditor.js';
export { MultiRootEditorUI } from './multirooteditorui.js';
export { MultiRootEditorUIView } from './multirooteditoruiview.js';

export type {
	RootAttributes,
	AddRootEvent,
	DetachRootEvent,
	LoadRootEvent,
	AddRootOptions,
	LoadRootOptions
} from './multirooteditor.js';

import './augmentation.js';
