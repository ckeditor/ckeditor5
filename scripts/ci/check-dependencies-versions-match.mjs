#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { checkVersionMatch } from '@ckeditor/ckeditor5-dev-dependency-checker';
import { CKEDITOR5_ROOT_PATH } from '../constants.mjs';
import isCKEditor5PackageFactory from '../release/utils/isckeditor5packagefactory.mjs';

const shouldFix = process.argv[ 2 ] === '--fix';

/**
 * All dependencies should be pinned to the exact version. However, there are some exceptions,
 * where we want to use the caret or tilde operator. This object contains such exceptions.
 */
const versionExceptions = {
	/**
	 * CodeMirror packages are modular and depend on each other. We must use the same versions
	 * as they have in their dependencies to avoid issues with versions mismatch.
	 *
	 * See: https://github.com/cksource/ckeditor5-commercial/issues/6939.
	 */
	'@codemirror/autocomplete': '^',
	'@codemirror/lang-html': '^',
	'@codemirror/language': '^',
	'@codemirror/state': '^',
	'@codemirror/view': '^',
	'@codemirror/theme-one-dark': '^'
};

const pkgJsonPatterns = [
	'package.json',
	'packages/*/package.json',
	'external/ckeditor5-commercial/packages/*/package.json',
	'external/ckeditor5-commercial/package.json'
];

isCKEditor5PackageFactory().then( isCkeditor5Package => {
	checkVersionMatch( {
		cwd: CKEDITOR5_ROOT_PATH,
		fix: shouldFix,
		isCkeditor5Package,
		pkgJsonPatterns,
		versionExceptions
	} );
} );
