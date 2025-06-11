/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ckbox
 */

export { CKBox } from './ckbox.js';
export { CKBoxEditing } from './ckboxediting.js';
export { CKBoxUI } from './ckboxui.js';
export { CKBoxImageEditEditing } from './ckboximageedit/ckboximageeditediting.js';
export { CKBoxImageEditUI } from './ckboximageedit/ckboximageeditui.js';
export { CKBoxImageEdit } from './ckboximageedit.js';
export { CKBoxCommand } from './ckboxcommand.js';
export { CKBoxImageEditCommand } from './ckboximageedit/ckboximageeditcommand.js';

export type { CKBoxConfig } from './ckboxconfig.js';

export {
	getImageUrls as _getCKBoxImageUrls,
	getWorkspaceId as _getCKBoxWorkspaceId,
	blurHashToDataUrl as _ckboxBlurHashToDataUrl,
	sendHttpRequest as _sendCKBoxHttpRequest,
	convertMimeTypeToExtension as _ckBoxConvertMimeTypeToExtension,
	getContentTypeOfUrl as _getCKBoxContentTypeOfUrl,
	getFileExtension as _getCKBoxFileExtension
} from './utils.js';

export type {
	CKBoxAssetDefinition as _CKBoxAssetDefinition,
	CKBoxAssetImageDefinition as _CKBoxAssetImageDefinition,
	CKBoxAssetLinkDefinition as _CKBoxAssetLinkDefinition,
	CKBoxAssetImageAttributesDefinition as _CKBoxAssetImageAttributesDefinition,
	CKBoxAssetLinkAttributesDefinition as _CKBoxAssetLinkAttributesDefinition
} from './ckboxconfig.js';

export { createEditabilityChecker as _createCKBoxEditabilityChecker } from './ckboximageedit/utils.js';
export { prepareImageAssetAttributes as _prepareCKBoxImageAssetAttributes } from './ckboxcommand.js';

import './augmentation.js';
