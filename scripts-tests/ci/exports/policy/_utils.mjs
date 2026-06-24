/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

export function createLibrary( declarations ) {
	return {
		packages: new Map( [
			[ '@ckeditor/ckeditor5-example', {
				packageName: '@ckeditor/ckeditor5-example',
				modules: [ { declarations } ]
			} ]
		] )
	};
}

export function createClassDeclaration( { localName = 'Example', baseClasses = [], internal = false, references = [] } = {} ) {
	return { localName, type: 'class', baseClasses, internal, references };
}
