/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module list/legacylist
 */

import { LegacyListEditing } from './legacylist/legacylistediting.js';
import { ListUI } from './list/listui.js';

import { Plugin } from '@ckeditor/ckeditor5-core';

/**
 * The legacy list feature.
 *
 * This is a "glue" plugin that loads the {@link module:list/legacylist/legacylistediting~LegacyListEditing legacy list editing feature}
 * and {@link module:list/list/listui~ListUI list UI feature}.
 */
export class LegacyList extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ LegacyListEditing, ListUI ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'LegacyList' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}
}
