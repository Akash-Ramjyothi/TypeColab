import React, { useState, useRef, useEffect } from "react";
import { Editor } from "slate-react";
import { initialValue } from "./slateInitialValue";
import { Operation, Value } from "slate";
import io from "socket.io-client";
import "./SyncingEditor.css";

const socket = io("https://google-docs-clone.herokuapp.com");

interface Props {
  groupId: string;
}

export const SyncingEditor: React.FC<Props> = ({ groupId }) => {
  const [value, setValue] = useState(initialValue);
  const id = useRef(`${Date.now()}`);
  const editor = useRef<Editor | null>(null);
  const remote = useRef(false);

  useEffect(() => {
    fetch(`https://google-docs-clone.herokuapp.com/api/groups/${groupId}`)
      .then(x => x.json())
      .then(data => {
        setValue(Value.fromJSON(data));
      });

    const eventName = `new-remote-operations-${groupId}`;
    socket.on(
      eventName,
      ({ editorId, ops }: { editorId: string; ops: Operation[] }) => {
        if (id.current !== editorId) {
          remote.current = true;
          ops.forEach((op: any) => editor.current!.applyOperation(op));
          remote.current = false;
        }
      }
    );

    return () => {
      socket.off(eventName);
    };
  }, [groupId]);

  return (
    <>
      <button
        className="btn"
        onMouseDown={e => {
          e.preventDefault();
          editor.current!.toggleMark("bold");
        }}
      >
        <strong>B</strong>
      </button>
      <button
        className="btn"
        onMouseDown={e => {
          e.preventDefault();
          editor.current!.toggleMark("italic");
        }}
      >
        <em>I</em>
      </button>
      <button
        className="btn"
        onMouseDown={e => {
          e.preventDefault();
          editor.current!.toggleMark("underline");
        }}
      >
        <u>U</u>
      </button>

      <button
        className="source"
      >
        <a href="https://github.com/Akash-Ramjyothi/TypeColab">
        Source Code
        </a>
      </button>  

      <Editor
        ref={editor}
        style={{
          backgroundColor: "#f8f8f8",
          width: 800,
          maxWidth: "80vw",
          minHeight: 750,
          padding: 10
        }}
        value={value}
        renderMark={(props, _editor, next) => {
          if (props.mark.type === "bold") {
            return <strong>{props.children}</strong>;
          } else if (props.mark.type === "italic") {
            return <em>{props.children}</em>;
          } else if (props.mark.type === "underline") {
            return <u>{props.children}</u>;
          }
          return next();
        }}
        onChange={opts => {
          setValue(opts.value);

          const ops = opts.operations
            .filter(o => {
              if (o) {
                return (
                  o.type !== "set_selection" &&
                  o.type !== "set_value" &&
                  (!o.data || !o.data.has("source"))
                );
              }

              return false;
            })
            .toJS()
            .map((o: any) => ({ ...o, data: { source: "one" } }));

          if (ops.length && !remote.current) {
            socket.emit("new-operations", {
              editorId: id.current,
              ops,
              value: opts.value.toJSON(),
              groupId
            });
          }
        }}
      />
    </>
  );
};
