import { Link, createLazyFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { request } from "../utils/request/request";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  const [documents, setDocuments] = useState<{ id: string; name: string }[]>(
    []
  );

  useEffect(() => {
    request("GET", "/documents")
      .then((res) => res.json())
      .then((data) => setDocuments(data.documents));
  }, []);

  return (
    <div className="p-2">
      <h3>Welcome Home!</h3>
      {documents.map((doc) => (
        <div key={doc.id}>
          <Link to={`/checklist#automerge:${doc.id}`}>{doc.name}</Link>
        </div>
      ))}
      <button
        onClick={() => {
          request("POST", "/documents")
            .then((res) => res.json())
            .then((data) => {
              setDocuments([...documents, data.document]);
            });
        }}
      >
        Create Document
      </button>
    </div>
  );
}
