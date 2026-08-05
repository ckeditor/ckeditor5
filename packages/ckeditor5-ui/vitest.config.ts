/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { ViteUserConfig } from 'vitest/config';
import { createVitestConfig } from '../../vitest.config';

const config: ViteUserConfig = createVitestConfig( import.meta.dirname, {
	exclude: [
		'**/_utils',
		'**/fixtures',
		'**/manual'
	],
	coverage: {
		// Type-only modules (interfaces and event typings). They are never loaded at runtime,
		// so no test can produce coverage for them.
		exclude: [
			'src/button/button.ts',
			'src/button/buttonlabel.ts',
			'src/dropdown/button/dropdownbutton.ts',
			'src/dropdown/dropdownpanelfocusable.ts',
			'src/search/filteredview.ts'
		]
	}
} );

export default config;
