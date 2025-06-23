#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * Describes an external module (imported from another package) that is out of scope of this tool.
 * It is used to resolve external symbols imported from other packages.
 */
export class ExternalModule {
	constructor( fileName ) {
		this.fileName = fileName;
		this.exports = [];
	}

	get packageName() {
		return this.fileName;
	}

	get relativeFileName() {
		return '';
	}
}
