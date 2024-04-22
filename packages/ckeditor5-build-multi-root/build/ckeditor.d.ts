/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
import { MultiRootEditor as MultiRootEditorBase } from '@ckeditor/ckeditor5-editor-multi-root';
import type { EditorConfig } from '@ckeditor/ckeditor5-core';
import type { LanguageConfig } from './helpers.js';
interface MultirootEditorConfig extends EditorConfig {
    codeBlock: {
        languages: Array<LanguageConfig>;
    };
}
declare class Editor extends MultiRootEditorBase {
    static builtinPlugins: any[];
    private static toolbarItems;
    static defaultConfig: MultirootEditorConfig;
}
export default Editor;
