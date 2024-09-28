import React, { forwardRef, useEffect } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
// import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import ToolbarPlugin from './ToolbarPlugin';
import theme from './theme';
import nodes from './nodes';
// import TabFocusPlugin from './TabFocusPlugin';

function onChange(editorState) {
  editorState.read(() => {
    // do something with the editor state
  });
}

export const DefaultValuePlugin = ({ defaultValue }) => {
  const [editor] = useLexicalComposerContext();
  const editorRoot = editor.toJSON().editorState;
  const isEditorEmpty =
    !editorRoot?.root?.children[0] || editorRoot?.root?.children[0]?.children?.length <= 0;

  useEffect(() => {
    //  check if the default value is a valid json string
    if (defaultValue && isEditorEmpty) {
      try {
        editor.setEditorState(editor.parseEditorState(defaultValue));
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Invalid JSON string for default value');
      }
    }
  }, [defaultValue, isEditorEmpty]);

  return null;
};

const FocusPlugin = ({ focus }) => {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    // Focus the editor when the effect fires!
    if (focus) {
      editor.focus();
    }
  }, [editor, focus]);
  return null;
};

function onError(_error) {
  throw _error;
}

const RefPlugin = ({ editorRef }) => {
  const [editor] = useLexicalComposerContext();
  // eslint-disable-next-line no-param-reassign
  editorRef.current = editor;

  return null;
};

const RichTextEditorComponent = forwardRef(
  (
    {
      className,
      lexicalJson,
      onChange: onAnswerChange,
      error,
      defaultValue,
      title = '',
      placeholder = 'Description',
      ..._props
    },
    ref,
  ) => {
    const initialConfig = {
      namespace: 'MyEditor',
      theme,
      nodes,
      onError,
    };

    return (
      <div className={className}>
        <LexicalComposer initialConfig={initialConfig}>
          <div className="rounded-none border border-gray-350">
            <ToolbarPlugin lexicalJson={lexicalJson} />
            <div className="editor-shell p-3">
              <RichTextPlugin
                contentEditable={<ContentEditable className="outline-none" />}
                placeholder={
                  <div className="relative">
                    <div className="pointer-events-none absolute top-[-24px] text-gray-450">
                      {placeholder}...
                    </div>
                  </div>
                }
                ErrorBoundary={LexicalErrorBoundary}
              />
            </div>
          </div>
          <OnChangePlugin
            onChange={editorState => {
              const json = editorState.toJSON();
              onChange(editorState);
              onAnswerChange?.(json);
            }}
          />
          <DefaultValuePlugin defaultValue={defaultValue} />
          <HistoryPlugin />
          <ListPlugin />
          <CheckListPlugin />
          <FocusPlugin />
          <LinkPlugin />
          {/* <TabFocusPlugin />
          <TabIndentationPlugin /> */}
          <RefPlugin editorRef={ref} />
        </LexicalComposer>
        {error && (
          <div className="mt-1 px-2 py-1 text-sm text-red-450">{`${title} is ${error}`}</div>
        )}
      </div>
    );
  },
);

export default RichTextEditorComponent;
