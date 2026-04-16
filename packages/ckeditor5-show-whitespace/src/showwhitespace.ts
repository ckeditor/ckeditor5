/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module show-whitespace/showwhitespace
 */

import { Plugin } from '@ckeditor/ckeditor5-core';

import { ShowWhitespaceEditing } from './showwhitespaceediting.js';
import { ShowWhitespaceUI } from './showwhitespaceui.js';

/**
 * The show whitespace feature.
 *
 * It renders invisible whitespace characters (spaces, non-breaking spaces, soft breaks, paragraph marks)
 * as visible symbols in the editing view.
 */
export class ShowWhitespace extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ShowWhitespace' as const;
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
	public static get requires() {
		return [ ShowWhitespaceEditing, ShowWhitespaceUI ] as const;
	}
}
