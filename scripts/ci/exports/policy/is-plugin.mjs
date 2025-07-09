/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { markAsPublic } from './mark-as-public.mjs';

export function isPluginClass( library ) {
	for ( const pkg of library.packages.values() ) {
		for ( const module of pkg.modules ) {
			for ( const declaration of module.declarations ) {
				markAsPluginClass( declaration );
			}
		}
	}
}

function markAsPluginClass( declaration ) {
	if ( declaration.internal ) {
		return;
	}

	if (
		declaration.type === 'class' &&
		declaration.baseClasses.some( baseClass =>
			baseClass === 'Plugin' || baseClass === 'ContextPlugin'
		)
	) {
		declaration.isPluginClass = true;

		markAsPublic( declaration );
	}
}
