/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module email/integrations/exportinlinestyles
 */

import { Plugin } from 'ckeditor5/src/core.js';
import EmailIntegrationUtils from '../emailintegrationutils.js';

/**
 * A plugin that checks if the ExportInlineStyles plugin is properly configured for the email integration.
 */
export class ExportInlineStylesIntegration extends Plugin {
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
		return 'ExportInlineStylesIntegration' as const;
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
		const utils = this.editor.plugins.get( EmailIntegrationUtils );
		const exportInlineStyles = this.editor.plugins.has( 'ExportInlineStyles' );

		if ( !exportInlineStyles ) {
			utils._logInfo(
				'email-integration-missing-export-inline-styles-plugin',
				'Consider enabling the ExportInlineStyles plugin to ensure that exported content has inlined styles.',
				'features/email#missing-empty-block-plugin'
			);
		}
	}
}
