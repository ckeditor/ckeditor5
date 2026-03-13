/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import packageJson from '../../package.json' with { type: 'json' };

export default async function fetchCKEditor5LtsVersion( config ) {
	config.variables ??= {};
	config.variables.CKBOX_VERSION = packageJson.devDependencies.ckbox;
}
