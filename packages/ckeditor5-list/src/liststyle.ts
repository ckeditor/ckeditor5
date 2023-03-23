/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/liststyle
 */

import { Plugin, type Editor } from 'ckeditor5/src/core';
import ListProperties from './listproperties';
import { logWarning } from 'ckeditor5/src/utils';

/**
 * The list style feature.
 *
 * This is an obsolete plugin that exists for backward compatibility only.
 * Use the {@link module:list/listproperties~ListProperties list properties plugin} instead.
 *
 * @deprecated
 */
export default class ListStyle extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ ListProperties ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'ListStyle' {
		return 'ListStyle';
	}

	constructor( editor: Editor ) {
		super( editor );

		logWarning( 'The `ListStyle` plugin is obsolete. Use `ListProperties` instead.' );
	}
}
