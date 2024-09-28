import React, { useEffect } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { isEmpty } from 'lodash';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import theme from './theme';
import nodes from './nodes';
import htmlConverter from '../../../utils/htmlConverter';

const ViewRte = ({ data }) => {
  const onError = _error => {
    throw _error;
  };

  const RenderJson = ({ lexicalJson }) => {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
      if (lexicalJson && !isEmpty(lexicalJson)) {
        const newEditorState = editor.parseEditorState(lexicalJson);
        editor.setEditorState(newEditorState);
        // eslint-disable-next-line no-unused-vars
        const res = htmlConverter(editor);
        // TODO: remove after fixing html converter
        // eslint-disable-next-line no-console
        // console.log(res);
      }
    }, [editor, lexicalJson]);

    return null;
  };

  const initialConfig = {
    namespace: 'MyEditor',
    theme,
    nodes,
    onError,
    editable: false,
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <RichTextPlugin
        contentEditable={<ContentEditable className="outline-none" />}
        placeholder={<div />}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <RenderJson lexicalJson={data || ''} />
    </LexicalComposer>
  );
};

export default ViewRte;
