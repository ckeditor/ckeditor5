/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module watchdog
 */

export { ContextWatchdog } from './contextwatchdog.js';
export { EditorWatchdog, type EditorCreatorFunction } from './editorwatchdog.js';
export { Watchdog, type WatchdogConfig } from './watchdog.js';

export type {
	EventMap,
	EventArgs,
	EventCallback
} from './watchdog.js';

import './augmentation.js';
