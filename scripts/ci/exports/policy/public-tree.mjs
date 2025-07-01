/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { markAsPublic, markReferencesAsPublic } from './mark-as-public.mjs';

export function publicTree( library ) {
	// Mark public tree accessible from package index and exports with the re-exported name.
	for ( const pkg of library.packages.values() ) {
		// First mark all augmentations as public since they're used in re-exported interfaces.
		// Only references to augmentations are marked as public, otherwise they'd be flagged as non-exported.
		// And they can't be exported, because this is only an augmentation, not original declaration.
		for ( const module of pkg.modules ) {
			for ( const augmentation of module.augmentations ) {
				markReferencesAsPublic( augmentation );
			}
		}

		// Then process regular exports.
		for ( const exportItem of pkg.index.exports ) {
			markAsPublic( exportItem );
		}
	}
}
