export default class ExtraFormatting extends Plugin {
    static get requires(): (typeof ExtraFormattingUI)[];
    static get pluginName(): string;
}
import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import ExtraFormattingUI from "./extraformattingui";
