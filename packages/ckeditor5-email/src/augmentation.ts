/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { EmailIntegrationConfig } from './emailintegrationconfig.js';
import type { EmailIntegration } from './index.js';

declare module '@ckeditor/ckeditor5-core' {
	interface EditorConfig {

		/**
		 * The configuration of the {@link module:email/emailintegration~EmailIntegration EmailIntegration feature}.
		 *
		 * Read more in {@link module:email/emailintegrationconfig~EmailIntegrationConfig}.
		 */
		email?: EmailIntegrationConfig;
	}

	interface PluginsMap {
		[ EmailIntegration.pluginName ]: EmailIntegration;
	}
}
