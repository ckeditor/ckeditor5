/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/listproperties/utils/config
 */

import { toArray } from 'ckeditor5/src/utils.js';
import type { ListPropertiesConfig, ListPropertiesStyleListType } from '../../listconfig.js';

/**
 * Normalizes {@link module:list/listconfig~ListPropertiesConfig} in the configuration of the list properties feature.
 * The structure of normalized list properties options looks as follows:
 *
 * ```ts
 * {
 * 	styles: {
 * 		listTypes: [ 'bulleted', 'numbered' ],
 * 		useAttribute: false
 * 	},
 * 	startIndex: true,
 * 	reversed: true
 * }
 * ```
 *
 * @param config The list properties {@link module:list/listconfig~ListPropertiesConfig config}.
 * @returns An object with normalized list properties options.
 */
export function getNormalizedConfig( config: ListPropertiesConfig ): NormalizedListPropertiesConfig {
	const { startIndex, reversed, styles } = config;

	return {
		styles: getNormalizedStylesConfig( styles ),
		startIndex: startIndex || false,
		reversed: reversed || false
	};
}

/**
 * Normalizes styles in the configuration of the list properties feature.
 * The structure of normalized list properties options looks as follows:
 *
 * ```ts
 * {
 * 	listTypes: [ 'bulleted', 'numbered' ],
 * 	useAttribute: false
 * }
 * ```
 *
 * @param styles The list properties styles.
 * @returns An object with normalized list properties styles.
 */
function getNormalizedStylesConfig( styles: ListPropertiesConfig[ 'styles' ] ): NormalizedListPropertiesConfig[ 'styles' ] {
	const normalizedConfig = {
		listTypes: [ 'bulleted', 'numbered' ] as Array<ListPropertiesStyleListType>,
		useAttribute: false
	};

	if ( styles === true ) {
		return normalizedConfig;
	}

	if ( !styles ) {
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
* Normalized list properties config.
*/
export type NormalizedListPropertiesConfig = {
	styles: {
		listTypes: Array<ListPropertiesStyleListType>;
		useAttribute: boolean;
	};
	startIndex: boolean;
	reversed: boolean;
};
