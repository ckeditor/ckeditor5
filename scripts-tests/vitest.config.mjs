/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { defineConfig } from 'vitest/config';

export default defineConfig( {
	test: {
		testTimeout: 10000,
		mockReset: true,
		restoreMocks: true,
		include: [
			'./scripts-tests/**/*.@(js|mjs|cjs)'
		],
		exclude: [
			'./scripts-tests/vitest.config.mjs'
		],
		coverage: {
			provider: 'v8',
			include: [
				'./scripts-tests/**'
			],
			reporter: [ 'text' ]
		}
	}
} );
