/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { Plugin } from '@ckeditor/ckeditor5-dll/core';
import { logWarning } from '@ckeditor/ckeditor5-dll/utils';

class MahPlugin extends Plugin {
	afterInit() {
		logWarning( 'foo-bar' );
	}
}

export default MahPlugin;
