/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/icons
 */

import global from './dom/global.js';

export type Icons = Record<string, string>;

declare global {
  // eslint-disable-next-line no-var
  var CKEDITOR_ICONS: Icons;
}

export function registerIcon<const T extends string>(
	name: T,
	icon: string,
	element: HTMLElement = global.document.documentElement
): T {
	element.style.setProperty( name, `url("data:image/svg+xml;base64,${ btoa( icon ) }")` );

	return name;
}
