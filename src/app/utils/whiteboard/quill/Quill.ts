import { WhiteboardFonts } from '@app/constants/whiteboard/whiteboard-fonts';
import Quill from 'quill';

const Link = Quill.import('formats/link');
class CustomLink extends Link {
    static create(value: string) {
        const node = super.create(value) as Element;
        node.setAttribute('href', this.sanitize(value));
        node.setAttribute('rel', 'noopener noreferrer');
        node.setAttribute('target', '_blank');
        return node;
      }
}

const Font = Quill.import('formats/font');
Font.whitelist = WhiteboardFonts.map((x) => x.key);
Quill.register(Font, true);
Quill.register(CustomLink, true);

export default Quill;
