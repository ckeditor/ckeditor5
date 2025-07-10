/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { mapper } from '../utils/logger.mjs';

/**
 * Validates that command classes are exported as values, not types.
 * This prevents regressions related to #18583 where command classes were exported as types.
 */
export function validateCommandExports( library ) {
	const errors = [];

	for ( const pkg of library.packages.values() ) {
		// Only check the index module!
		const module = pkg.index;

		if ( !module ) {
			continue;
		}

		for ( const exportItem of module.exports ) {
			if ( exportItem.exportKind === 'type' && exportItem.references ) {
				if ( hasCommandClassReference( exportItem.references ) ) {
					errors.push( {
						...mapper.mapItemsViolatingPolicies( pkg, module, exportItem ),
						'Action': 'Command class should be exported as value'
					} );
				}
			}
		}
	}

	return errors;
}

function hasCommandClassReference( ref, visited = new Set() ) {
	if ( !ref ) {
		return false;
	}

	if ( Array.isArray( ref ) ) {
		return ref.some( r => hasCommandClassReference( r, visited ) );
	}

	if ( visited.has( ref ) ) {
		return false;
	}

	visited.add( ref );

	if ( ref.isCommandClass ) {
		return true;
	}

	if ( ref.references ) {
		return hasCommandClassReference( ref.references, visited );
	}

	return false;
}
