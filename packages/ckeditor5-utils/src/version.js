/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/version
 */

/* globals window, global */

import CKEditorError from './ckeditorerror';

const version = '19.1.1';

/* istanbul ignore next */
const windowOrGlobal = typeof window === 'object' ? window : global;

/* istanbul ignore next */
if ( windowOrGlobal.CKEDITOR_VERSION ) {
	/**
	 * This error is thrown when due to a mistake in how CKEditor 5 was installed or initialized, some
	 * of its modules were duplicated (evaluated and executed twice). Module duplication leads to inevitable runtime
	 * errors.
	 *
	 * There are many situations in which some modules can be loaded twice. In the worst case scenario,
	 * you may need to check your project for each of these issues and fix them all.
	 *
	 * # Trying to add a plugin to an existing build
	 *
	 * If you import an existing CKEditor 5 build and a plugin like this:
	 *
	 *		import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
	 *		import Highlight from '@ckeditor/ckeditor5-highlight/src/highlight';
	 *
	 * Then your project loads some CKEditor 5 packages twice. How does it happen?
	 *
	 * The build package contains a file which is already compiled with webpack. This means
	 * that it contains all the necessary code from e.g. `@ckeditor/ckeditor5-engine` and `@ckeditor/ckeditor5-utils`.
	 *
	 * However, the `Highlight` plugin imports some of the modules from these packages, too. If you ask webpack to
	 * build such a project, you will end up with the modules being included (and run) twice &mdash; first, because they are
	 * included inside the build package, and second, because they are required by the `Highlight` plugin.
	 *
	 * Therefore, **you must never add plugins to an existing build** unless your plugin has no dependencies.
	 *
	 * Adding plugins to a build is done by taking the source version of this build (so, before it was built with webpack)
	 * and adding plugins there. In this situation, webpack will know that it only needs to load each plugin once.
	 *
	 * Read more in the {@glink builds/guides/integration/installing-plugins "Installing plugins"} guide.
	 *
	 * # Confused an editor build with an editor implementation
	 *
	 * This scenario is very similar to the previous one, but has a different origin.
	 *
	 * Let's assume that you wanted to use CKEditor 5 from source, as explained in the
	 * {@glink builds/guides/integration/advanced-setup#scenario-2-building-from-source "Building from source"} section
	 * or in the {@glink framework/guides/quick-start "Quick start"} guide of CKEditor 5 Framework.
	 *
	 * The correct way to do so is to import an editor and plugins and run them together like this:
	 *
	 *		import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
	 *		import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
	 *		import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
	 *		import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
	 *		import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
	 *
	 *		ClassicEditor
	 *			.create( document.querySelector( '#editor' ), {
	 *				plugins: [ Essentials, Paragraph, Bold, Italic ],
	 *				toolbar: [ 'bold', 'italic' ]
	 *			} )
	 *			.then( editor => {
	 *				console.log( 'Editor was initialized', editor );
	 *			} )
	 *			.catch( error => {
	 *				console.error( error.stack );
	 *			} );
	 *
	 * However, you might have mistakenly imported a build instead of the source `ClassicEditor`. In this case
	 * your imports will look like this:
	 *
	 *		import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
	 *		import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
	 *		import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
	 *		import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
	 *		import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
	 *
	 * This creates the same situation as in the previous section because you use a build together with source plugins.
	 *
	 * Remember: `@ckeditor/ckeditor5-build-*` packages contain editor builds and `@ckeditor/ckeditor5-editor-*` contain source editors.
	 *
	 * # Loading two or more builds on one page
	 *
	 * If you use CKEditor 5 builds, you might have loaded two (or more) `ckeditor.js` files on one web page.
	 * Check your web page for duplicated `<script>` elements or make sure your page builder/bundler includes CKEditor only once.
	 *
	 * If you want to use two different types of editors at once, see the
	 * {@glink builds/guides/integration/advanced-setup#scenario-3-using-two-different-editors "Using two different editors"}
	 * section.
	 *
	 * # Using outdated packages
	 *
	 * Building CKEditor 5 from source requires using multiple npm packages. These packages have their dependencies
	 * to other packages. If you use the latest version of, for example, `@ckeditor/ckeditor5-editor-classic` with
	 * an outdated version of `@ckeditor/ckeditor5-image`, npm or yarn will need to install two different versions of
	 * `@ckeditor/ckeditor5-core` because `@ckeditor/ckeditor5-editor-classic` and `@ckeditor/ckeditor5-image` may require
	 * different versions of the core package.
	 *
	 * The solution to this issue is to update all packages to their latest version. We recommend
	 * using tools like [`node-check-updates`](https://www.npmjs.com/package/npm-check-updates) which simplify this process.
	 *
	 * # Conflicting version of dependencies
	 *
	 * This is a special case of the previous scenario. If you use CKEditor 5 with some third-party plugins,
	 * it may happen that even if you use the latest versions of the official packages and the latest version of
	 * these third-party packages, there will be a conflict between some of their dependencies.
	 *
	 * Such a problem can be resolved by either downgrading CKEditor 5 packages (which we do not recommend) or
	 * asking the author of the third-party package to upgrade its depdendencies (or forking their project and doing this yourself).
	 *
	 * **Note:** All official CKEditor 5 packages (excluding integrations and `ckeditor5-dev-*` packages) are released in the
	 * same major version. This is &mdash; in the `x.y.z`, the `x` is the same for all packages. This is the simplest way to check
	 * whether you use packages coming from the same CKEditor 5 version. You can read more about versioning in the
	 * {@glink framework/guides/support/versioning-policy Versioning policy} guide.
	 *
	 * # Packages were duplicated in `node_modules`
	 *
	 * In some situations, especially when calling `npm install` multiple times, it may happen
	 * that npm will not correctly "deduplicate" packages.
	 *
	 * Normally, npm deduplicates all packages so, for example, `@ckeditor/ckeditor5-core` is installed only once in `node_modules/`.
	 * However, it is known to fail to do so from time to time.
	 *
	 * We recommend checking if any of the steps listed below help:
	 *
	 * * `rm -rf node_modules && npm install` to make sure you have a clean `node_modules/` directory. This step
	 * is known to help in most cases.
	 * * If you use `yarn.lock` or `package-lock.json`, remove it before `npm install`.
	 * * Check whether all CKEditor 5 packages are up to date and reinstall them
	 * if you changed anything (`rm -rf node_modules && npm install`).
	 *
	 * If all packages are correct and compatible with each other, the steps above are known to help. If not, you may
	 * try to check with `npm ls` how many times packages like `@ckeditor/ckeditor5-core`, `@ckeditor/ckeditor5-engine` and
	 *`@ckeditor/ckeditor5-utils` are installed. If more than once, verify which package causes that.
	 *
	 * @error ckeditor-duplicated-modules
	 */
	throw new CKEditorError(
		'ckeditor-duplicated-modules: Some CKEditor 5 modules are duplicated.',
		null
	);
} else {
	windowOrGlobal.CKEDITOR_VERSION = version;
}
