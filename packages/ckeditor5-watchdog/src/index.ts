/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module watchdog
 */

export { default as ContextWatchdog } from './contextwatchdog.js';
export { default as EditorWatchdog, type EditorCreatorFunction } from './editorwatchdog.js';
export { default as Watchdog, type WatchdogConfig } from './watchdog.js';

import './augmentation.js';
