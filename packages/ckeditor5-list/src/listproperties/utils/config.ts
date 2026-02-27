/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module list/listproperties/utils/config
 */

import { pick } from 'es-toolkit/compat';
import { toArray } from '@ckeditor/ckeditor5-utils';
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
 * @internal
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
	const normalizedConfig: NormalizedListPropertiesConfig[ 'styles' ] = {
		listTypes: [ 'bulleted', 'numbered' ],
		useAttribute: false,
		listStyleTypes: {
			numbered: [ 'decimal', 'decimal-leading-zero', 'lower-roman', 'upper-roman', 'lower-latin', 'upper-latin' ],
			bulleted: [ 'disc', 'circle', 'square' ]
		}
	};

	if ( styles === true ) {
		return normalizedConfig;
	}

	if ( !styles ) {
		normalizedConfig.listTypes = [];
		normalizedConfig.listStyleTypes = {};
	}
	else if ( Array.isArray( styles ) || typeof styles == 'string' ) {
		normalizedConfig.listTypes = toArray( styles );
		normalizedConfig.listStyleTypes = pick( normalizedConfig.listStyleTypes, normalizedConfig.listTypes );
	}
	else {
		normalizedConfig.listTypes = styles.listTypes ?
			toArray( styles.listTypes ) :
			normalizedConfig.listTypes;

		normalizedConfig.useAttribute = !!styles.useAttribute;

		if ( styles.listStyleTypes ) {
			normalizedConfig.listStyleTypes = styles.listStyleTypes;
		} else {
			normalizedConfig.listStyleTypes = pick( normalizedConfig.listStyleTypes, normalizedConfig.listTypes );
		}
	}

	return normalizedConfig;
}

/**
* Normalized list properties config.
*
* @internal
*/
export type NormalizedListPropertiesConfig = {
	styles: {
		listTypes: Array<ListPropertiesStyleListType>;
		listStyleTypes?: {
			numbered?: Array<string>;
			bulleted?: Array<string>;
		};
		useAttribute: boolean;
	};
	startIndex: boolean;
	reversed: boolean;
};
