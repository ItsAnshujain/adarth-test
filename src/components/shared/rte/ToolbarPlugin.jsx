import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ActionIcon } from '@mantine/core';
import {
  IconBold,
  IconHighlight,
  IconItalic,
  IconList,
  IconListNumbers,
  IconUnderline,
  IconStrikethrough,
  IconCode,
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
} from '@tabler/icons';
import {
  SELECTION_CHANGE_COMMAND,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  FORMAT_TEXT_COMMAND,
  $getSelection,
  $isRangeSelection,
  FORMAT_ELEMENT_COMMAND,
} from 'lexical';
import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListNode,
  REMOVE_LIST_COMMAND,
} from '@lexical/list';
import React, { useCallback, useEffect, useState } from 'react';
import { $isParentElementRTL } from '@lexical/selection';
import { $isHeadingNode } from '@lexical/rich-text';
import { $getNearestNodeOfType, mergeRegister } from '@lexical/utils';
import { $isCodeNode, getDefaultCodeLanguage } from '@lexical/code';
import { isEmpty } from 'lodash';

const LowPriority = 1;

const ToolbarPlugin = ({ lexicalJson }) => {
  const [editor] = useLexicalComposerContext();
  const [, setCanUndo] = useState(false);
  const [, setCanRedo] = useState(false);
  const [blockType, setBlockType] = useState('paragraph');
  const [, setSelectedElementKey] = useState(null);
  const [, setCodeLanguage] = useState('');
  const [, setIsRTL] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [isHighlight, setIsHighlight] = useState(false);
  const [textAlign, setTextAlign] = useState('');

  const formatList = listType => {
    if (listType === 'number' && blockType !== 'number') {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
      setBlockType('number');
    } else if (listType === 'ul' && blockType !== 'ul') {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
      setBlockType('ul');
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
      setBlockType('paragraph');
    }
  };

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === 'root' ? anchorNode : anchorNode.getTopLevelElementOrThrow();
      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);
      if (elementDOM !== null) {
        setSelectedElementKey(elementKey);
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType(anchorNode, ListNode);
          const type = parentList ? parentList.getTag() : element.getTag();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element) ? element.getTag() : element.getType();
          setBlockType(type);
          if ($isCodeNode(element)) {
            setCodeLanguage(element.getLanguage() || getDefaultCodeLanguage());
          }
        }
      }
      // Update text format
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));
      setIsCode(selection.hasFormat('code'));
      setIsHighlight(selection.hasFormat('highlight'));
      setIsRTL($isParentElementRTL(selection));
    }
  }, [editor]);

  useEffect(
    () =>
      mergeRegister(
        editor.registerUpdateListener(({ editorState }) => {
          editorState.read(() => {
            updateToolbar();
          });
        }),
        editor.registerCommand(
          SELECTION_CHANGE_COMMAND,
          (_payload, _newEditor) => {
            updateToolbar();
            return false;
          },
          LowPriority,
        ),
        editor.registerCommand(
          CAN_UNDO_COMMAND,
          payload => {
            setCanUndo(payload);
            return false;
          },
          LowPriority,
        ),
        editor.registerCommand(
          CAN_REDO_COMMAND,
          payload => {
            setCanRedo(payload);
            return false;
          },
          LowPriority,
        ),
      ),
    [editor, updateToolbar],
  );

  useEffect(() => {
    let timeoutId;
    if (lexicalJson && !isEmpty(lexicalJson)) {
      // TODO: need fix here. Toolbar not to be modified
      const stringifiedLexicalJson = JSON.stringify(lexicalJson);
      const parsedLexicalJson = JSON.parse(stringifiedLexicalJson);

      const newEditorState = editor.parseEditorState(parsedLexicalJson);

      timeoutId = setTimeout(() => {
        editor.setEditorState(newEditorState);
      }, 500);
    }
    return () => {
      clearTimeout(timeoutId);
    };
  }, [editor, lexicalJson]);

  return (
    <div className="flex flex-wrap gap-x-2 gap-y-4 rounded-t bg-gray-450 p-2">
      <ActionIcon
        color={isBold ? 'dark' : 'gray'}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
      >
        <IconBold />
      </ActionIcon>
      <ActionIcon
        color={isItalic ? 'dark' : 'gray'}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
      >
        <IconItalic />
      </ActionIcon>
      <ActionIcon
        color={isUnderline ? 'dark' : 'gray'}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
        disabled={isStrikethrough}
      >
        <IconUnderline />
      </ActionIcon>
      <ActionIcon
        color={isStrikethrough ? 'dark' : 'gray'}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')}
        disabled={isUnderline}
      >
        <IconStrikethrough />
      </ActionIcon>
      <ActionIcon
        color={isHighlight ? 'dark' : 'gray'}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'highlight')}
      >
        <IconHighlight />
      </ActionIcon>
      <ActionIcon
        color={isCode ? 'dark' : 'gray'}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')}
      >
        <IconCode />
      </ActionIcon>
      <ActionIcon onClick={() => (blockType === 'ol' ? formatList('') : formatList('number'))}>
        <IconListNumbers color={blockType === 'ol' ? 'black' : 'gray'} />
      </ActionIcon>
      <ActionIcon onClick={() => (blockType === 'ul' ? formatList('') : formatList('ul'))}>
        <IconList color={blockType === 'ul' ? 'black' : 'gray'} />
      </ActionIcon>
      <ActionIcon
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left');
          setTextAlign('left');
        }}
      >
        <IconAlignLeft color={textAlign === 'left' ? 'black' : 'gray'} />
      </ActionIcon>
      <ActionIcon
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center');
          setTextAlign('center');
        }}
      >
        <IconAlignCenter color={textAlign === 'center' ? 'black' : 'gray'} />
      </ActionIcon>
      <ActionIcon
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right');
          setTextAlign('right');
        }}
      >
        <IconAlignRight color={textAlign === 'right' ? 'black' : 'gray'} />
      </ActionIcon>
    </div>
  );
};

export default ToolbarPlugin;
