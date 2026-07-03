/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ViteUserConfig } from 'vitest/config';
import { createVitestConfig } from '../../vitest.config';

const __dirname = dirname( fileURLToPath( import.meta.url ) );

const config: ViteUserConfig = createVitestConfig( import.meta.dirname, {
	name: 'engine',
	setupFiles: [
		resolve( __dirname, 'tests/common.js' )
	],
	exclude: [
		'tests/common.js',
		'tests/model/operation/transform/utils.js'
	],
	coverage: {
		exclude: [
			'src/legacyerrors.ts'
		]
	}
} );

export default config;
