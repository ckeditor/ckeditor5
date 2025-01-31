/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module email/integrations/sourceediting
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { EmailIntegrationUtils } from '../emailintegrationutils.js';

/**
 * A plugin that checks if the SourceEditing or SourceEditingEnhanced plugin are loaded.
 */
export class SourceEditingIntegration extends Plugin {
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
		return 'SourceEditingIntegration' as const;
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
		const { plugins } = this.editor;
		const utils = plugins.get( EmailIntegrationUtils );

		if ( !plugins.has( 'SourceEditing' ) && !plugins.has( 'SourceEditingEnhanced' ) ) {
			/**
			 * Warning shown when the `SourceEditing` or `SourceEditingEnhanced` plugin is missing in the email integration.
			 * While it's not required for the email integration to work, it's recommended to have it enabled to ensure that the source code
			 * view is available for users. This is important for email developers who need to work with the source code directly.
			 *
			 * @error email-missing-source-editing-plugin
			 */
			utils._logSuppressibleWarning( 'email-missing-source-editing-plugin' );
		}
	}
}
