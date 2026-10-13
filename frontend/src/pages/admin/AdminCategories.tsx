import { useEffect, useState, type FormEvent } from "react";
import { ApiError, api } from "../../api/client";
import type { Category } from "../../api/types";
import { Alert, FormField } from "../../components/FormField";

export function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const load = () => api.categories().then(setCategories);
  useEffect(() => {
    load();
  }, []);

  async function run(action: () => Promise<unknown>) {
    setError("");
    try {
      await action();
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur inattendue");
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    await run(() => api.admin.createCategory(name));
    setName("");
  }

  function rename(category: Category) {
    const newName = window.prompt("Nouveau nom", category.name);
    if (newName && newName !== category.name) run(() => api.admin.updateCategory(category.id, newName));
  }

  function remove(category: Category) {
    if (window.confirm(`Supprimer la catégorie « ${category.name} » ?`)) run(() => api.admin.deleteCategory(category.id));
  }

  return (
    <section>
      <h1>Catégories</h1>
      {error && <Alert>{error}</Alert>}
      <form onSubmit={handleCreate} className="inline-form">
        <FormField label="Nouvelle catégorie" required minLength={2} value={name} onChange={(e) => setName(e.target.value)} />
        <button type="submit" className="button">Ajouter</button>
      </form>
      <table className="table table-responsive">
        <thead>
          <tr><th scope="col">Nom</th><th scope="col">Produits</th><th scope="col">Actions</th></tr>
        </thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c.id}>
              <td data-label="Nom">{c.name}</td>
              <td data-label="Produits">{c._count?.products ?? 0}</td>
              <td data-label="Actions" className="actions">
                <button type="button" className="link-button" onClick={() => rename(c)}>Renommer</button>
                <button type="button" className="link-button danger" disabled={(c._count?.products ?? 0) > 0}
                  title={(c._count?.products ?? 0) > 0 ? "Catégorie utilisée par des produits" : undefined}
                  onClick={() => remove(c)}>
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
