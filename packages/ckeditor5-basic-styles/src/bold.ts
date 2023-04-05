/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module basic-styles/bold
 */

import { Plugin } from 'ckeditor5/src/core';
import BoldEditing from './bold/boldediting';
import BoldUI from './bold/boldui';

/**
 * The bold feature.
 *
 * For a detailed overview check the {@glink features/basic-styles Basic styles feature} guide
 * and the {@glink api/basic-styles package page}.
 *
 * This is a "glue" plugin which loads the {@link module:basic-styles/bold/boldediting~BoldEditing bold editing feature}
 * and {@link module:basic-styles/bold/boldui~BoldUI bold UI feature}.
 */
export default class Bold extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ BoldEditing, BoldUI ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'Bold' {
		return 'Bold';
	}
}
