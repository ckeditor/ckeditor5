/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module list/listproperties/listpropertiesutils
 */

import { Plugin } from 'ckeditor5/src/core.js';
import {
	getAllSupportedStyleTypes,
	getListStyleTypeFromTypeAttribute,
	getListTypeFromListStyleType,
	getTypeAttributeFromListStyleType
} from './utils/style.js';

/**
 * A set of helpers related to document lists.
 */
export default class ListPropertiesUtils extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ListPropertiesUtils' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * Gets all the style types supported by given list type.
	 */
	public getAllSupportedStyleTypes(): Array<string> {
		return getAllSupportedStyleTypes();
	}

	/**
	 * Checks whether the given list-style-type is supported by numbered or bulleted list.
	 */
	public getListTypeFromListStyleType( listStyleType: string ): 'bulleted' | 'numbered' | null {
		return getListTypeFromListStyleType( listStyleType );
	}

	/**
	 * Converts `type` attribute of `<ul>` or `<ol>` elements to `list-style-type` equivalent.
	 */
	public getListStyleTypeFromTypeAttribute( value: string ): string | null {
		return getListStyleTypeFromTypeAttribute( value );
	}

	/**
	 * Converts `list-style-type` style to `type` attribute of `<ul>` or `<ol>` elements.
	 */
	public getTypeAttributeFromListStyleType( value: string ): string | null {
		return getTypeAttributeFromListStyleType( value );
	}
}
