/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { EmailIntegrationConfig } from './emailintegrationconfig.js';
import type {
	EmailIntegration,
	EmailIntegrationUtils,
	EmptyBlockEmailIntegration,
	ExportInlineStylesEmailIntegration,
	FontEmailIntegration,
	HighlightEmailIntegration,
	ImageEmailIntegration,
	ListEmailIntegration,
	TableEmailIntegration,
	MathTypeEmailIntegration,
	SourceEditingEmailIntegration,
	MarkdownEmailIntegration
} from './index.js';

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
		[ EmailIntegrationUtils.pluginName ]: EmailIntegrationUtils;
		[ EmptyBlockEmailIntegration.pluginName ]: EmptyBlockEmailIntegration;
		[ ExportInlineStylesEmailIntegration.pluginName ]: ExportInlineStylesEmailIntegration;
		[ FontEmailIntegration.pluginName ]: FontEmailIntegration;
		[ HighlightEmailIntegration.pluginName ]: HighlightEmailIntegration;
		[ ImageEmailIntegration.pluginName ]: ImageEmailIntegration;
		[ ListEmailIntegration.pluginName ]: ListEmailIntegration;
		[ TableEmailIntegration.pluginName ]: TableEmailIntegration;
		[ MathTypeEmailIntegration.pluginName ]: MathTypeEmailIntegration;
		[ SourceEditingEmailIntegration.pluginName ]: SourceEditingEmailIntegration;
		[ MarkdownEmailIntegration.pluginName ]: MarkdownEmailIntegration;
	}
}
