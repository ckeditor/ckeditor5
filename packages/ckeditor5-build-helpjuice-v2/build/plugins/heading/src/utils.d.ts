/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module heading/utils
 */
import type { Editor } from 'ckeditor5/src/core';
import type { HeadingOption } from './headingconfig';
/**
 * Returns heading options as defined in `config.heading.options` but processed to consider
 * the editor localization, i.e. to display {@link module:heading/headingconfig~HeadingOption}
 * in the correct language.
 *
 * Note: The reason behind this method is that there is no way to use {@link module:utils/locale~Locale#t}
 * when the user configuration is defined because the editor does not exist yet.
 */
export declare function getLocalizedOptions(editor: Editor): Array<HeadingOption>;
