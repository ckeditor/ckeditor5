/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module html-support/integrations/emailintegration
 */

import { Plugin } from 'ckeditor5/src/core.js';

import DataSchema from '../dataschema.js';
import type { EmailIntegrationUtils } from '@ckeditor/ckeditor5-email';

/**
 * Provides the General HTML Support integration with {@link module:email/emailintegration~EmailIntegration EmailIntegration} feature.
 */
export default class EmailIntegrationSupport extends Plugin {
	/**
	 * List of HTML elements that are not fully supported in email clients.
	 */
	private static readonly UNSUPPORTED_ELEMENTS = new Set( [
		'object', 'article', 'details', 'main', 'nav', 'summary',
		'abbr', 'acronym', 'bdi', 'output', 'hgroup',
		'form', 'input', 'button', 'audio', 'canvas',
		'meter', 'progress'
	] );

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
		if ( this.editor.plugins.has( 'EmailIntegrationUtils' ) ) {
			this._checkUnsupportedElements();
		}
	}

	/**
	 * Checks if the schema contains unsupported HTML elements.
	 */
	private _checkUnsupportedElements() {
		const emailUtils: EmailIntegrationUtils = this.editor.plugins.get( 'EmailIntegrationUtils' );
		const dataSchema = this.editor.plugins.get( DataSchema );

		for ( const element of EmailIntegrationSupport.UNSUPPORTED_ELEMENTS ) {
			const definitions = dataSchema.getDefinitionsForView( element );

			if ( definitions.size ) {
				emailUtils._logSuppressibleWarning( 'email-unsupported-html-element', { element } );
			}
		}
	}
}
