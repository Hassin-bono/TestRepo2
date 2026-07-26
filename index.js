

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/users/:id", (req, res) => {
  const { id } = req.params;

  res.json({
    id,
    name: "Alice",
  });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
