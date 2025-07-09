/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module cloud-services
 */

export { CloudServices } from './cloudservices.js';
export { CloudServicesCore } from './cloudservicescore.js';
export type { TokenUrl, CloudServicesConfig } from './cloudservicesconfig.js';
export { Token, type InitializedToken, type CloudServicesTokenOptions } from './token/token.js';
export type { UploadGateway } from './uploadgateway/uploadgateway.js';

export type {
	FileUploader,
	CloudServicesFileUploaderErrorEvent,
	CloudServicesFileUploaderProgressErrorEvent
} from './uploadgateway/fileuploader.js';

import './augmentation.js';
