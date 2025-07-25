/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { mapper } from '../utils/logger.mjs';

/**
 * Validates that plugin classes are exported as values, not types.
 * This prevents regressions related to #18583 where plugin classes were exported as types.
 */
export function validatePluginExports( library ) {
	const errors = [];

	for ( const pkg of library.packages.values() ) {
		// Only check the index module!
		const module = pkg.index;

		if ( !module ) {
			continue;
		}

		for ( const exportItem of module.exports ) {
			if ( exportItem.exportKind === 'type' && exportItem.references ) {
				if ( hasPluginClassReference( exportItem.references ) ) {
					errors.push( {
						...mapper.mapItemsViolatingPolicies( pkg, module, exportItem ),
						'Action': 'Plugin class should be exported as value'
					} );
				}
			}
		}
	}

	return errors;
}

function hasPluginClassReference( ref, visited = new Set() ) {
	if ( !ref ) {
		return false;
	}

	if ( Array.isArray( ref ) ) {
		return ref.some( r => hasPluginClassReference( r, visited ) );
	}

	if ( visited.has( ref ) ) {
		return false;
	}

	visited.add( ref );

	if ( ref.isPluginClass ) {
		return true;
	}

	if ( ref.type !== 'class' ) {
		return false;
	}

	if ( ref.references ) {
		return hasPluginClassReference( ref.references, visited );
	}

	return false;
}
