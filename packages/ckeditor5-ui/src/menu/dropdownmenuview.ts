/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/menu/dropdownmenuview
 */

import { type PositioningFunction } from '@ckeditor/ckeditor5-utils';
import MenuWithButtonView from './menuwithbuttonview.js';
import { DropdownMenuPositions, MenuWithButtonBehaviors } from './utils.js';

export default class DropdownMenuView extends MenuWithButtonView {
	declare public menuPosition: 's' | 'se' | 'sw' | 'sme' | 'smw' | 'n' | 'ne' | 'nw' | 'nme' | 'nmw';

	public override render(): void {
		super.render();

		MenuWithButtonBehaviors.openAndFocusMenuOnArrowDownKey( this );

		MenuWithButtonBehaviors.closeOnClickOutside( this );
		MenuWithButtonBehaviors.closeOnMenuChildrenExecute( this );
		MenuWithButtonBehaviors.closeOnBlur( this );
		MenuWithButtonBehaviors.closeOnArrowLeftKey( this );
		MenuWithButtonBehaviors.closeOnEscKey( this );

		MenuWithButtonBehaviors.focusMenuContentsOnArrows( this );
		MenuWithButtonBehaviors.focusMenuButtonOnClose( this );
		MenuWithButtonBehaviors.focusMenuOnOpen( this );

		MenuWithButtonBehaviors.blockArrowRightKey( this );
		MenuWithButtonBehaviors.toggleOnButtonClick( this );
	}

	public override get panelPositions(): Array<PositioningFunction> {
		const {
			south, north,
			southEast, southWest,
			northEast, northWest,
			southMiddleEast, southMiddleWest,
			northMiddleEast, northMiddleWest
		} = DropdownMenuPositions;

		if ( this.locale!.uiLanguageDirection !== 'rtl' ) {
			return [
				southEast, southWest, southMiddleEast, southMiddleWest, south,
				northEast, northWest, northMiddleEast, northMiddleWest, north
			];
		} else {
			return [
				southWest, southEast, southMiddleWest, southMiddleEast, south,
				northWest, northEast, northMiddleWest, northMiddleEast, north
			];
		}
	}
}
