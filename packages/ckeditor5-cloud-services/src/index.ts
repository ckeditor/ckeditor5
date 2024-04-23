/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module cloud-services
 */

export { default as CloudServices } from './cloudservices.js';
export { default as CloudServicesCore } from './cloudservicescore.js';
export type { TokenUrl, CloudServicesConfig } from './cloudservicesconfig.js';
export type { default as Token, InitializedToken } from './token/token.js';
export type { default as UploadGateway } from './uploadgateway/uploadgateway.js';
export type { default as FileUploader } from './uploadgateway/fileuploader.js';

import './augmentation.js';
