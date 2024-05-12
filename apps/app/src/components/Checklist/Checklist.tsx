import { Button } from "@/components/ui/button";
import { AutomergeUrl } from "@automerge/automerge-repo";
import { useDocument } from "@automerge/automerge-repo-react-hooks";
import React from "react";
import { v4 as uuidv4 } from "uuid";

type ChecklistItemType = {
  value: string;
  completed: boolean;
  createdAt: string;
};

type ChecklistType = { checklist: { [key: string]: ChecklistItemType } };

export const Checklist = ({ docUrl }: { docUrl: AutomergeUrl }) => {
  const [newChecklistItem, setNewChecklistItem] = React.useState("");
  const [currentDoc, changeDoc] = useDocument<ChecklistType>(docUrl);

  return (
    <div className="checklist-container">
      <form
        onSubmit={(event) => {
          event.preventDefault();

          changeDoc((doc) => {
            if (!doc.checklist) doc.checklist = {};
            const id = uuidv4();
            doc.checklist[id] = {
              value: newChecklistItem,
              completed: false,
              createdAt: new Date().toISOString(),
            };
          });
          setNewChecklistItem("");
        }}
      >
        <input
          placeholder="What needs to be done?"
          onChange={(event) => setNewChecklistItem(event.target.value)}
          value={newChecklistItem}
          className="new-checklist-item"
        />
        <Button className="add rounded-none h-16">Add</Button>
      </form>
      <ul className="checklist">
        {currentDoc?.checklist &&
          Object.keys(currentDoc.checklist)
            .map((id) => {
              return {
                ...currentDoc.checklist[id],
                id,
              };
            })
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .map((checklistItem) => (
              <li key={checklistItem.id}>
                <input
                  className="edit"
                  onChange={(event) => {
                    changeDoc((doc) => {
                      doc.checklist[checklistItem.id].value =
                        event.target.value;
                    });
                  }}
                  value={checklistItem.value}
                />
                <input
                  className="toggle"
                  type="checkbox"
                  checked={checklistItem.completed}
                  onChange={(event) => {
                    changeDoc((doc) => {
                      doc.checklist[checklistItem.id].completed =
                        event.target.checked;
                    });
                  }}
                />
                <button
                  className="destroy"
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    changeDoc((doc) => {
                      delete doc.checklist[checklistItem.id];
                    });
                  }}
                ></button>
              </li>
            ))}
      </ul>
    </div>
  );
};
