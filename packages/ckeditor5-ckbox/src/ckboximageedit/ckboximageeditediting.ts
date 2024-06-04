/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ckbox/ckboximageedit/ckboximageeditediting
 */

import { PendingActions, Plugin } from 'ckeditor5/src/core.js';
import { Notification } from 'ckeditor5/src/ui.js';
import CKBoxImageEditCommand from './ckboximageeditcommand.js';
import CKBoxEditing from '../ckboxediting.js';
import CKBoxUtils from '../ckboxutils.js';

/**
 * The CKBox image edit editing plugin.
 */
export default class CKBoxImageEditEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'CKBoxImageEditEditing' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ CKBoxEditing, CKBoxUtils, PendingActions, Notification, 'ImageUtils', 'ImageEditing' ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const { editor } = this;

		editor.commands.add( 'ckboxImageEdit', new CKBoxImageEditCommand( editor ) );
	}
}
