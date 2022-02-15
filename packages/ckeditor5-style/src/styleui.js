/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module TODO
 */

import { Plugin } from 'ckeditor5/src/core';
import { createDropdown } from 'ckeditor5/src/ui';

import StylePanelView from './ui/stylepanelview';
import { normalizeConfig } from './utils';

/**
 * TODO
 *
 * @extends module:core/plugin~Plugin
 */
export default class StyleUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'StyleUI';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		// TODO: Config normalization.
		// * TODO: Translations???
		// TODO: Docs.
		const styleDefinitions = normalizeConfig( editor.config.get( 'style.definitions' ) );

		// Add bold button to feature components.
		editor.ui.componentFactory.add( 'styleDropdown', locale => {
			const t = locale.t;
			const dropdown = createDropdown( locale );
			const panelView = new StylePanelView( locale, styleDefinitions );
			const styleCommand = editor.commands.get( 'style' );

			// WIP
			dropdown.isOpen = true;

			dropdown.bind( 'isEnabled' ).to( styleCommand );

			dropdown.panelView.children.add( panelView );

			dropdown.buttonView.set( {
				withText: true
			} );

			dropdown.buttonView.bind( 'label' ).to( styleCommand, 'value', value => {
				if ( value.length > 1 ) {
					return t( 'Multiple styles' );
				} else if ( value.length === 1 ) {
					return value[ 0 ];
				} else {
					return t( 'Styles' );
				}
			} );

			dropdown.bind( 'class' ).to( styleCommand, 'value', value => {
				const classes = [
					'ck-style-dropdown'
				];

				if ( value.length > 1 ) {
					classes.push( 'ck-style-dropdown_multiple-active' );
				}

				return classes.join( ' ' );
			} );

			// This will close dropdown when a style is selected.
			panelView.delegate( 'execute' ).to( dropdown );

			panelView.on( 'execute', evt => {
				editor.execute( 'style', evt.source.styleDefinition );
			} );

			panelView.bind( 'activeStyles' ).to( styleCommand, 'value' );
			panelView.bind( 'enabledStyles' ).to( styleCommand, 'enabledStyles' );

			return dropdown;
		} );
	}
}
