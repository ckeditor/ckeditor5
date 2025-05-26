/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * Hello there! 👋
 *
 * You might be wondering why this script exists. The reason is that in the old installation methods, we
 * allowed customizing icons by overriding individual SVG imports (see this guide for more information
 * https://ckeditor.com/docs/ckeditor5/latest/framework/how-tos.html#how-to-customize-the-ckeditor-5-icons).
 *
 * That's why from the `src/index.ts` file of this package, we export all SVG icons from the `theme/icons`
 * folder. This unfortunately causes TypeScript to generate typings like this:
 *
 * ```ts
 * export { default as IconMyIcon } from '../theme/icons/my-icon.svg';
 * ```
 *
 * This causes issues in projects that do not have typings for SVG files. To fix this, we replace these
 * typings with a simple declaration like this:
 *
 * ```ts
 * export const IconMyIcon: string;
 * ```
 *
 * Once we drop support for the old installation methods, we can consider one of the following options:
 *
 * - storing the icons in the `src/index.ts` file directly as strings;
 * - generating types from the result of the build process, which already transforms icons into strings;
 * - automagically generating the `src/index.ts` file based on the files in the `theme/icons` folder;
 */

import fs from 'fs';
import upath from 'upath';

const path = upath.join( process.cwd(), 'src', 'index.d.ts' );
const content = fs.readFileSync( path, 'utf8' );

const updatedContent = content.replaceAll(
	/^export { default as (.*) } from '(.*)';$/gm,
	'export const $1: string;'
);

fs.writeFileSync( path, updatedContent, 'utf8' );
