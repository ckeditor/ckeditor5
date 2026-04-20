/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Declaration } from '../utils/declaration.mjs';
import { mapper } from '../utils/logger.mjs';

/**
 * Validates that class declarations are not re-exported from a package index as type-only exports.
 *
 * A type-only export (`export type { Foo }` or `export { type Foo }`) strips the class to its
 * structural type. TypeDoc then renders the class as an interface in the generated API docs, and
 * TypeScript consumers lose the ability to use it as a value (e.g., `instanceof`).
 *
 * Ambient `declare class` declarations are skipped — they have no runtime value and must be
 * exported as types.
 *
 * This rule generalizes the earlier Command/Plugin-specific checks introduced for #18583 to
 * cover all class exports (#18942).
 */
export function validateClassExports( library ) {
	const errors = [];

	for ( const pkg of library.packages.values() ) {
		// Only check the index module.
		const module = pkg.index;

		if ( !module ) {
			continue;
		}

		for ( const exportItem of module.exports ) {
			if ( exportItem.exportKind !== 'type' || !exportItem.references ) {
				continue;
			}

			if ( targetsClass( exportItem.references ) ) {
				errors.push( {
					...mapper.mapItemsViolatingPolicies( pkg, module, exportItem ),
					'Action': 'Class must be exported as value, not type'
				} );
			}
		}
	}

	return errors;
}

/**
 * Walks through re-export chains until the first `Declaration` is reached, and reports
 * whether that declaration is a concrete (non-ambient) class.
 *
 * It deliberately does NOT descend into a Declaration's own `references` — those reach into
 * type parameters, base classes, and referenced types, which would produce false positives for
 * interfaces and type aliases that happen to mention a class.
 */
function targetsClass( references, visited = new Set() ) {
	if ( !references ) {
		return false;
	}

	for ( const ref of references ) {
		if ( !ref || visited.has( ref ) ) {
			continue;
		}

		visited.add( ref );

		if ( ref instanceof Declaration ) {
			if ( ref.type === 'class' && !ref.ambient ) {
				return true;
			}

			// A non-class declaration terminates the walk — do not descend into its references.
			continue;
		}

		// Follow re-export / import chains through `Export` and `Import` objects.
		if ( ref.references && targetsClass( ref.references, visited ) ) {
			return true;
		}
	}

	return false;
}
