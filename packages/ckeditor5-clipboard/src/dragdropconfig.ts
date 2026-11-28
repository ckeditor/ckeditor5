/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module clipboard/dragdropconfig
 */

import type { ViewDataTransfer } from '@ckeditor/ckeditor5-engine';

/** The drop positioning mode used by the drag and drop feature. */
export type DragDropMode = 'block' | 'inline';

/**
 * The configuration of the drag and drop feature.
 *
 * The callback is used only for drags originating outside the editor. Content of external drags
 * cannot be inspected reliably during `dragover`, so this callback can be used to provide the
 * expected positioning mode based on the native data transfer.
 */
export interface DragDropConfig {
	getDropMode?: ( dataTransfer: ViewDataTransfer ) => DragDropMode | undefined;
}
