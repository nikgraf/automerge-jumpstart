const host = import.meta.env.PROD
  ? "https://automerge-packing-list.fly.dev"
  : "http://localhost:3030";

export async function request(
  method: string,
  path: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any = undefined
) {
  const res = await fetch(`${host}${path}`, {
    credentials: "include",
    method,
    body: body && JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const { error } = await res.json();
    console.log(error);
    throw new Error(error);
  }
  return res;
}
