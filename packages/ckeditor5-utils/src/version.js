/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module utils/version
 */

/* globals window, global */

import log from './log';
import { version } from 'ckeditor5/package.json';

const windowOrGlobal = typeof window === 'object' ? window : global;

if ( windowOrGlobal.CKEDITOR_VERSION ) {
	/**
	 * This error is thrown when the `CKEDITOR_VERSION` global is being set more than once. This happens when in
	 * two scenarios described above.
	 *
	 * # Some packages were duplicated
	 *
	 * CKEditor 5 was built from source packages which were duplicated during installation via npm.
	 * Normally, npm deduplicates all packages so e.g. `@ckeditor/ckeditor5-core` is installed only once in `node_modules/`.
	 * However, subsequent `npm install` calls or conflicting version dependencies may cause npm to install some packages
	 * more than once. Furthermore, [npm in version 5+](https://github.com/npm/npm/issues/16991)
	 * is also known for randomly failing to deduplicate packages.
	 *
	 * We recommend checking if any of the below steps helps:
	 *
	 * * `rm -rf node_modules && npm install` to make sure you have a clean `node_modules/` – this step
	 * is known to help in majority of cases,
	 * * check whether all CKEditor 5 packages are up to date and reinstall them
	 * if you changed anything (`rm -rf node_modules && npm install`),
	 * * downgrade npm to version 4 if you use a newer version.
	 *
	 * If all packages are correct and compatible with each other the above steps are known to help. If not, you may
	 * try to check with `npm ls` how many times `@ckeditor/ckeditor5-core` is installed. If more than once, verify
	 * which package causes that.
	 *
	 * # Two+ builds are loaded
	 *
	 * If you use CKEditor 5 builds, you might have loaded two (or more) `ckeditor.js` files in one web page
	 * – check your web page for duplicated `<script>` elements or make sure your page builder/bundler includes CKEditor only once.
	 *
	 * @error ckeditor-version-collision
	 * @param {String} collidingVersion The version of the build which has already been (incorrectly) loaded.
	 * @param {String} version The version of the build which is supposed to be loaded.
	 */
	log.error( 'ckeditor-version-collision: The global CKEDITOR_VERSION constant has already been set.', {
		collidingVersion: windowOrGlobal.CKEDITOR_VERSION,
		version
	} );
} else {
	windowOrGlobal.CKEDITOR_VERSION = version;
}
