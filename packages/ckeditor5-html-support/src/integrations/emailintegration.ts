/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module html-support/integrations/emailintegration
 */

import { Plugin } from 'ckeditor5/src/core.js';

import DataFilter, { type DataFilterRegisterEvent } from '../datafilter.js';

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
		'meter', 'progress', 'iframe'
	] );

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ DataFilter ] as const;
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
	public init(): void {
		const { plugins } = this.editor;

		if ( !plugins.has( 'EmailIntegrationUtils' ) ) {
			return;
		}

		const dataFilter = plugins.get( DataFilter );
		const emailUtils: any = plugins.get( 'EmailIntegrationUtils' );

		for ( const element of EmailIntegrationSupport.UNSUPPORTED_ELEMENTS ) {
			dataFilter.once<DataFilterRegisterEvent>( `register:${ element }`, ( evt, definition ) => {
				emailUtils._logSuppressibleWarning( 'email-unsupported-html-element', { element: definition.view } );
			} );
		}
	}
}
