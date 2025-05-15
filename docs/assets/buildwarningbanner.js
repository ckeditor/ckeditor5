/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

// Display a warning banner when browsing nightly documentation build or legacy guides. Source parameter for maintenance of 404 redirs.
if ( window.location.host === 'ckeditor5.github.io' ) {
	const stableUrl = window.location.href.replace( 'https://ckeditor5.github.io/docs/nightly', 'https://ckeditor.com/docs' );

	window.umberto.showWarningBanner(
		`Nightly documentation ahead. Switch to the <a href="${ stableUrl }?source=nightly">stable editor documentation</a>.`
	);
} else if ( window.location.href.includes( '/legacy/' ) ) {
	window.umberto.showWarningBanner( 'You are reading the legacy documentation.' );
}
