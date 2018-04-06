/**
 * Returns heading options as defined in `config.heading.options` but processed to consider
 * editor localization, i.e. to display {@link module:heading/heading~HeadingOption}
 * in the correct language.
 *
 * Note: The reason behind this method is that there's no way to use {@link module:utils/locale~Locale#t}
 * when the user config is defined because the editor does not exist yet.
 *
 * @param {module:core/editor/editor~Editor} editor
 * @returns {Array.<module:heading/heading~HeadingOption>}.
 */
export function getLocalizedOptions( editor ) {
	const t = editor.t;
	const localizedTitles = {
		Paragraph: t( 'Paragraph' ),
		'Heading 1': t( 'Heading 1' ),
		'Heading 2': t( 'Heading 2' ),
		'Heading 3': t( 'Heading 3' )
	};

	return editor.config.get( 'heading.options' ).map( option => {
		const title = localizedTitles[ option.title ];

		if ( title && title != option.title ) {
			// Clone the option to avoid altering the original `config.heading.options`.
			option = Object.assign( {}, option, { title } );
		}

		return option;
	} );
}
