/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ViewSelection from '@ckeditor/ckeditor5-engine/src/view/selection';
import { getTableWidgetAncestor } from '../../../src/utils/ui/widget';

describe( 'table utils', () => {
	describe( 'widget', () => {
		describe( 'getTableWidgetAncestor()', () => {
			// This can happen if `editor#event:ui` is fired too soon, i.e. before view is initialized.
			// This was happening for example when editor crashed. This error made debugging more difficult.
			// I am not sure if this could ever happen in normal circumstances (when editor works without errors).
			it( 'should return null if view selection is empty', () => {
				const selection = new ViewSelection();

				expect( getTableWidgetAncestor( selection ) ).to.be.null;
			} );
		} );
	} );
} );
