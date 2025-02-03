/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module html-support/integrations/emailintegration
 */

import { Plugin } from 'ckeditor5/src/core.js';

import DataSchema from '../dataschema.js';
import type { EmailIntegration } from '@ckeditor/ckeditor5-email';

/**
 * Provides the General HTML Support integration with {@link module:email/emailintegration~EmailIntegration EmailIntegration} feature.
 */
export default class EmailIntegrationSupport extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ DataSchema ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'EmailIntegrationSupport' as const;
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
		const editor = this.editor;

		if ( !editor.plugins.has( 'EmailIntegration' ) ) {
			return;
		}

		const emailIntegration: EmailIntegration = editor.plugins.get( 'EmailIntegration' );

		console.info( emailIntegration );
	}
}
