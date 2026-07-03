/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { ViteUserConfig } from 'vitest/config';
import { createVitestConfig } from '../../vitest.config';

const config: ViteUserConfig = createVitestConfig( import.meta.dirname, {
	name: 'ui',
	exclude: [
		'**/_utils',
		'**/fixtures',
		'**/manual',
		'tests/_utils-tests/testfocuscycling.ts'
	],
	coverage: {
		exclude: [
			'src/legacyerrors.ts',
			'src/button/button.ts',
			'src/button/buttonlabel.ts',
			'src/dropdown/button/dropdownbutton.ts',
			'src/dropdown/dropdownpanelfocusable.ts',
			'src/search/filteredview.ts'
		]
	}
} );

export default config;
