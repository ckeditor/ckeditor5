/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { markAsPublic } from './mark-as-public.mjs';

export function isEvent( library ) {
	for ( const module of library.modules ) {
		for ( const exportItem of module.exports ) {
			markAsEvent( exportItem );
		}
	}
}

function markAsEvent( item ) {
	if ( item.internal ) {
		return;
	}

	if ( item.type === 'event' ) {
		item.isEvent = true;

		markAsPublic( item );
	}
}
