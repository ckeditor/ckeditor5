/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module image/imagetextalternative/imagetextalternativeediting
 */

import { Plugin, type PluginDependenciesOf } from '@ckeditor/ckeditor5-core';
import { ImageTextAlternativeCommand } from './imagetextalternativecommand.js';
import { ImageUtils } from '../imageutils.js';

/**
 * The image text alternative editing plugin.
 *
 * Registers the `'imageTextAlternative'` command.
 */
export class ImageTextAlternativeEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires(): PluginDependenciesOf<[ ImageUtils ]> {
		return [ ImageUtils ];
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ImageTextAlternativeEditing' as const;
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
	public init(): void {
		this.editor.commands.add( 'imageTextAlternative', new ImageTextAlternativeCommand( this.editor ) );
	}
}
