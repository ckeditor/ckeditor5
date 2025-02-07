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
export default class EmptyBlockEmailIntegration extends Plugin {
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
		return 'EmptyBlockEmailIntegration' as const;
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
		const emptyBlock = this.editor.plugins.has( 'EmptyBlock' );

		if ( !emptyBlock ) {
			utils._logInfo(
				'email-integration-missing-empty-block-plugin',
				'Consider enabling the EmptyBlock plugin to ensure that exported content has empty blocks.',
				'features/email#empty-block-plugin'
			);
		}
	}
}
