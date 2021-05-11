import React from "react";
import { BrowserRouter, Route, Redirect } from "react-router-dom";
import { GroupEditor } from "./GroupEditor";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Route
        exact
        path="/"
        render={() => {
          return <Redirect to={`/group/${Date.now()}`} />;
        }}
      />
      <Route path="/group/:id" component={GroupEditor} />
    </BrowserRouter>
  );
};

export default App;
