/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module image/image/ui/utils
 */
import type { PositionOptions } from 'ckeditor5/src/utils';
import type { Editor } from 'ckeditor5/src/core';
/**
 * A helper utility that positions the
 * {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon} instance
 * with respect to the image in the editor content, if one is selected.
 *
 * @param editor The editor instance.
 */
export declare function repositionContextualBalloon(editor: Editor): void;
/**
 * Returns the positioning options that control the geometry of the
 * {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon} with respect
 * to the selected element in the editor content.
 *
 * @param editor The editor instance.
 */
export declare function getBalloonPositionData(editor: Editor): Partial<PositionOptions>;
