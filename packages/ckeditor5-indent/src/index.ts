/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module indent
 */

export { Indent } from './indent.js';
export { IndentEditing } from './indentediting.js';
export { IndentUI } from './indentui.js';
export { IndentBlock } from './indentblock.js';
export { IndentBlockCommand } from './indentblockcommand.js';

export type { IndentBlockConfig } from './indentconfig.js';

export type { IndentBehavior } from './indentcommandbehavior/indentbehavior.js';
export { IndentUsingClasses as _IndentUsingClasses } from './indentcommandbehavior/indentusingclasses.js';
export { IndentUsingOffset as _IndentUsingOffset } from './indentcommandbehavior/indentusingoffset.js';

import './augmentation.js';
