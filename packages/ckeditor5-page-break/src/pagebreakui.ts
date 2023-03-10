/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module page-break/pagebreakui
 */

import { Plugin } from 'ckeditor5/src/core';
import { ButtonView } from 'ckeditor5/src/ui';

import pageBreakIcon from '../theme/icons/pagebreak.svg';

/**
 * The page break UI plugin.
 */
export default class PageBreakUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'PageBreakUI' {
		return 'PageBreakUI';
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const t = editor.t;

		// Add pageBreak button to feature components.
		editor.ui.componentFactory.add( 'pageBreak', locale => {
			const command = editor.commands.get( 'pageBreak' )!;
			const view = new ButtonView( locale );

			view.set( {
				label: t( 'Page break' ),
				icon: pageBreakIcon,
				tooltip: true
			} );

			view.bind( 'isEnabled' ).to( command, 'isEnabled' );

			// Execute command.
			this.listenTo( view, 'execute', () => {
				editor.execute( 'pageBreak' );
				editor.editing.view.focus();
			} );

			return view;
		} );
	}
}
