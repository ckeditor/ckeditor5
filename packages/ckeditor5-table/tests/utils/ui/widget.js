/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ViewSelection from '@ckeditor/ckeditor5-engine/src/view/selection';
import { getTableWidgetAncestor } from '../../../src/utils/ui/widget';

describe( 'table utils', () => {
	describe( 'widget', () => {
		describe( 'getTableWidgetAncestor()', () => {
			// See https://github.com/ckeditor/ckeditor5/issues/11972.
			it( 'should return null if view selection is empty', () => {
				const selection = new ViewSelection();

				expect( getTableWidgetAncestor( selection ) ).to.be.null;
			} );
		} );
	} );
} );
