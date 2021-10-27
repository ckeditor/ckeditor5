/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window */

// Display a warning banner when browsing nightly documentation build. Source parameter for maintenance of 404 redirs.
if ( window.location.host === 'ckeditor5.github.io' ) {
	const stableUrl = window.location.href.replace( 'https://ckeditor5.github.io/docs/nightly', 'https://ckeditor.com/docs' );

	window.umberto.showWarningBanner(
		`Nightly documentation ahead. Switch to the <a href="${ stableUrl }?source=nightly">stable editor documentation</a>.`
	);
}
