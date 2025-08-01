/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { tools } from '@ckeditor/ckeditor5-dev-utils';
import { CKEDITOR5_MAIN_PACKAGE_PATH } from '../../constants.mjs';

export default async function buildMainCKEditor5PackageDll() {
	await tools.shExec( 'yarn run dll:build', { async: true, verbosity: 'silent', cwd: CKEDITOR5_MAIN_PACKAGE_PATH } );
}
