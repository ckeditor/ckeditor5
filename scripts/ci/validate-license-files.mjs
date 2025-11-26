/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { validateLicenseFiles } from '@ckeditor/ckeditor5-dev-license-checker';
import { parseArgs } from 'node:util';
import upath from 'upath';

const { fix, verbose } = parseArgs( { options: {
	'fix': { type: 'boolean', default: false },
	'verbose': { type: 'boolean', default: false }
} } ).values;

validateLicenseFiles( {
	fix,
	verbose,
	isPublic: true,
	shouldProcessPackages: true,
	projectName: 'CKEditor&nbsp;5',
	mainPackageName: 'ckeditor5',
	rootDir: upath.resolve( import.meta.dirname, '..', '..' ),
	copyrightOverrides: [ {
		packageName: '@ckeditor/ckeditor5-ckbox',
		dependencies: [
			{ license: 'MIT', name: 'blurhash', copyright: 'Copyright (c) 2018 Wolt Enterprises.' }
		]
	}, {
		packageName: '@ckeditor/ckeditor5-emoji',
		dependencies: [
			{ license: 'MIT', name: 'emojibase-data', copyright: 'Copyright (c) 2017-2019 Miles Johnson.' },
			{ license: 'MIT', name: 'is-emoji-supported', copyright: 'Copyright (c) 2016-2020 Koala Interactive, Inc.' }
		]
	}, {
		packageName: '@ckeditor/ckeditor5-link',
		dependencies: [
			{ license: 'MIT', name: 'Regular expression for URL validation', copyright: 'Copyright (c) 2010-2018 Diego Perini.' }
		]
	} ]
} ).then( exitCode => process.exit( exitCode ) );
