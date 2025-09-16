/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { PACKAGES_DIRECTORY } from './constants.mjs';
import { CKEDITOR5_COMMERCIAL_PATH, CKEDITOR5_ROOT_PATH } from '../../constants.mjs';

export default function getChangelogOptions( cliArguments ) {
	const changelogOptions = {
		cwd: CKEDITOR5_ROOT_PATH,
		packagesDirectory: PACKAGES_DIRECTORY,
		shouldIgnoreRootPackage: true,
		npmPackageToCheck: 'ckeditor5',
		transformScope: name => {
			const noScopedPackages = [
				'ckeditor5',
				'ckeditor5-collaboration',
				'ckeditor5-premium-feature'
			];

			if ( noScopedPackages.includes( name ) ) {
				return {
					displayName: name,
					npmUrl: 'https://www.npmjs.com/package/' + name
				};
			}

			return {
				displayName: name.replace( /^ckeditor5-/, '' ),
				npmUrl: 'https://www.npmjs.com/package/@ckeditor/' + name
			};
		},
		linkFilter,
		externalRepositories: [
			{
				cwd: CKEDITOR5_COMMERCIAL_PATH,
				packagesDirectory: PACKAGES_DIRECTORY,
				linkFilter
			}
		]
	};

	if ( cliArguments.date ) {
		changelogOptions.date = cliArguments.date;
	}

	if ( cliArguments.dryRun ) {
		changelogOptions.disableFilesystemOperations = cliArguments.dryRun;
	}

	return changelogOptions;
}

function linkFilter( resourceUrl ) {
	const disallowedRepositories = [
		'https://github.com/ckeditor/ckeditor5-commercial/',
		'https://github.com/ckeditor/ckeditor5-internal/'
	];

	return disallowedRepositories.every( repository => !resourceUrl.startsWith( repository ) );
}
