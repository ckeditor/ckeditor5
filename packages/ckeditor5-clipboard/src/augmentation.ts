/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type {
	Clipboard,
	ClipboardPipeline,
	PastePlainText,
	DragDrop,
	DragDropExperimental,
	DragDropTarget,
	DragDropBlockToolbar
} from './index';

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ Clipboard.pluginName ]: Clipboard;
		[ ClipboardPipeline.pluginName ]: ClipboardPipeline;
		[ PastePlainText.pluginName ]: PastePlainText;
		[ DragDrop.pluginName ]: DragDrop;
		[ DragDropExperimental.pluginName ]: DragDropExperimental;
		[ DragDropTarget.pluginName ]: DragDropTarget;
		[ DragDropBlockToolbar.pluginName ]: DragDropBlockToolbar;
	}
}
