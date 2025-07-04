/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module adapter-ckfinder
 */

export { CKFinderUploadAdapter } from './uploadadapter.js';
export {
	getCsrfToken as _getCKFinderCsrfToken,
	getCookie as _getCKFinderCookie,
	setCookie as _setCKFinderCookie
} from './utils.js';

import './augmentation.js';
