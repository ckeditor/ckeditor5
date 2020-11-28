/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { Plugin } from '@ckeditor/ckeditor5-core/core';
import { logWarning } from '@ckeditor/ckeditor5-utils/utils';

class MahPlugin extends Plugin {
	afterInit() {
		// eslint-disable-next-line no-undef
		console.log( 'MahPlugin works!' );
		logWarning( 'foo-bar' );
	}
}

export default MahPlugin;
