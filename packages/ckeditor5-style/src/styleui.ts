/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module style/styleui
 */

import { Plugin } from 'ckeditor5/src/core';
import { createDropdown } from 'ckeditor5/src/ui';
import type { DataSchema } from '@ckeditor/ckeditor5-html-support';

import StylePanelView from './ui/stylepanelview';
import StyleUtils from './styleutils';
import type StyleCommand from './stylecommand';

import '../theme/style.css';

/**
 * The UI plugin of the style feature .
 *
 * It registers the `'style'` UI dropdown in the editor's {@link module:ui/componentfactory~ComponentFactory component factory}
 * that displays a grid of styles and allows changing styles of the content.
 */
export default class StyleUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'StyleUI' {
		return 'StyleUI';
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ StyleUtils ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const dataSchema: DataSchema = editor.plugins.get( 'DataSchema' );
		const styleUtils: StyleUtils = editor.plugins.get( 'StyleUtils' );
		const styleDefinitions = editor.config.get( 'style.definitions' );
		const normalizedStyleDefinitions = styleUtils.normalizeConfig( dataSchema, styleDefinitions );

		// Add the dropdown to the component factory.
		editor.ui.componentFactory.add( 'style', locale => {
			const t = locale.t;
			const dropdown = createDropdown( locale );
			const styleCommand: StyleCommand = editor.commands.get( 'style' )!;

			dropdown.once( 'change:isOpen', () => {
				const panelView = new StylePanelView( locale, normalizedStyleDefinitions );

				// Put the styles panel is the dropdown.
				dropdown.panelView.children.add( panelView );

				// Close the dropdown when a style is selected in the styles panel.
				panelView.delegate( 'execute' ).to( dropdown );

				// Bind the state of the styles panel to the command.
				panelView.bind( 'activeStyles' ).to( styleCommand, 'value' );
				panelView.bind( 'enabledStyles' ).to( styleCommand, 'enabledStyles' );
			} );

			// The entire dropdown will be disabled together with the command (e.g. when the editor goes read-only).
			dropdown.bind( 'isEnabled' ).to( styleCommand );

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

			// Execute the command when a style is selected in the styles panel.
			// Also focus the editable after executing the command.
			// It overrides a default behaviour where the focus is moved to the dropdown button (#12125).
			dropdown.on( 'execute', evt => {
				editor.execute( 'style', { styleName: ( evt.source as any ).styleDefinition.name } );
				editor.editing.view.focus();
			} );

			return dropdown;
		} );
	}
}
