/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module upload
 */

export {
	default as FileRepository,
	type UploadAdapter,
	type UploadResponse,
	type FileLoader
} from './filerepository.js';
export { default as Base64UploadAdapter } from './adapters/base64uploadadapter.js';
export { default as SimpleUploadAdapter } from './adapters/simpleuploadadapter.js';
export type { SimpleUploadConfig } from './uploadconfig.js';

import './augmentation.js';
