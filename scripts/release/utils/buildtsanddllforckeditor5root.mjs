/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { tools } from '@ckeditor/ckeditor5-dev-utils';
import { CKEDITOR5_MAIN_PACKAGE_PATH } from '../../constants.mjs';

export default async function buildTsAndDllForCKEditor5Root() {
	const options = {
		async: true,
		verbosity: 'silent',
		cwd: CKEDITOR5_MAIN_PACKAGE_PATH
	};

	await tools.shExec( 'pnpm run build', options );
	await tools.shExec( 'pnpm run build:dist', options );
	await tools.shExec( 'pnpm run dll:build', options );
}
