/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

export function markAsPublic( item ) {
	// Already marked as public or marked as internal.
	if ( item.isPublicTree || item.internal ) {
		return;
	}

	item.isPublicTree = true;

	markReferencesAsPublic( item );
}

export function markReferencesAsPublic( item ) {
	if ( item.references ) {
		for ( const reference of item.references ) {
			markAsPublic( reference );
		}
	}
}
