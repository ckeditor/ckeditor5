/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module style
 */

export { Style } from './style.js';
export { StyleEditing } from './styleediting.js';
export { StyleUI } from './styleui.js';
export { StyleUtils } from './styleutils.js';
export { StyleCommand } from './stylecommand.js';

export type { StyleConfig, StyleDefinition } from './styleconfig.js';

export { StyleGridButtonView as _StyleGridButtonView } from './ui/stylegridbuttonview.js';
export { StyleGridView as _StyleGridView } from './ui/stylegridview.js';
export { StyleGroupView as _StyleGroupView } from './ui/stylegroupview.js';
export { StylePanelView as _StylePanelView } from './ui/stylepanelview.js';

import './augmentation.js';
