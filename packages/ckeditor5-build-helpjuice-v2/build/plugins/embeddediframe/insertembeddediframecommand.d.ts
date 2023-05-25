export default class InsertEmbeddedIFrameCommand extends Command {
    execute({ source, height, width }: {
        source: any;
        height?: string | undefined;
        width?: string | undefined;
    }): void;
}
import { Command } from "@ckeditor/ckeditor5-core";
