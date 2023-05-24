export default class InsertEmbeddedIFrameCommand extends Command {
    execute(url: any, options?: {
        height: string;
        width: string;
    }): void;
}
import { Command } from "@ckeditor/ckeditor5-core";
