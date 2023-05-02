/*
 * Normalizes content styles for the PlainTableOutput feature:
 * - Changes the selector from `.table table` to `table`, as PlainTableOutput doesn't set
 *   the .table class on the <table> element which leads to style loss.
 * - Removes `width: 100%` from the table element to prevent taking whole available space.
 * - Removes `height: 100%` from the table element to prevent expanding the table.
 */
export default function normalizeStylesForPlainTableOutput( cssText ) {
	const shouldNormalizeTableSelector = cssText.includes( '.table table' );

	if ( shouldNormalizeTableSelector ) {
		return cssText
			.replaceAll( '.table table', '.table' )
			.replace( 'width: 100%;', '' );
	}

	return cssText;
}
