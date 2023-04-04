export default class Danger extends Plugin {
    static get requires(): (typeof DangerUI)[];
}
import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import DangerUI from "./dangerui";
