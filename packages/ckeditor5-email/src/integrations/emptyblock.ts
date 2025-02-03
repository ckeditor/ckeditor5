/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module email/integrations/emptyblock
 */

import { Plugin } from 'ckeditor5/src/core.js';
import EmailIntegrationUtils from '../emailintegrationutils.js';

/**
 * A plugin that checks if the EmptyBlock plugin is properly configured for the email integration.
 */
export class EmptyBlockIntegration extends Plugin {
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
		return 'EmptyBlockIntegration' as const;
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
		const exportInlineStyles = this.editor.plugins.has( 'EmptyBlock' );

		if ( !exportInlineStyles ) {
			/**
			 * Warning shown when the EmptyBlock plugin is missing. While it's not required for the email integration to work,
			 * the empty block integration is recommended to ensure that exported content has empty blocks. This is important for
			 * email clients because the empty block may be used as separators between different blocks. The editor exports empty
			 * blocks filled with a non-breaking space and it may break some parts of the email layout (like dividers).
			 *
			 * @error email-missing-empty-block-plugin
			 */
			utils._logSuppressibleWarning( 'email-missing-empty-block-plugin' );
		}
	}
}
