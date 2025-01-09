/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module editor-multi-root
 */

export { default as MultiRootEditor } from './multirooteditor.js';

export type {
	RootAttributes,
	AddRootEvent,
	DetachRootEvent
} from './multirooteditor.js';

import './augmentation.js';
