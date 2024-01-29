/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type { Locale, PositioningFunction } from '@ckeditor/ckeditor5-utils';
import DropdownView from '../dropdown/dropdownview.js';
import type MenuBarButtonView from './menubarbuttonview.js';
import type DropdownPanelView from '../dropdown/dropdownpanelview.js';

const NESTED_PANEL_OFFSET = 5;

export default class MenuBarMenuView extends DropdownView {
	public parentMenuView?: MenuBarMenuView;

	constructor(
		locale: Locale | undefined,
		buttonView: MenuBarButtonView,
		panelView: DropdownPanelView,
		parentMenuView?: MenuBarMenuView
	) {
		super( locale, buttonView, panelView );

		this.class = 'ck-menu-bar__menu';

		this.parentMenuView = parentMenuView;
	}

	protected override get _panelPositions(): Array<PositioningFunction> {
		if ( this.parentMenuView ) {
			const { west, east } = MenuBarMenuView.defaultNestedPanelPositions;

			if ( this.locale!.uiLanguageDirection !== 'rtl' ) {
				return [ west ];
			} else {
				return [ east ];
			}
		} else {
			return super._panelPositions;
		}
	}

	public static defaultNestedPanelPositions: Record<string, PositioningFunction> = {
		west: buttonRect => {
			return {
				top: buttonRect.top,
				left: buttonRect.right - NESTED_PANEL_OFFSET,
				name: 'w'
			};
		},
		east: ( buttonRect, panelRect ) => {
			return {
				top: buttonRect.top,
				left: buttonRect.left - panelRect.width + NESTED_PANEL_OFFSET,
				name: 'e'
			};
		}
	};
}
