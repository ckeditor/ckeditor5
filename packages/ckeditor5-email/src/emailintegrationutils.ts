/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module email/emailintegrationutils
 */

import type { ColorOption } from 'ckeditor5/src/ui.js';

import { type Editor, type EditorConfig, Plugin } from 'ckeditor5/src/core.js';
import { type GetSubConfig, logWarning } from 'ckeditor5/src/utils.js';

/**
 * A utility plugin for email integration that provides common methods for checking the editor configuration and logging warnings.
 */
export default class EmailIntegrationUtils extends Plugin {
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
	constructor( editor: Editor ) {
		super( editor );

		editor.config.define( 'email.logs', {
			suppress: [],
			suppressAll: false
		} );
	}

	/**
	 * Logs a warning about email client compatibility if it's not suppressed in the configuration.
	 *
	 * @internal
	 */
	public _logSuppressibleWarning( logCode: string, data?: object ): void {
		if ( !this._isSuppressedLog( logCode, data ) ) {
			logWarning( logCode, data );
		}
	}

	/**
	 * Logs an information message about email client compatibility if not suppressed in the configuration.
	 *
	 * @internal
	 */
	public _logInfo( logCode: string, message: string, documentationPath?: string ): void {
		if ( this._isSuppressedLog( logCode ) ) {
			return;
		}

		if ( documentationPath ) {
			const documentationUrl = `https://ckeditor.com/docs/ckeditor5/latest/${ documentationPath }`;

			message += `\nRead more: ${ documentationUrl }`;
		}

		console.info( logCode, message );
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
		 * It is encouraged to remove the plugin from the editor configuration to maintain compatibility.
		 * While it is possible to disable this warning using the `email.warnings.suppress`
		 * configuration option, it is strongly discouraged.
		 *
		 * @error email-integration-unsupported-plugin
		 */
		this._logSuppressibleWarning( 'email-integration-unsupported-plugin', { pluginName } );
	}

	/**
	 * Logs a warning about an unsupported color value used in the configuration.
	 *
	 * @internal
	 */
	public _validateConfigColorValue<const K extends string>( configPath: NeverIfUnknownConfigPath<K> ): void {
		const colorConfig = this.editor.config.get( configPath ) as string | Array<ColorOption> | undefined;

		if ( !colorConfig ) {
			return;
		}

		const isArrayConfig = Array.isArray( colorConfig );
		const colors = isArrayConfig ? colorConfig : [ colorConfig ];

		for ( const [ index, item ] of colors.entries() ) {
			const color = typeof item === 'string' ? item : item.color;

			if ( isUnsupportedEmailColorValue( color ) ) {
				/**
				 * The specified color value uses a format not supported in email clients. This affects various color
				 * settings like fonts, backgrounds, borders, etc. Please use `rgb()` or `#RRGGBB` format instead.
				 *
				 * @error email-integration-unsupported-color-value
				 */
				this._logSuppressibleWarning( 'email-integration-unsupported-color-value', {
					configPath: isArrayConfig ? `${ configPath }[${ index }]` : configPath,
					color
				} );
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

		if ( isUnsupportedEmailColorFormat( format ) ) {
			/**
			 * The color format specified in the editor configuration (e.g. for color pickers or other UI components)
			 * is not supported in email clients. Please use `rgb()` or `#RRGGBB` format instead.
			 *
			 * @error email-integration-unsupported-color-format
			 */
			this._logSuppressibleWarning( 'email-integration-unsupported-color-format', { configPath, format } );
		}
	}

	/**
	 * Checks if the log with the given code should be suppressed.
	 *
	 * @internal
	 */
	private _isSuppressedLog( warningCode: string, data?: object ): boolean {
		const editor = this.editor;
		const config = editor.config.get( 'email.logs' )!;

		if ( config.suppressAll ) {
			return true;
		}

		if ( typeof config.suppress === 'function' && config.suppress( warningCode, data ) ) {
			return true;
		}

		if ( Array.isArray( config.suppress ) && config.suppress.includes( warningCode ) ) {
			return true;
		}

		return false;
	}
}

const UNSUPPORTED_COLOR_FORMATS = [ 'hsl', 'hsla', 'hwb', 'lab', 'lch' ];

/**
 * Checks if the given color value is not supported in email clients.
 */
export function isUnsupportedEmailColorValue( color: string | undefined ): boolean {
	return !!color && UNSUPPORTED_COLOR_FORMATS.some( format => color.includes( `${ format }(` ) );
}

/**
 * Checks if the given color format is not supported in email clients.
 */
export function isUnsupportedEmailColorFormat( color: string | undefined ): boolean {
	return !!color && UNSUPPORTED_COLOR_FORMATS.includes( color );
}

/**
 * A type that returns a key from the `EditorConfig` if the sub-config is not `unknown`.
 */
type NeverIfUnknownConfigPath<K extends string> = unknown extends GetSubConfig<EditorConfig, K> ? never : K;
