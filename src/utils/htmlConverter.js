import { $generateHtmlFromNodes } from '@lexical/html';

export default editor => {
  let html = '';
  editor.update(() => {
    try {
      html = $generateHtmlFromNodes(editor, null);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  });
  return html;
};
