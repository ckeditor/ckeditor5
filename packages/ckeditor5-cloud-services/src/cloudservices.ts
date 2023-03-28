/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module cloud-services/cloudservices
 */

import { ContextPlugin } from 'ckeditor5/src/core';
import { CKEditorError } from 'ckeditor5/src/utils';
import CloudServicesCore from './cloudservicescore';
import type { CloudServicesConfig, TokenUrl } from './cloudservicesconfig';
import type { InitializedToken } from './token/token';

/**
 * Plugin introducing the integration between CKEditor 5 and CKEditor Cloud Services .
 *
 * It initializes the token provider based on
 * the {@link module:cloud-services/cloudservicesconfig~CloudServicesConfig `config.cloudService`}.
 */
export default class CloudServices extends ContextPlugin implements CloudServicesConfig {
	/**
	 * The authentication token URL for CKEditor Cloud Services or a callback to the token value promise. See the
	 * {@link module:cloud-services/cloudservicesconfig~CloudServicesConfig#tokenUrl} for more details.
	 */
	public readonly tokenUrl?: TokenUrl;

	/**
	 * The URL to which the files should be uploaded.
	 */
	public readonly uploadUrl?: string;

	/**
	 * The URL for web socket communication, used by the `RealTimeCollaborativeEditing` plugin. Every customer (organization in the CKEditor
	 * Ecosystem dashboard) has their own, unique URLs to communicate with CKEditor Cloud Services. The URL can be found in the
	 * CKEditor Ecosystem customer dashboard.
	 *
	 * Note: Unlike most plugins, `RealTimeCollaborativeEditing` is not included in any CKEditor 5 build and needs to be installed manually.
	 * Check [Collaboration overview](https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/overview.html) for more details.
	 */
	public readonly webSocketUrl?: string;

	/**
	 * An optional parameter used for integration with CKEditor Cloud Services when uploading the editor build to cloud services.
	 *
	 * Whenever the editor build or the configuration changes, this parameter should be set to a new, unique value to differentiate
	 * the new bundle (build + configuration) from the old ones.
	 */
	public readonly bundleVersion?: string;

	/**
	 * Other plugins use this token for the authorization process. It handles token requesting and refreshing.
	 * Its value is `null` when {@link module:cloud-services/cloudservicesconfig~CloudServicesConfig#tokenUrl} is not provided.
	 *
	 * @readonly
	 */
	public token: InitializedToken | null = null;

	/**
	 * A map of token object instances keyed by the token URLs.
	 */
	private readonly _tokens = new Map<TokenUrl, InitializedToken>();

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'CloudServices' {
		return 'CloudServices';
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ CloudServicesCore ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public async init(): Promise<void> {
		const config = this.context.config;

		const options = config.get( 'cloudServices' ) || {};

		for ( const [ key, value ] of Object.entries( options ) as Array<[key: keyof CloudServicesConfig, value: any]> ) {
			( this as CloudServicesConfig )[ key ] = value;
		}

		if ( !this.tokenUrl ) {
			this.token = null;

			return;
		}

		const cloudServicesCore: CloudServicesCore = this.context.plugins.get( 'CloudServicesCore' );

		this.token = await cloudServicesCore.createToken( this.tokenUrl ).init();

		this._tokens.set( this.tokenUrl, this.token );
	}

	/**
	 * Registers an additional authentication token URL for CKEditor Cloud Services or a callback to the token value promise. See the
	 * {@link module:cloud-services/cloudservicesconfig~CloudServicesConfig#tokenUrl} for more details.
	 *
	 * @param tokenUrl The authentication token URL for CKEditor Cloud Services or a callback to the token value promise.
	 */
	public async registerTokenUrl( tokenUrl: TokenUrl ): Promise<InitializedToken> {
		// Reuse the token instance in case of multiple features using the same token URL.
		if ( this._tokens.has( tokenUrl ) ) {
			return this.getTokenFor( tokenUrl );
		}

		const cloudServicesCore: CloudServicesCore = this.context.plugins.get( 'CloudServicesCore' );
		const token = await cloudServicesCore.createToken( tokenUrl ).init();

		this._tokens.set( tokenUrl, token );

		return token;
	}

	/**
	 * Returns an authentication token provider previously registered by {@link #registerTokenUrl}.
	 *
	 * @param tokenUrl The authentication token URL for CKEditor Cloud Services or a callback to the token value promise.
	 */
	public getTokenFor( tokenUrl: TokenUrl ): InitializedToken {
		const token = this._tokens.get( tokenUrl );

		if ( !token ) {
			/**
			 * The provided `tokenUrl` was not registered by {@link module:cloud-services/cloudservices~CloudServices#registerTokenUrl}.
			 *
			 * @error cloudservices-token-not-registered
			 */
			throw new CKEditorError( 'cloudservices-token-not-registered', this );
		}

		return token;
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		super.destroy();

		for ( const token of this._tokens.values() ) {
			token.destroy();
		}
	}
}
