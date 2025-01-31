/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module email/integrations/highlight
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { EmailIntegrationUtils } from '../emailintegrationutils.js';

/**
 * A plugin that warns about using Highlight plugin in the email integration.
 */
export class HighlightEmailIntegration extends Plugin {
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
		return 'HighlightEmailIntegration' as const;
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

		utils._checkUnsupportedPlugin( 'Highlight' );
	}
}
