import { AutomergeUrl } from "@automerge/automerge-repo";
import { useDocument } from "@automerge/automerge-repo-react-hooks";
import React from "react";
import { v4 as uuidv4 } from "uuid";
import "./App.css";

type TodoType = {
  value: string;
  completed: boolean;
  createdAt: string;
};

type Todos = { todos: { [key: string]: TodoType } };

export const Checklist = ({ docUrl }: { docUrl: AutomergeUrl }) => {
  const [newTodo, setNewTodo] = React.useState("");
  const [currentDoc, changeDoc] = useDocument<Todos>(docUrl);

  return (
    <div className="todoapp">
      <form
        onSubmit={(event) => {
          event.preventDefault();

          changeDoc((doc) => {
            if (!doc.todos) doc.todos = {};
            const id = uuidv4();
            doc.todos[id] = {
              value: newTodo,
              completed: false,
              createdAt: new Date().toISOString(),
            };
          });
          setNewTodo("");
        }}
      >
        <input
          placeholder="What needs to be done?"
          onChange={(event) => setNewTodo(event.target.value)}
          value={newTodo}
          className="new-todo"
        />
        <button className="add">Add</button>
      </form>
      <ul className="todo-list">
        {currentDoc?.todos &&
          Object.keys(currentDoc.todos)
            .map((id) => {
              return {
                ...currentDoc.todos[id],
                id,
              };
            })
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .map((todo) => (
              <li key={todo.id}>
                <input
                  className="edit"
                  onChange={(event) => {
                    changeDoc((doc) => {
                      doc.todos[todo.id].value = event.target.value;
                    });
                  }}
                  value={todo.value}
                />
                <input
                  className="toggle"
                  type="checkbox"
                  checked={todo.completed}
                  onChange={(event) => {
                    changeDoc((doc) => {
                      doc.todos[todo.id].completed = event.target.checked;
                    });
                  }}
                />
                <button
                  className="destroy"
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    changeDoc((doc) => {
                      delete doc.todos[todo.id];
                    });
                  }}
                ></button>
              </li>
            ))}
      </ul>
    </div>
  );
};
