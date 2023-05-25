export default class ResizeEmbeddedIFrameCommand extends Command {
    execute({ height, width }: {
        height: any;
        width: any;
    }): void;
}
import { Command } from "@ckeditor/ckeditor5-core";
