/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module email/integrations/list
 */

import { Plugin } from 'ckeditor5/src/core.js';
import type { ListConfig } from '@ckeditor/ckeditor5-list';

import EmailIntegrationUtils from '../emailintegrationutils.js';

/**
 * A plugin that checks if the List feature configuration is supported by the email integration.
 */
export default class ListEmailIntegration extends Plugin {
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
		return 'ListEmailIntegration' as const;
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
		const listConfig: ListConfig | undefined = this.editor.config.get( 'list' );

		if ( listConfig && listConfig.properties && listConfig.properties.reversed ) {
			/**
			 * It is recommended to avoid using reversed lists as they may not work correctly in some email clients.
			 * While it is possible to disable this warning using the `email.warnings.suppress`
			 * configuration option, it is discouraged.
			 *
			 * @error email-integration-unsupported-reversed-list
			 */
			utils._logSuppressibleWarning( 'email-integration-unsupported-reversed-list' );
		}
	}
}
