/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { defineConfig } from 'vitest/config';
import svg from 'vite-plugin-svgo';

export default defineConfig( {
	plugins: [
		svg()
	],
	test: {
		include: [
			'tests/**/*.{js,ts}'
		],
		exclude: [
			'./tests/_utils/**/*.{js,ts}',
			'./tests/fixtures/**/*.{js,ts}',
			'./tests/manual/**'
		],
		setupFiles: [
			'../../tests/_utils/licensekeybefore.js'
		],
		browser: {
			enabled: true,
			name: 'chrome',
			provider: 'webdriverio',
			// providerOptions: {},
			headless: true,
			// ui: false,
			screenshotFailures: false
		},
		// globals: true,
		coverage: {
			thresholds: {
				lines: 100,
				functions: 100,
				branches: 100,
				statements: 100
			},
			provider: 'istanbul',
			include: [
				'src/**'
			]
		}
	}
} );
