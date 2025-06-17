/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module alignment
 */

export { Alignment } from './alignment.js';
export { AlignmentEditing } from './alignmentediting.js';
export { AlignmentUI } from './alignmentui.js';
export { AlignmentCommand } from './alignmentcommand.js';
export type { AlignmentConfig, AlignmentFormat, AlignmentSupportedOption } from './alignmentconfig.js';

export {
	supportedOptions as _ALIGNMENT_SUPPORTED_OPTIONS,
	isSupported as _isAlignmentSupported,
	isDefault as _isDefaultAlignment,
	normalizeAlignmentOptions as _normalizeAlignmentOptions
} from './utils.js';

import './augmentation.js';
