export default class CalloutBlocks extends Plugin {
    static get requires(): (typeof CalloutBlocksUI | typeof Danger)[];
    static get pluginName(): string;
}
import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import CalloutBlocksUI from "./calloutblocksui";
import Danger from "./danger/danger";
