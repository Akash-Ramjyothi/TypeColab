import * as React from "react";
import { RouteComponentProps } from "react-router-dom";
import { SyncingEditor } from "./SyncingEditor";
import "./GroupEditor.css";

export const GroupEditor: React.FC<
  RouteComponentProps<{ id: string }>
> = ({
  match: {
    params: { id }
  }
}) => {
  return (
    <div className="root">
      <SyncingEditor groupId={id} />
    </div>
  );
};
