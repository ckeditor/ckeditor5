/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type {
	SimpleUploadConfig,
	FileRepository,
	SimpleUploadAdapter,
	Base64UploadAdapter
} from './index.js';

declare module '@ckeditor/ckeditor5-core' {
	interface EditorConfig {

		/**
		 * The configuration of the {@link module:upload/adapters/simpleuploadadapter~SimpleUploadAdapter simple upload adapter}.
		 *
		 * Read more in {@link module:upload/uploadconfig~SimpleUploadConfig}.
		 */
		simpleUpload?: SimpleUploadConfig;
	}

	interface PluginsMap {
		[ FileRepository.pluginName ]: FileRepository;
		[ SimpleUploadAdapter.pluginName ]: SimpleUploadAdapter;
		[ Base64UploadAdapter.pluginName ]: Base64UploadAdapter;
	}
}
