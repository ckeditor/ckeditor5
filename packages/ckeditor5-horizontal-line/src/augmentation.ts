/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type {
	HorizontalLine,
	HorizontalLineCommand,
	HorizontalLineEditing,
	HorizontalLineUI
} from './index';

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ HorizontalLine.pluginName ]: HorizontalLine;
		[ HorizontalLineEditing.pluginName ]: HorizontalLineEditing;
		[ HorizontalLineUI.pluginName ]: HorizontalLineUI;
	}

	interface CommandsMap {
		horizontalLine: HorizontalLineCommand;
	}
}
