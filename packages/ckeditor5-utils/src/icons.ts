/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/icons
 */

export type Icons = Record<string, string>;

declare global {
  // eslint-disable-next-line no-var
  var CKEDITOR_ICONS: Icons;
}

export function registerIcon(
	name: string,
	icon: string,
	force: boolean = false
): () => string {
	// Create icons object if it doesn't exist yet.
	// TODO: Replace with `globalThis.CKEDITOR_ICONS ||= {};` when we migrate to ES2022.
	if ( !globalThis.CKEDITOR_ICONS ) {
		globalThis.CKEDITOR_ICONS = {};
	}

	// If icon is provided and it's not already registered, then register it.
	if ( !globalThis.CKEDITOR_ICONS[ name ] || force ) {
		globalThis.CKEDITOR_ICONS[ name ] = icon;
	}

	return () => useIcon( name )!;
}

export function useIcon( name: string ): string | undefined {
	return globalThis.CKEDITOR_ICONS && globalThis.CKEDITOR_ICONS[ name ];
}
