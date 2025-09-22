/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

// WARNING: The URLs below should not be used for any other purpose than Easy Image plugin development.
// Images uploaded using the testing token service may be deleted automatically at any moment.
// If you would like to try the Easy Image service, please sign up for a free trial (https://ckeditor.com/ckeditor-cloud-services/).
// Images uploaded during the free trial will not be deleted for the whole trial period and additionally the trial service can be converted
// into a subscription at any moment, allowing you to preserve all uploaded images.

// TODO: Revert back to production URLs after testing dev preset
export const TOKEN_URL = 'https://cke5-dev.cke-cs-dev.com/token/dev/ab089950cf4fa9f576cbeb778bdda5d92dca3023bbe2036072ddfc431ee0';

export const UPLOAD_URL = 'https://cke5-dev.cke-cs-dev.com/easyimage/upload/';

export const WEB_SOCKET_URL = 'cke5-dev.cke-cs-dev.com/ws';

export const CS_CONFIG = {
	tokenUrl: TOKEN_URL,
	uploadUrl: UPLOAD_URL,
	webSocketUrl: WEB_SOCKET_URL
};
