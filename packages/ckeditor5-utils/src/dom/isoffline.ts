/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/dom/isoffline
 */

import { global } from './global.js';

/**
 * Checks whether the browser reports that there is no network connection.
 */
export function isOffline(): boolean {
	return !global.window.navigator.onLine;
}
