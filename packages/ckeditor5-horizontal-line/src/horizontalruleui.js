/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module horizontal-rule/horizontalruleui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import horizontalRuleIcon from '../theme/icons/horizontalrule.svg';

/**
 * @extends module:core/plugin~Plugin
 */
export default class HorizontalRuleUI extends Plugin {
	init() {
		const editor = this.editor;
		const t = editor.t;

		// Add horizontalRule button to feature components.
		editor.ui.componentFactory.add( 'horizontalRule', locale => {
			const command = editor.commands.get( 'horizontalRule' );
			const view = new ButtonView( locale );

			view.set( {
				label: t( 'Horizontal rule' ),
				icon: horizontalRuleIcon,
				tooltip: true,
				isToggleable: true
			} );

			view.bind( 'isEnabled' ).to( command, 'isEnabled' );

			// Execute command.
			this.listenTo( view, 'execute', () => editor.execute( 'horizontalRule' ) );

			return view;
		} );
	}
}
