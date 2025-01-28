/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module heading/heading
 */

import { Plugin } from 'ckeditor5/src/core.js';

import HeadingEditing from './headingediting.js';
import HeadingUI from './headingui.js';

import '../theme/heading.css';

/**
 * The headings feature.
 *
 * For a detailed overview, check the {@glink features/headings Headings feature} guide
 * and the {@glink api/heading package page}.
 *
 * This is a "glue" plugin which loads the {@link module:heading/headingediting~HeadingEditing heading editing feature}
 * and {@link module:heading/headingui~HeadingUI heading UI feature}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Heading extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ HeadingEditing, HeadingUI ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'Heading' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}
}
