/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
import { ClassicEditor as ClassicEditorBase } from '@ckeditor/ckeditor5-editor-classic';
import '../theme/emoji.css';
export default class ClassicEditor extends ClassicEditorBase {
    static builtinPlugins: any[];
    static defaultConfig: {
        toolbar: {
            items: (string | {
                label: string;
                icon: string;
                items: string[];
            })[];
            shouldNotGroupWhenFull: boolean;
        };
        image: {
            toolbar: string[];
        };
        table: {
            contentToolbar: string[];
            tableProperties: {
                defaultProperties: {
                    width: string;
                };
            };
            tableCellProperties: {};
        };
        htmlEmbed: {
            showPreviews: boolean;
        };
        mediaEmbed: {
            previewsInData: boolean;
        };
        language: string;
        video: {
            styles: string[];
            toolbar: string[];
        };
    };
}
