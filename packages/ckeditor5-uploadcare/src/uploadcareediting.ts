/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module uploadcare/uploadcareediting
 */

import { Plugin } from 'ckeditor5/src/core.js';

import UploadcareCommand from './uploadcarecommand.js';

/**
 * The Uploadcare editing feature. It introduces the {@link module:uploadcare/uploadcarecommand~UploadcareCommand command}.
 */
export default class UploadcareEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'UploadcareEditing' as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;

		editor.commands.add( 'uploadcare', new UploadcareCommand( editor ) );
	}
}
