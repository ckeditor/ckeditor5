/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { tools } from '@ckeditor/ckeditor5-dev-utils';

export default async function buildTsAndDllForCKEditor5Root() {
	await tools.shExec( 'pnpm run build', { async: true, verbosity: 'silent' } );
	await tools.shExec( 'pnpm run build:dist', { async: true, verbosity: 'silent' } );
	await tools.shExec( 'pnpm run dll:build --skip-packages-dll', { async: true, verbosity: 'silent' } );
}
