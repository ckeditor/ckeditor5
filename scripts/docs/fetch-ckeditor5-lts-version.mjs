/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { npm } from '@ckeditor/ckeditor5-dev-utils';

const LTS_TAG = 'lts-v47';
const VAR_NAME = 'CKEDITOR_5_VERSION_LTS_V47';

export default async function fetchCKEditor5LtsVersion( config ) {
	config.variables ??= {};

	try {
		const { version } = await npm.manifest( `ckeditor5@${ LTS_TAG }` );

		if ( VAR_NAME in config.variables ) {
			console.warn( `The "${ VAR_NAME }" will be overridden by a hook.` );
		}

		config.variables[ VAR_NAME ] = version;
	} catch ( e ) {
		console.error( e.message );

		throw new Error( 'Cannot determine an LTS version.' );
	}
}
