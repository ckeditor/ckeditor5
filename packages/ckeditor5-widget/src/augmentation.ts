/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type Widget from './widget';
import type WidgetResize from './widgetresize';
import type WidgetToolbarRepository from './widgettoolbarrepository';
import type WidgetTypeAround from './widgettypearound/widgettypearound';

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ Widget.pluginName ]: Widget;
		[ WidgetResize.pluginName ]: WidgetResize;
		[ WidgetToolbarRepository.pluginName ]: WidgetToolbarRepository;
		[ WidgetTypeAround.pluginName ]: WidgetTypeAround;
	}
}
