/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type {
	LinkConfig,
	AutoLink,
	Link,
	LinkEditing,
	LinkImage,
	LinkImageEditing,
	LinkImageUI,
	LinkUI,
	LinkCommand,
	UnlinkCommand
} from './index';

declare module '@ckeditor/ckeditor5-core' {
	interface EditorConfig {

		/**
		 * The configuration of the {@link module:link/link~Link} feature.
		 *
		 * Read more in {@link module:link/linkconfig~LinkConfig}.
		 */
		link?: LinkConfig;
	}

	interface PluginsMap {
		[ AutoLink.pluginName ]: AutoLink;
		[ Link.pluginName ]: Link;
		[ LinkEditing.pluginName ]: LinkEditing;
		[ LinkImage.pluginName ]: LinkImage;
		[ LinkImageEditing.pluginName ]: LinkImageEditing;
		[ LinkImageUI.pluginName ]: LinkImageUI;
		[ LinkUI.pluginName ]: LinkUI;
	}

	interface CommandsMap {
		link: LinkCommand;
	}

	interface CommandsMap {
		unlink: UnlinkCommand;
	}
}
