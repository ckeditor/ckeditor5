/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const {
	getChangesForVersion
} = require( '@ckeditor/ckeditor5-dev-env/lib/release-tools/utils/changelog' );

module.exports = function insertChangelog( version ) {
	return getChangesForVersion( version );
};
