function fetch(id: string) {
  return {
    id,
    name: "Alice",
    email: "alice@example.com",
  };
}

function insert(data: Record<string, unknown>) {
  return {
    success: true,
    data,
  };
}

function delete_(id: string) {
  return {
    success: true,
    deletedId: id,
  };
}

export const db = {
  fetch,
  insert,
  delete_,
};
