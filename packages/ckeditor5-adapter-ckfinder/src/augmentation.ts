/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type { CKFinderUploadAdapter } from './index.js';

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ CKFinderUploadAdapter.pluginName ]: CKFinderUploadAdapter;
	}
}
