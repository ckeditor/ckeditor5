/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module email/integrations/font
 */

import { Plugin } from 'ckeditor5/src/core.js';
import type { FontColorConfig } from '@ckeditor/ckeditor5-font';

import { EmailIntegrationUtils } from '../emailintegrationutils.js';

/**
 * A plugin that checks if the Font plugin is properly configured for the email integration.
 */
export class FontIntegration extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ EmailIntegrationUtils ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'FontIntegration' as const;
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
	public afterInit(): void {
		this._checkColorConfig( 'fontColor' );
		this._checkColorConfig( 'fontBackgroundColor' );
	}

	/**
	 * Checks if the color configuration of the Font plugin is properly set for the email integration.
	 */
	private _checkColorConfig( entry: 'fontColor' | 'fontBackgroundColor' ): void {
		const utils = this.editor.plugins.get( EmailIntegrationUtils );
		const fontConfig: FontColorConfig | undefined = this.editor.config.get( entry );

		if ( !fontConfig ) {
			return;
		}

		utils._validateConfigColorValue( `${ entry }.colors` );
		utils._validateConfigColorValue( `${ entry }.documentColors` );
		utils._validateConfigColorFormat( `${ entry }.colorPicker.format` );
	}
}
