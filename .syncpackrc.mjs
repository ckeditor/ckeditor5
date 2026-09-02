/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import path from 'node:path';

/**
 * Configuration for `syncpack`, which ensures that `dependencies` and `devDependencies`
 * across the repository use consistent, exact versions. Executed in CI via the
 * `check-dependencies:versions-match` script (`syncpack lint`). Use `syncpack fix`
 * to resolve reported issues automatically.
 */

// Mirrors `IS_ISOLATED_REPOSITORY` from `scripts/constants.mjs`. When this repository is
// checked out inside the `external/` directory of the commercial development environment,
// the commercial `package.json` files are validated together with the public ones.
//
// Note: `syncpack` resolves the `source` patterns against the current working directory and
// cannot match files above it. In the commercial environment the process must therefore run
// from the commercial root — `scripts/ci/check-dependencies-versions-match.mjs` takes care
// of that.
const isIsolatedRepository = path.basename( path.join( import.meta.dirname, '..' ) ) !== 'external';

/**
 * CodeMirror packages are modular and depend on each other. We must use the same versions
 * as they have in their dependencies to avoid issues with versions mismatch.
 *
 * See: https://github.com/ckeditor/ckeditor5-commercial/issues/6939.
 */
const codeMirrorPackages = [
	'@codemirror/autocomplete',
	'@codemirror/lang-html',
	'@codemirror/language',
	'@codemirror/state',
	'@codemirror/theme-one-dark',
	'@codemirror/view'
];

export default {
	source: [
		'package.json',
		'packages/*/package.json',
		...isIsolatedRepository ? [] : [
			'external/ckeditor5/package.json',
			'external/ckeditor5/packages/*/package.json'
		]
	],

	versionGroups: [
		{
			label: 'Packages developed in this repository must use the workspace protocol.',
			dependencies: [ '$LOCAL' ],
			pinVersion: 'workspace:*'
		},
		{
			label: 'External packages in `devDependencies` are not checked.',
			dependencyTypes: [ 'dev' ],
			dependencies: [ '**' ],
			isIgnored: true
		}
	],

	semverGroups: [
		{
			dependencies: [ '$LOCAL' ],
			isIgnored: true
		},
		{
			label: 'CodeMirror packages must use the caret range.',
			dependencies: codeMirrorPackages,
			range: '^'
		},
		{
			label: 'Dependencies must be pinned to exact versions.',
			dependencyTypes: [ 'prod' ],
			dependencies: [ '**' ],
			range: ''
		}
	]
};
