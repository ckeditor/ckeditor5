/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/version
 */

import CKEditorError from './ckeditorerror.js';

const version = '43.0.0';

export default version;

// The second argument is not a month. It is `monthIndex` and starts from `0`.
export const releaseDate = new Date( 2024, 7, 7 );

declare global {
	// eslint-disable-next-line no-var
	var CKEDITOR_VERSION: string;
}

/* istanbul ignore next -- @preserve */
if ( globalThis.CKEDITOR_VERSION ) {
	/**
	 * This error is thrown when, due to a mistake in the way CKEditor&nbsp;5 was installed,
	 * imported, or initialized, some of its modules were evaluated and executed twice.
	 * Duplicate modules inevitably lead to runtime errors and increased bundle size.
	 *
	 * # Check dependency versions
	 *
	 * First, make sure that you use the latest version of all CKEditor&nbsp;5 dependencies.
	 * Depending on the installation method you used, you should check the versions of the `ckeditor5`,
	 * `ckeditor5-premium-features`, or `@ckeditor/ckeditor5-<NAME>` packages. If you cannot update
	 * to the latest version, then make sure that all the CKEditor&nbsp;5 packages are installed
	 * in the exact same version.
	 *
	 * If you use third-party plugins, make sure to update them too. If they are not compatible
	 * with the version of CKEditor&nbsp;5 you use, you may need to downgrade CKEditor&nbsp;5 packages
	 * (which we do not recommend), ask the author of said plugin to upgrade the dependencies,
	 * or forking their project and update it yourself.
	 *
	 * # Check imports
	 *
	 * The next step is to look at how you import CKEditor&nbsp;5 into your project.
	 *
	 * **The {@glink updating/nim-migration/migration-to-new-installation-methods new installation methods}
	 * are designed to prevent module duplication, so if you are not using them yet, you should consider
	 * updating your project**. However, for backwards compatibility, a number of legacy installation methods
	 * are still supported, and mixing them can result in module duplication.
	 *
	 * These are the most common import methods of the CKEditor&nbsp;5 packages.
	 *
	 * - **NIM (New installation methods)** &ndash; Imports from the `ckeditor5` and `ckeditor5-premium-features` packages.
	 * - **Optimized build** for the new installation methods &ndash; Imports from the `@ckeditor/ckeditor5-<NAME>/dist/index.js`.
	 * - **Predefined builds** (legacy) &ndash; Imports from the `@ckeditor/ckeditor5-build-<NAME>` packages.
	 * - **Default imports** (legacy) &ndash; Imports from the `@ckeditor/ckeditor5-<NAME>` packages (default export).
	 * - **`src`** (legacy) &ndash; Imports from the `@ckeditor/ckeditor5-<NAME>/src/*`.
	 * - **DLL builds** (legacy) &ndash; Imports from the `ckeditor5/build/<NAME>` and `@ckeditor/ckeditor5-<NAME>/build/*`.
	 *
	 * The best way to avoid duplicate modules is to not mix these installation methods. For example, if you use imports
	 * specific to the optimized build, you should use them for all CKEditor&nbsp;5 packages. In addition, since
	 * the Predefined and DLL builds already include the core of the editor, they cannot be used with other types of imports.
	 *
	 * This is a matrix showing which installation methods are compatible with each other:
	 *
	 * |                  | NIM | Optimized build | Predefined builds | Default imports | `src` | DLL builds |
	 * |------------------|-----|-----------------|-------------------|-----------------|-------|------------|
	 * | NIM              | ✅  | ✅              | ❌                | ❌              | ❌    | ❌         |
	 * | Optimized builds | ✅  | ✅              | ❌                | ❌              | ❌    | ❌         |
	 * | Predefined build | ❌  | ❌              | ✅                | ❌              | ❌    | ❌         |
	 * | Default imports  | ❌  | ❌              | ❌                | ✅              | ✅    | ❌         |
	 * | `src`            | ❌  | ❌              | ❌                | ✅              | ✅    | ❌         |
	 * | DLL builds       | ❌  | ❌              | ❌                | ❌              | ❌    | ✅         |
	 *
	 * If you use any third-party plugins, then make sure the way you import them is compatible with
	 * the way you import CKEditor&nbsp;5.
	 *
	 * <details>
	 * <summary>New installation methods and optimized builds</summary>
	 *
	 * If you are using the {@glink updating/nim-migration/migration-to-new-installation-methods new installation methods},
	 * you should only import code from the `ckeditor5` and `ckeditor5-premium-features` packages.
	 * Do not import code from the `@ckeditor/ckeditor5-<NAME>` packages unless you follow
	 * the {@glink getting-started/setup/optimizing-build-size Optimizing build size} guide and the imports from
	 * the `@ckeditor/ckeditor5-<NAME>` packages end with `/dist/index.js`.
	 *
	 * If you are using a CDN, make sure that some files are not included twice in your project.
	 *
	 * Examples:
	 *
	 * ```js
	 * import { ClassicEditor, Highlight } from 'ckeditor5'; // ✅
	 * import { Highlight } from '@ckeditor/ckeditor5-highlight/dist/index.js'; // ✅
	 * import Highlight from '@ckeditor/ckeditor5-highlight/src/highlight.js'; // ❌
	 * import { Highlight } from '@ckeditor/ckeditor5-highlight'; // ❌
	 * import '@ckeditor/ckeditor5-highlight/build/highlight.js'; // ❌
	 * ```
	 * </details>
	 *
	 * <details>
	 * <summary>(Legacy) Predefined builds</summary>
	 *
	 * If you are using the {@glink getting-started/legacy/installation-methods/predefined-builds Predefined builds},
	 * you cannot import any additional plugins. This is because the predefined builds already include the editor core
	 * and selected plugins. Importing additional plugins will cause some modules to be bundled and loaded twice.
	 *
	 * Examples:
	 *
	 * ```js
	 * import ClassicEditor from '@ckeditor/ckeditor5-build-classic'; // ✅
	 * import { Highlight } from 'ckeditor5'; // ❌
	 * import { Highlight } from '@ckeditor/ckeditor5-highlight/dist/index.js'; // ❌
	 * import { Highlight } from '@ckeditor/ckeditor5-highlight'; // ❌
	 * import Highlight from '@ckeditor/ckeditor5-highlight/src/highlight'; // ❌
	 * import '@ckeditor/ckeditor5-highlight/build/highlight'; // ❌
	 * ```
	 *
	 * If you are missing some features from the
	 * {@glink getting-started/legacy/installation-methods/predefined-builds#plugins-included-in-the-predefined-builds list of plugins},
	 * you should switch to the {@glink updating/nim-migration/migration-to-new-installation-methods new installation methods}
	 * which do not have this limitation.
	 * If you cannot migrate to the new installation methods, you can try the
	 * {@glink getting-started/legacy/installation-methods/predefined-builds#superbuild superbuild} instead,
	 * which contains all the editor features.
	 * </details>
	 *
	 * <details>
	 * <summary>(Legacy) Default imports and `src` imports</summary>
	 *
	 * If you are using the {@glink getting-started/legacy/installation-methods/quick-start-other legacy customized installation}
	 * method, you should only import code from the `@ckeditor/ckeditor5-<NAME>` packages. While it is possible to import code from
	 * the `@ckeditor/ckeditor5-<NAME>/src/*` files, it is not recommended as it can make migration to the new installation
	 * methods more difficult.
	 *
	 * If you use this installation method, you should not import code from the `ckeditor5`, `ckeditor5-premium-features`,
	 * or `@ckeditor/ckeditor5-build-<NAME>` packages.
	 *
	 * Examples:
	 *
	 * ```js
	 * import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic'; // ✅
	 * import { Highlight } from '@ckeditor/ckeditor5-highlight'; // ✅
	 * import Highlight from '@ckeditor/ckeditor5-highlight/src/highlight.js'; // ✅ (not recommended)
	 * import { Highlight } from 'ckeditor5'; // ❌
	 * import { Highlight } from '@ckeditor/ckeditor5-highlight/dist/index.js'; // ❌
	 * import '@ckeditor/ckeditor5-highlight/build/highlight'; // ❌
	 * ```
	 * </details>
	 *
	 * <details>
	 * <summary>(Legacy) DLL builds</summary>
	 *
	 * If you are using the {@glink getting-started/legacy/advanced/alternative-setups/dll-builds legacy DLL builds},
	 * you should not import any non-DLL modules.
	 *
	 * Examples:
	 *
	 * ```js
	 * import 'ckeditor5/build/ckeditor5-dll.js';// ✅
	 * import '@ckeditor/ckeditor5-editor-classic/build/editor-classic.js';// ✅
	 * import '@ckeditor/ckeditor5-highlight/build/highlight.js';// ✅
	 * import { Highlight } from 'ckeditor5'; // ❌
	 * import { Highlight } from '@ckeditor/ckeditor5-highlight/dist/index.js'; // ❌
	 * import { Highlight } from '@ckeditor/ckeditor5-highlight'; // ❌
	 * import Highlight from '@ckeditor/ckeditor5-highlight/src/highlight.js'; // ❌
	 * ```
	 * </details>
	 *
	 * # Reinstall `node_modules`
	 *
	 * Usually, npm and other package managers deduplicates all packages so, for example, `ckeditor5` is only installed once
	 * in `node_modules/`. However, it is known to fail to do so from time to time.
	 *
	 * To rule out this possibility, you can try the following:
	 *
	 * 1. Remove the `node_modules` directory.
	 * 2. Remove the `package-lock.json`, `yarn.lock`, or `pnpm-lock.yaml` files (depending on the package manager used).
	 * 3. Run `npm install` to reinstall all packages.
	 * 4. Run `npm ls` to check how many times packages like `@ckeditor/ckeditor5-core` are installed.
	 * If they are installed more than once, verify which package causes that.
	 *
	 * @error ckeditor-duplicated-modules
	 */
	throw new CKEditorError(
		'ckeditor-duplicated-modules',
		null
	);
} else {
	globalThis.CKEDITOR_VERSION = version;
}
