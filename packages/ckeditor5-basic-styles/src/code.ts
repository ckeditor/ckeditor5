/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module basic-styles/code
 */

import { Plugin } from 'ckeditor5/src/core';
import CodeEditing from './code/codeediting';
import CodeUI from './code/codeui';

import '../theme/code.css';

/**
 * The code feature.
 *
 * For a detailed overview check the {@glink features/basic-styles Basic styles feature} guide
 * and the {@glink api/basic-styles package page}.
 *
 * This is a "glue" plugin which loads the {@link module:basic-styles/code/codeediting~CodeEditing code editing feature}
 * and {@link module:basic-styles/code/codeui~CodeUI code UI feature}.
 */
export default class Code extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ CodeEditing, CodeUI ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'Code' {
		return 'Code';
	}
}
