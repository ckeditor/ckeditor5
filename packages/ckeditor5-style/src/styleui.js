/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module style/styleui
 */

import { Plugin } from 'ckeditor5/src/core';
import { createDropdown } from 'ckeditor5/src/ui';

import StylePanelView from './ui/stylepanelview';
import { normalizeConfig } from './utils';

import '../theme/style.css';

/**
 * The UI plugin of the style feature .
 *
 * It registers the `'style'` UI dropdown in the editor's {@link module:ui/componentfactory~ComponentFactory component factory}
 * that displays a grid of styles and allows changing styles of the content.
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
		const dataSchema = editor.plugins.get( 'DataSchema' );
		const normalizedStyleDefinitions = normalizeConfig( dataSchema, editor.config.get( 'style.definitions' ) );

		// Add the dropdown to the component factory.
		editor.ui.componentFactory.add( 'style', locale => {
			const t = locale.t;
			const dropdown = createDropdown( locale );
			const panelView = new StylePanelView( locale, normalizedStyleDefinitions );
			const styleCommand = editor.commands.get( 'style' );

			// The entire dropdown will be disabled together with the command (e.g. when the editor goes read-only).
			dropdown.bind( 'isEnabled' ).to( styleCommand );

			// Put the styles panel is the dropdown.
			dropdown.panelView.children.add( panelView );

			// This dropdown has no icon. It displays text label depending on the selection.
			dropdown.buttonView.withText = true;

			// The label of the dropdown is dynamic and depends on how many styles are active at a time.
			dropdown.buttonView.bind( 'label' ).to( styleCommand, 'value', value => {
				if ( value.length > 1 ) {
					return t( 'Multiple styles' );
				} else if ( value.length === 1 ) {
					return value[ 0 ];
				} else {
					return t( 'Styles' );
				}
			} );

			// The dropdown has a static CSS class for easy customization. There's another CSS class
			// that gets displayed when multiple styles are active at a time allowing visual customization of
			// the label.
			dropdown.bind( 'class' ).to( styleCommand, 'value', value => {
				const classes = [
					'ck-style-dropdown'
				];

				if ( value.length > 1 ) {
					classes.push( 'ck-style-dropdown_multiple-active' );
				}

				return classes.join( ' ' );
			} );

			// Close the dropdown when a style is selected in the styles panel.
			panelView.delegate( 'execute' ).to( dropdown );

			// Execute the command when a style is selected in the styles panel.
			panelView.on( 'execute', evt => {
				editor.execute( 'style', evt.source.styleDefinition.name );
			} );

			// Bind the state of the styles panel to the command.
			panelView.bind( 'activeStyles' ).to( styleCommand, 'value' );
			panelView.bind( 'enabledStyles' ).to( styleCommand, 'enabledStyles' );

			return dropdown;
		} );
	}
}
