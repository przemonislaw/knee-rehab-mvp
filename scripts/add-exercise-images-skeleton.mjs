import fs from "node:fs";
import path from "node:path";

const file = path.join(process.cwd(), "src/data/exerciseCatalog.json");
const raw = fs.readFileSync(file, "utf8");
const data = JSON.parse(raw);

data.exercises = (data.exercises ?? []).map((ex) => {
  if (Array.isArray(ex.images) && ex.images.length > 0) return ex;

  return {
    ...ex,
    images: [
      {
        kind: "start",
        url: ex.imageUrl ?? null,
        status: "draft",
        source: "AI",
        license: "internal",
        notes: "Poglądowe – do ręcznej weryfikacji."
      },
      {
        kind: "end",
        url: null,
        status: "draft",
        source: "AI",
        license: "internal",
        notes: "Poglądowe – do ręcznej weryfikacji."
      }
    ]
  };
});

fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log("✅ Updated:", file);
