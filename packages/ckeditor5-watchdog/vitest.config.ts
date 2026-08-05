/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { ViteUserConfig } from 'vitest/config';
import { createVitestConfig } from '../../vitest.config';

const config: ViteUserConfig = createVitestConfig( import.meta.dirname, {

	// The watchdog tests intentionally trigger uncaught errors and rejections to verify the watchdog's
	// error handling. Disable Vitest's unhandled error tracking so these expected errors are not reported
	// and re-logged, which would otherwise flood the test output.
	browser: {
		trackUnhandledErrors: false
	}
} );

export default config;
