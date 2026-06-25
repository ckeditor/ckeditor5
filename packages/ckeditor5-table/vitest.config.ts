/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { ViteUserConfig } from 'vitest/config';
import { createVitestConfig } from '../../vitest.config';

const config: ViteUserConfig = createVitestConfig( {
	name: 'table'
} );

// With per-file isolation the accumulated browser contexts exhaust the renderer and crash this
// large suite ("Browser connection was closed"). Reusing a single context keeps memory bounded.
config.test!.browser!.isolate = false;

export default config;
