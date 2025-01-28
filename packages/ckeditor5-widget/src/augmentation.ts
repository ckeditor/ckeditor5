/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type {
	Widget,
	WidgetResize,
	WidgetToolbarRepository,
	WidgetTypeAround
} from './index.js';

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ Widget.pluginName ]: Widget;
		[ WidgetResize.pluginName ]: WidgetResize;
		[ WidgetToolbarRepository.pluginName ]: WidgetToolbarRepository;
		[ WidgetTypeAround.pluginName ]: WidgetTypeAround;
	}
}
