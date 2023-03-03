/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module cloud-services
 */

export { default as CloudServices } from './cloudservices';
export { default as CloudServicesCore } from './cloudservicescore';
export { TokenUrl, type CloudServicesConfig } from './cloudservicesconfig';
export type { default as Token, InitializedToken } from './token/token';
export type { default as UploadGateway } from './uploadgateway/uploadgateway';
export type { default as FileUploader } from './uploadgateway/fileuploader';

import './augmentation';
