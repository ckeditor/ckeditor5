/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { defineConfig } from 'vitest/config';

export default defineConfig( {
	test: {
		deps: {
			// Make the ESM-CJS interop match plain Node.js, so that CJS dependencies (e.g. `@babel/traverse`)
			// expose the same shape in tests as in production scripts.
			interopDefault: false
		},
		testTimeout: 10000,
		mockReset: true,
		restoreMocks: true,
		include: [
			'scripts-tests/**/*.@(js|mjs|cjs)'
		],
		exclude: [
			'scripts-tests/vitest.config.mjs',
			'scripts-tests/**/_utils.mjs'
		],
		coverage: {
			provider: 'v8',
			include: [
				'scripts/**/*.@(js|mjs|cjs)'
			],
			reporter: [ 'text' ]
		}
	}
} );
