/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module image/imageinsert/utils
 */
import type { Locale } from 'ckeditor5/src/utils';
import type { Editor } from 'ckeditor5/src/core';
import { LabeledFieldView, type View } from 'ckeditor5/src/ui';
/**
 * Creates integrations object that will be passed to the
 * {@link module:image/imageinsert/ui/imageinsertpanelview~ImageInsertPanelView}.
 *
 * @param editor Editor instance.
 *
 * @returns Integrations object.
 */
export declare function prepareIntegrations(editor: Editor): Record<string, View>;
/**
 * Creates labeled field view.
 *
 * @param locale The localization services instance.
 */
export declare function createLabeledInputView(locale: Locale): LabeledFieldView;
