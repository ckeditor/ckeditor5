/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { parseArgs } from 'node:util';
import upath from 'upath';

import { validateLicenseFiles } from '@ckeditor/ckeditor5-dev-ci';

const { fix } = parseArgs( { options: {
	'fix': { type: 'boolean', default: false }
} } ).values;

validateLicenseFiles( {
	baseDir: upath.resolve( import.meta.dirname, '..' ),
	commonFeatureName: 'CKEditor',
	mainPackageName: 'ckeditor5',
	fix,
	authorDisclaimerCallback,
	additionalCopyrights: [ {
		packageName: 'ckeditor5-emoji',
		dependencies: [
			{ license: 'MIT', name: 'emojibase-data', copyright: 'Copyright (c) 2017-2019 Miles Johnson.' },
			{ license: 'MIT', name: 'is-emoji-supported', copyright: 'Copyright (c) 2016-2020 Koala Interactive, Inc.' }
		]
	}, {
		packageName: 'ckeditor5-link',
		dependencies: [
			{ license: 'MIT', name: 'Regular Expression for URL validation', copyright: 'Copyright (c) 2010-2018 Diego Perini.' }
		]
	} ]
} ).then( exitCode => {
	process.exit( exitCode );
} );

function authorDisclaimerCallback( featureName ) {
	return [
		'Where not otherwise indicated, all',
		featureName,
		'content is authored by CKSource engineers and consists of CKSource-owned intellectual property.',
		'In some specific instances, CKEditor will incorporate work done by developers outside of CKSource with their express permission.'
	].join( ' ' );
}
