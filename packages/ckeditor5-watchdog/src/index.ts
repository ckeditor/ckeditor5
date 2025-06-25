/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module watchdog
 */

export {
	ContextWatchdog,
	type ContextWatchdogRestartEvent,
	type ContextWatchdogItemErrorEvent,
	type ContextWatchdogItemErrorEventData,
	type ContextWatchdogItemRestartEvent,
	type ContextWatchdogItemRestartEventData,
	type ContextWatchdogItemConfiguration
} from './contextwatchdog.js';

export { EditorWatchdog, type EditorWatchdogCreatorFunction, type EditorWatchdogRestartEvent } from './editorwatchdog.js';
export { Watchdog, type WatchdogConfig } from './watchdog.js';

export type {
	EventMap,
	EventArgs,
	EventCallback,
	WatchdogErrorEvent,
	WatchdogErrorEventData,
	WatchdogStateChangeEvent,
	WatchdogState
} from './watchdog.js';

import './augmentation.js';
