/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imagetextalternative/imagetextalternativeediting
 */

import { Plugin } from 'ckeditor5/src/core';
import ImageTextAlternativeCommand from './imagetextalternativecommand';
import ImageUtils from '../imageutils';

/**
 * The image text alternative editing plugin.
 *
 * Registers the `'imageTextAlternative'` command.
 */
export default class ImageTextAlternativeEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ ImageUtils ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'ImageTextAlternativeEditing' {
		return 'ImageTextAlternativeEditing';
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		this.editor.commands.add( 'imageTextAlternative', new ImageTextAlternativeCommand( this.editor ) );
	}
}
