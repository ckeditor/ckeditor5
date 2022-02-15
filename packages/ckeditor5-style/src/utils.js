/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module TODO
 */

export function normalizeConfig( rawConfig ) {
	// Clone. Don't override the user config.
	const normalizedConfig = { ...rawConfig };

	if ( !normalizedConfig.block ) {
		normalizedConfig.block = [];
	}

	if ( !normalizedConfig.inline ) {
		normalizedConfig.inline = [];
	}

	return normalizedConfig;
}
