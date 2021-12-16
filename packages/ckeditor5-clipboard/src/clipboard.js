/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module clipboard/clipboard
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import ClipboardPipeline from './clipboardpipeline';
import DragDrop from './dragdrop';
import PastePlainText from './pasteplaintext';

/**
 * The clipboard feature.
 *
 * Read more about the clipboard integration in the {@glink framework/guides/deep-dive/clipboard clipboard deep dive guide}.
 *
 * This is a "glue" plugin which loads the following plugins:
 * * {@link module:clipboard/clipboardpipeline~ClipboardPipeline}
 * * {@link module:clipboard/dragdrop~DragDrop}
 * * {@link module:clipboard/pasteplaintext~PastePlainText}
 *
 * @extends module:core/plugin~Plugin
 */
export default class Clipboard extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Clipboard';
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ClipboardPipeline, DragDrop, PastePlainText ];
	}
}
