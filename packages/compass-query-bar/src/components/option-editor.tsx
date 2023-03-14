import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  css,
  cx,
  useFocusRing,
  palette,
  spacing,
} from '@mongodb-js/compass-components';
import type {
  AceEditor,
  CompletionWithServerInfo,
} from '@mongodb-js/compass-editor';
import {
  InlineEditor,
  EditorTextCompleter,
  QueryAutoCompleter,
} from '@mongodb-js/compass-editor';
import { connect } from 'react-redux';
import type { QueryBarState } from '../stores/query-bar-reducer';

const editorStyles = css({
  width: '100%',
  minWidth: spacing[7],
  // To match ace editor with leafygreen inputs.
  paddingTop: '5px',
  paddingBottom: '5px',
  paddingLeft: '10px',
  paddingRight: '2px',
  border: '1px solid transparent',
  borderRadius: spacing[1],
  overflow: 'visible',
});

const editorWithErrorStyles = css({
  borderColor: palette.red.base,
  '&:focus-within': {
    borderColor: palette.gray.base,
  },
});

type OptionEditorProps = {
  hasError: boolean;
  id: string;
  onChange: (value: string) => void;
  onApply?(): void;
  placeholder?: string;
  schemaFields?: CompletionWithServerInfo[];
  serverVersion?: string;
  value?: string;
  ['data-testid']?: string;
};

function useQueryCompleter(
  ...args: ConstructorParameters<typeof QueryAutoCompleter>
): QueryAutoCompleter {
  const [version, textCompleter, fields] = args;
  const completer = useRef<QueryAutoCompleter>();
  if (!completer.current) {
    completer.current = new QueryAutoCompleter(version, textCompleter, fields);
  }
  useEffect(() => {
    completer.current?.update(fields);
  }, [fields]);
  return completer.current;
}

const OptionEditor: React.FunctionComponent<OptionEditorProps> = ({
  hasError,
  id,
  onChange,
  onApply,
  placeholder,
  schemaFields = [],
  serverVersion = '3.6.0',
  value = '',
  ['data-testid']: dataTestId,
}) => {
  const editorContainerRef = useRef<HTMLDivElement>(null);

  const focusRingProps = useFocusRing({
    outer: true,
    focusWithin: true,
    hover: true,
  });

  const completer = useQueryCompleter(
    serverVersion,
    EditorTextCompleter,
    schemaFields
  );

  const editorRef = useRef<AceEditor | undefined>(undefined);

  const commands = useMemo(() => {
    return [
      {
        name: 'executeQuery',
        bindKey: {
          win: 'Enter',
          mac: 'Enter',
        },
        exec: () => {
          onApply?.();
        },
      },
    ];
  }, [onApply]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Ace editor does not update the value of the editor when
          // the container is not displayed (display: 'none').
          // As a result, we currently listen for `subtab-changed` events
          // which call this `refreshEditor` action. Then we perform a full ace
          // update editor update to ensure the value is updated
          // when the container is displayed, so that any changes to the query
          // are reflected.
          // More info https://github.com/securingsincity/react-ace/issues/204
          editorRef.current?.renderer.updateFull();
        }
      });
    });
    observer.observe(editorContainerRef.current!);
    return () => {
      observer.disconnect();
    };
  }, []);

  const onLoadEditor = useCallback((editor: AceEditor) => {
    editorRef.current = editor;
    editorRef.current.setBehavioursEnabled(true);
  }, []);

  return (
    <div
      className={cx(
        editorStyles,
        focusRingProps.className,
        hasError && editorWithErrorStyles
      )}
      ref={editorContainerRef}
    >
      <InlineEditor
        variant="Shell"
        text={value}
        onChangeText={onChange}
        id={id}
        completer={completer}
        placeholder={placeholder}
        onLoad={onLoadEditor}
        commands={commands}
        data-testid={dataTestId}
      />
    </div>
  );
};

const ConnectedOptionEditor = connect((state: QueryBarState) => {
  return {
    schemaFields: state.schemaFields as CompletionWithServerInfo[],
    serverVersion: state.serverVersion,
  };
})(OptionEditor);

export default ConnectedOptionEditor;
