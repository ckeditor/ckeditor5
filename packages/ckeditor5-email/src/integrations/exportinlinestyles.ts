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
export default class ExportInlineStylesEmailIntegration extends Plugin {
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
		return 'ExportInlineStylesEmailIntegration' as const;
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
			/**
			 * Warning shown when the ExportInlineStyles plugin is missing. While it is not required for the email integration to work,
			 * it is recommended to enable it to ensure that exported content has inlined styles. This is important for email clients
			 * as they have compatibility issues with external stylesheets and CSS classes.
			 *
			 * @error email-integration-missing-export-inline-styles-plugin
			 */
			utils._logSuppressibleWarning( 'email-integration-missing-export-inline-styles-plugin' );
		}
	}
}
