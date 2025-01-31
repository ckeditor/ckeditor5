/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module email/emailintegration
 */

import { Plugin } from 'ckeditor5/src/core.js';

import { HighlightEmailIntegration } from './integrations/highlight.js';
import { ImageEmailIntegration } from './integrations/image.js';
import { MathTypeEmailIntegration } from './integrations/mathtype.js';
import { ExportInlineStylesIntegration } from './integrations/exportinlinestyles.js';
import { ListEmailIntegration } from './integrations/list.js';
import { TableEmailIntegration } from './integrations/table.js';
import { EmptyBlockIntegration } from './integrations/emptyblock.js';
import { FontIntegration } from './integrations/font.js';
import { SourceEditingIntegration } from './integrations/sourceediting.js';

/**
 * The email integration plugin.
 *
 * This is a "glue" plugin that integrates the email integration feature with the editor.
 */
export class EmailIntegration extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'EmailIntegration' as const;
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
	public static get requires() {
		return [
			HighlightEmailIntegration,
			ImageEmailIntegration,
			MathTypeEmailIntegration,
			ExportInlineStylesIntegration,
			ListEmailIntegration,
			TableEmailIntegration,
			EmptyBlockIntegration,
			FontIntegration,
			SourceEditingIntegration
		] as const;
	}
}
