/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module cloud-services/cloudservicescore
 */

import { ContextPlugin } from 'ckeditor5/src/core.js';
import type { TokenUrl } from './cloudservicesconfig.js';
import Token, { type InitializedToken, type TokenOptions } from './token/token.js';
import UploadGateway from './uploadgateway/uploadgateway.js';

/**
 * The `CloudServicesCore` plugin exposes the base API for communication with CKEditor Cloud Services.
 */
export default class CloudServicesCore extends ContextPlugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'CloudServicesCore' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * Creates the {@link module:cloud-services/token/token~Token} instance.
	 *
	 * @param tokenUrlOrRefreshToken Endpoint address to download the token or a callback that provides the token. If the
	 * value is a function it has to match the {@link module:cloud-services/token/token~Token#refreshToken} interface.
	 * @param options.initValue Initial value of the token.
	 * @param options.autoRefresh Specifies whether to start the refresh automatically.
	 */
	public createToken( tokenUrlOrRefreshToken: TokenUrl, options?: TokenOptions ): Token {
		return new Token( tokenUrlOrRefreshToken, options );
	}

	/**
	 * Creates the {@link module:cloud-services/uploadgateway/uploadgateway~UploadGateway} instance.
	 *
	 * @param token Token used for authentication.
	 * @param apiAddress API address.
	 */
	public createUploadGateway( token: InitializedToken, apiAddress: string ): UploadGateway {
		return new UploadGateway( token, apiAddress );
	}
}
