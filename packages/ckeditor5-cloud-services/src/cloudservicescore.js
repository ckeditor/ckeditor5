/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module cloud-services/cloudservicescore
 */

import { ContextPlugin } from 'ckeditor5/src/core';
import Token from './token/token';
import UploadGateway from './uploadgateway/uploadgateway';

/**
 * The `CloudServicesCore` plugin exposes the base API for communication with CKEditor Cloud Services.
 *
 * @extends module:core/contextplugin~ContextPlugin
 */
export default class CloudServicesCore extends ContextPlugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'CloudServicesCore';
	}

	/**
	 * Creates the {@link module:cloud-services/token~Token} instance.
	 *
	 * @param {String|Function} tokenUrlOrRefreshToken Endpoint address to download the token or a callback that provides the token. If the
	 * value is a function it has to match the {@link module:cloud-services/token~refreshToken} interface.
	 * @param {Object} [options]
	 * @param {String} [options.initValue] Initial value of the token.
	 * @param {Boolean} [options.autoRefresh=true] Specifies whether to start the refresh automatically.
	 * @returns {module:cloud-services/token~Token}
	 */
	createToken( tokenUrlOrRefreshToken, options ) {
		return new Token( tokenUrlOrRefreshToken, options );
	}

	/**
	 * Creates the {@link module:cloud-services/uploadgateway/uploadgateway~UploadGateway} instance.
	 *
	 * @param {module:cloud-services/token~Token} token Token used for authentication.
	 * @param {String} apiAddress API address.
	 * @returns {module:cloud-services/uploadgateway/uploadgateway~UploadGateway}
	 */
	createUploadGateway( token, apiAddress ) {
		return new UploadGateway( token, apiAddress );
	}
}
