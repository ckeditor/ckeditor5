/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module heading/utils
 */

import type { Editor } from 'ckeditor5/src/core.js';

import type { HeadingOption } from './headingconfig.js';

/**
 * Returns heading options as defined in `config.heading.options` but processed to consider
 * the editor localization, i.e. to display {@link module:heading/headingconfig~HeadingOption}
 * in the correct language.
 *
 * Note: The reason behind this method is that there is no way to use {@link module:utils/locale~Locale#t}
 * when the user configuration is defined because the editor does not exist yet.
 */
export function getLocalizedOptions( editor: Editor ): Array<HeadingOption> {
	const t = editor.t;
	const localizedTitles: Record<string, string> = {
		'Paragraph': t( 'Paragraph' ),
		'Heading 1': t( 'Heading 1' ),
		'Heading 2': t( 'Heading 2' ),
		'Heading 3': t( 'Heading 3' ),
		'Heading 4': t( 'Heading 4' ),
		'Heading 5': t( 'Heading 5' ),
		'Heading 6': t( 'Heading 6' )
	};

	return editor.config.get( 'heading.options' )!.map( option => {
		const title = localizedTitles[ option.title ];

		if ( title && title != option.title ) {
			option.title = title;
		}

		return option;
	} );
}
