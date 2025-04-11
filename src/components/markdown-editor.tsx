import { markdown } from "@codemirror/lang-markdown";
import { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { basicSetup } from "codemirror";
import React, { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";

import { createMarkdownImage, saveImageBase64 } from "@/core/utils/image-store.tsx";
import { useTranslation } from "react-i18next";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const theme = EditorView.baseTheme({
  "&": {
    fontSize: "16px",
    height: "100%",
  },
  "&.cm-focused": {
    outline: "none",
  },
  ".cm-gutters": {
    fontWeight: "bold",
    border: "none",
    backgroundColor: "white",
  },
  ".cm-scroller": {
    fontFamily: "var(--font-mono)",
    height: "100%",
  },
  ".cm-content": {
    padding: "10px",
  }
});

export const MarkdownEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
}) => {
  const { t } = useTranslation();

  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView>();

  // Add paste handler
  const handlePaste = useCallback(
    async (event: React.ClipboardEvent<HTMLDivElement>) => {
      const items = event.clipboardData?.items;

      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          event.preventDefault();
          const file = items[i].getAsFile();

          if (file) {
            try {
              const reader = new FileReader();

              reader.onload = async (e) => {
                const base64String = e.target?.result as string;
                const imageId = saveImageBase64(base64String);
                const markdownText = createMarkdownImage(imageId);

                // Insert markdown text at cursor position
                if (viewRef.current) {
                  const pos = viewRef.current.state.selection.main.head;

                  viewRef.current.dispatch({
                    changes: {
                      from: pos,
                      insert: markdownText,
                    },
                  });
                }
              };
              reader.readAsDataURL(file);
            } catch (error) {
              console.error(error);
              toast.error(t("commonToast.error"));
            }
          }
          break;
        }
      }
    },
    [],
  );

  // 创建和挂载编辑器 - 只在组件挂载时运行一次
  useEffect(() => {
    if (!editorRef.current) return;

    // Create editor state
    const state = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        markdown(),
        EditorView.lineWrapping,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const newValue = update.state.doc.toString();
            onChange(newValue);
          }
        }),
        theme,
      ],
    });

    // Create and mount editor view
    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, []); // 只在挂载时运行一次

  // 确保编辑器内容与value同步
  useEffect(() => {
    if (!viewRef.current) return;
    
    const currentContent = viewRef.current.state.doc.toString();
    
    // 只有当value与当前编辑器内容不同时才更新
    if (value !== currentContent) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: value,
        },
      });
    }
  }, [value]); // 当value变化时更新编辑器内容

  return <div ref={editorRef} onPaste={handlePaste} className="h-full" />;
};
