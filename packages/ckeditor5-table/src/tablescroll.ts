/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tablescroll
 */

import { Plugin, type PluginDependenciesOf } from '@ckeditor/ckeditor5-core';
import { TableScrollEditing } from './tablescroll/tablescrollediting.js';

export class TableScroll extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'TableScroll' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public static get requires(): PluginDependenciesOf<[ TableScrollEditing ]> {
		return [ TableScrollEditing ];
	}
}
