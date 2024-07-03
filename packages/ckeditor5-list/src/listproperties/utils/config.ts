/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { toArray } from 'ckeditor5/src/utils.js';
import { type ListPropertiesConfig } from '../../listconfig.js';
import { type ListType } from '../../list/listediting.js';

/**
* @module list/listproperties/utils/config
*/

/**
 * Normalizes {@link module:list/listconfig~ListPropertiesConfig} in the configuration of the list properties feature.
 * The structure of normalized list properties options looks as follows:
 *
 * ```ts
 * {
 * 	listTypes: [ 'bulleted', 'numbered' ],
 * 	startIndex: true,
 * 	reversed: true,
 * }
 * ```
 *
 * @param config The list properties {@link module:list/listconfig~ListPropertiesConfig config}.
 * @returns An object with normalized list properties options.
 */
export function getNormalizedConfig( config: ListPropertiesConfig ): NormalizedListPropertiesConfig {
	const { startIndex, reversed, styles } = config;
	const normalizedConfig = {
		listTypes: [ 'bulleted', 'numbered' ] as Array<ListType>,
		useAttribute: false,
		startIndex: startIndex || false,
		reversed: reversed || false
	};

	if ( styles === true ) {
		return normalizedConfig;
	}
	else if ( !styles ) {
		normalizedConfig.listTypes = [];
	}
	else if ( Array.isArray( styles ) || typeof styles == 'string' ) {
		normalizedConfig.listTypes = toArray( styles );
	}
	else {
		normalizedConfig.listTypes = styles.listTypes ?
			toArray( styles.listTypes ) :
			normalizedConfig.listTypes;

		normalizedConfig.useAttribute = !!styles.useAttribute;
	}

	return normalizedConfig;
}

/**
* Normanlized list properties config.
*/
export type NormalizedListPropertiesConfig = {
	listTypes: Array<ListType>;
	useAttribute: boolean;
	startIndex: boolean;
	reversed: boolean;
};
