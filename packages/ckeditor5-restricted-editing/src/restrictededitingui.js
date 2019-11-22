/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module restricted-editing/restrictededitingui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { createDropdown, addListToDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import Model from '@ckeditor/ckeditor5-ui/src/model';
import lockIcon from '../theme/icons/contentlock.svg';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';

/**
 * @extends module:core/plugin~Plugin
 */
export default class RestrictedEditingUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'RestrictedEditingUI';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;

		editor.ui.componentFactory.add( 'restrictedEditing', locale => {
			const dropdownView = createDropdown( locale );
			const listItems = new Collection();

			listItems.add( {
				type: 'button',
				model: new Model( {
					commandName: 'TODO',
					label: t( 'Previous editable region' ),
					withText: true
				} )
			} );

			listItems.add( {
				type: 'button',
				model: new Model( {
					commandName: 'TODO',
					label: t( 'Next editable region' ),
					withText: true
				} )
			} );

			addListToDropdown( dropdownView, listItems );

			dropdownView.buttonView.set( {
				label: t( 'Browse editable regions' ),
				icon: lockIcon,
				tooltip: true,
				isEnabled: true,
				isOn: false
			} );

			return dropdownView;
		} );
	}
}
