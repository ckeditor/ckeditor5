/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module upload
 */

export {
	default as FileRepository,
	type UploadAdapter,
	type UploadResponse,
	type FileLoader
} from './filerepository';
export { default as FileDialogButtonView } from './ui/filedialogbuttonview';
export { default as Base64UploadAdapter } from './adapters/base64uploadadapter';
export { default as SimpleUploadAdapter } from './adapters/simpleuploadadapter';
export type { SimpleUploadConfig } from './uploadconfig';

import './augmentation';
