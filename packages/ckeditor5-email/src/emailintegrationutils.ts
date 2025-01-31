/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module email/emailintegrationutils
 */

import type { ColorOption } from 'ckeditor5/src/ui.js';

import { type EditorConfig, Plugin } from 'ckeditor5/src/core.js';
import { type GetSubConfig, logWarning } from 'ckeditor5/src/utils.js';

/**
 * A utility plugin for the email integration that provides common methods for checking the editor configuration and logging warnings.
 */
export class EmailIntegrationUtils extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'EmailIntegrationUtils' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public async init(): Promise<void> {
		this.editor.config.define( 'email.warnings', {
			suppress: [],
			suppressAll: false
		} );
	}

	/**
	 * Logs a warning about email client compatibility if it's not suppressed in the configuration.
	 *
	 * @internal
	 */
	public _logSuppressibleWarning( warningCode: string, data?: object ): void {
		const editor = this.editor;
		const config = editor.config.get( 'email.warnings' )!;

		if ( config.suppressAll ) {
			return;
		}

		if ( typeof config.suppress === 'function' && config.suppress( warningCode ) ) {
			return;
		}

		if ( Array.isArray( config.suppress ) && config.suppress.includes( warningCode ) ) {
			return;
		}

		logWarning( warningCode, data );
	}

	/**
	 * Logs a warning about an incompatible plugin if it's loaded.
	 *
	 * @internal
	 */
	public _checkUnsupportedPlugin( pluginName: string ): void {
		if ( !this.editor.plugins.has( pluginName ) ) {
			return;
		}

		/**
		 * The plugin is not supported in email editing mode as it may not work correctly in email clients.
		 * While it is possible to disable this warning using the `email.warnings.suppress` configuration option
		 * or by removing the plugin from the editor configuration, it is strongly discouraged as the plugin's
		 * functionality may break or behave unexpectedly in email clients.
		 *
		 * @error email-unsupported-plugin
		 */
		this._logSuppressibleWarning( 'email-unsupported-plugin', { pluginName } );
	}

	/**
	 * Logs a warning about an unsupported color format used in the configuration.
	 *
	 * @internal
	 */
	public _validateConfigColorValue<const K extends string>( configPath: NeverIfUnknownConfigPath<K> ): void {
		let color = this.editor.config.get( configPath ) as string | Array<ColorOption> | undefined;

		if ( !color ) {
			return;
		}

		if ( typeof color === 'string' ) {
			color = [ color ];
		}

		if ( Array.isArray( color ) ) {
			for ( const item of color ) {
				const color = typeof item === 'string' ? item : item.color;

				if ( isUnsupportedEmailColor( color ) ) {
					/**
					 * The color format used in the configuration is not supported in email clients.
					 * It may not be displayed correctly in some email clients. Please use `rgb()` or `#RRGGBB` format instead.
					 *
					 * @error email-unsupported-color-value
					 */
					this._logSuppressibleWarning( 'email-unsupported-color-value', { configPath, color } );
				}
			}
		}
	}

	/**
	 * Logs a warning about an unsupported color format used in the configuration.
	 *
	 * @internal
	 */
	public _validateConfigColorFormat<const K extends string>( configPath: NeverIfUnknownConfigPath<K> ): void {
		const format = this.editor.config.get( configPath ) as string | undefined;

		if ( !format ) {
			return;
		}

		if ( isUnsupportedEmailColor( format ) ) {
			/**
			 * The color format used in the configuration is not supported in email clients.
			 * It may not be displayed correctly in some email clients. Please use `rgb()` or `#RRGGBB` format instead.
			 *
			 * @error email-unsupported-color-format
			 */
			this._logSuppressibleWarning( 'email-unsupported-color-format', { configPath, format } );
		}
	}
}

/**
 * Checks if the given color is not supported in email clients.
 */
export function isUnsupportedEmailColor( color: string ): boolean {
	return /hsl|hwb|lab|lch/.test( color );
}

/**
 * A type that returns a key from the `EditorConfig` if the sub-config is not `unknown`.
 */
type NeverIfUnknownConfigPath<K extends string> = unknown extends GetSubConfig<EditorConfig, K> ? never : K;
