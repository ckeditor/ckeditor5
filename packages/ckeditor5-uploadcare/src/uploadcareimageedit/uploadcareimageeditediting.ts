/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module uploadcare/uploadcareimageedit/uploadcareimageeditediting
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { Notification } from 'ckeditor5/src/ui.js';
import UploadcareImageEditCommand from './uploadcareimageeditcommand.js';
import UploadcareEditing from '../uploadcareediting.js';

/**
 * The Uploadcare image edit editing plugin.
 */
export default class UploadcareImageEditEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'UploadcareImageEditEditing' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ UploadcareEditing, Notification, 'ImageUtils', 'ImageEditing' ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const { editor } = this;

		editor.commands.add( 'uploadcareImageEdit', new UploadcareImageEditCommand( editor ) );
	}
}
