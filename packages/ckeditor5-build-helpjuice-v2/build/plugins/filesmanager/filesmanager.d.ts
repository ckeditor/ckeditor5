export default class FilesManager extends Plugin {
    static get requires(): (typeof FilesManagerUI)[];
}
import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import FilesManagerUI from "./filesmanagerui";
