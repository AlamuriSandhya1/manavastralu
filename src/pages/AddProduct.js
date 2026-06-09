
import React, { useState } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "http://localhost:8000";

export default function AddProduct() {
  const [form, setForm] = useState({
    name: "", description: "", price: "", originalPrice: "",
    fabric: "", category: "", stock: "10", sizes: "",
  });

  // Up to 4 images (main product photos)
  const [images, setImages] = useState([null, null, null, null]);

  // Colour variants: [{ name, stock, imageFile }]
  const [variants, setVariants] = useState([{ name: "", stock: "10", imageFile: null }]);

  const [loading, setLoading] = useState(false);

  const handleField = e =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleImage = (i, file) =>
    setImages(prev => { const a = [...prev]; a[i] = file; return a; });

  const addVariant = () =>
    setVariants(v => [...v, { name: "", stock: "10", imageFile: null }]);

  const updateVariant = (i, key, val) =>
    setVariants(v => v.map((x, idx) => idx === i ? { ...x, [key]: val } : x));

  const removeVariant = (i) =>
    setVariants(v => v.filter((_, idx) => idx !== i));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.price) { alert("Name and Price are required"); return; }

    setLoading(true);
    try {
      const data = new FormData();

      // Basic fields
      Object.entries(form).forEach(([k, v]) => {
        if (k === "sizes") {
          data.append("sizes", JSON.stringify(
            v.split(",").map(s => s.trim()).filter(Boolean)
          ));
        } else {
          data.append(k, v);
        }
      });

      // Main images
      images.filter(Boolean).forEach(f => data.append("images", f));

      // Colour variants — send as JSON meta + separate image files
      const variantMeta = variants.map((v, i) => ({
        name: v.name,
        stock: Number(v.stock),
        imageIndex: i, // matches the variantImages[] order on the server
      }));
      data.append("colorVariants", JSON.stringify(variantMeta));
      variants.forEach(v => {
        if (v.imageFile) data.append("variantImages", v.imageFile);
      });

      await axios.post(`${API}/api/products`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Product added!");
      setForm({ name:"", description:"", price:"", originalPrice:"", fabric:"", category:"", stock:"10", sizes:"" });
      setImages([null, null, null, null]);
      setVariants([{ name: "", stock: "10", imageFile: null }]);
    } catch (err) {
      alert("Error: " + (err.response?.data?.error || err.message));
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2 style={styles.h2}>Add Product</h2>

      {/* ── Basic fields */}
      {[
        ["name", "Product Name *"],
        ["price", "Price (₹) *"],
        ["originalPrice", "Original Price (₹) — optional"],
        ["fabric", "Fabric"],
        ["category", "Category (Sarees / Dresses / Lehengas / Kurtis)"],
        ["stock", "Default Stock"],
        ["sizes", "Sizes (comma-separated: XS,S,M,L,XL)"],
      ].map(([key, label]) => (
        <label key={key} style={styles.label}>
          {label}
          <input
            name={key}
            value={form[key]}
            onChange={handleField}
            style={styles.input}
            type={["price","originalPrice","stock"].includes(key) ? "number" : "text"}
          />
        </label>
      ))}

      <label style={styles.label}>
        Description
        <textarea name="description" value={form.description} onChange={handleField} style={{ ...styles.input, height: 80 }} />
      </label>

      {/* ── Main images */}
      <fieldset style={styles.fieldset}>
        <legend style={styles.legend}>Main Product Images (up to 4)</legend>
        {images.map((_, i) => (
          <label key={i} style={styles.label}>
            Image {i + 1}
            <input
              type="file" accept="image/*"
              onChange={e => handleImage(i, e.target.files[0])}
              style={styles.fileInput}
            />
          </label>
        ))}
      </fieldset>

      {/* ── Colour variants */}
      <fieldset style={styles.fieldset}>
        <legend style={styles.legend}>Colour Variants</legend>
        <p style={styles.hint}>Each variant gets its own image and stock. Leave empty to skip.</p>

        {variants.map((v, i) => (
          <div key={i} style={styles.variantRow}>
            <input
              placeholder="Colour name (e.g. blue)"
              value={v.name}
              onChange={e => updateVariant(i, "name", e.target.value)}
              style={{ ...styles.input, flex: 1 }}
            />
            <input
              type="number" placeholder="Stock"
              value={v.stock}
              onChange={e => updateVariant(i, "stock", e.target.value)}
              style={{ ...styles.input, width: 80 }}
            />
            <input
              type="file" accept="image/*"
              onChange={e => updateVariant(i, "imageFile", e.target.files[0])}
              style={styles.fileInput}
            />
            {variants.length > 1 && (
              <button type="button" onClick={() => removeVariant(i)} style={styles.removeBtn}>✕</button>
            )}
          </div>
        ))}

        <button type="button" onClick={addVariant} style={styles.addVariantBtn}>
          + Add Another Colour
        </button>
      </fieldset>

      <button type="submit" disabled={loading} style={styles.submitBtn}>
        {loading ? "Uploading…" : "Add Product"}
      </button>
    </form>
  );
}

const styles = {
  form:          { maxWidth: 640, margin: "0 auto", padding: 32, fontFamily: "'Segoe UI', sans-serif" },
  h2:            { color: "#8b4513", fontFamily: "Georgia,serif", marginBottom: 24 },
  label:         { display: "block", fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.5px" },
  input:         { display: "block", width: "100%", padding: "9px 12px", fontSize: 14, border: "1px solid #ccc", borderRadius: 4, marginTop: 4, boxSizing: "border-box" },
  fileInput:     { display: "block", marginTop: 4, fontSize: 13 },
  fieldset:      { border: "1px solid #e0cfc0", borderRadius: 6, padding: 20, marginBottom: 24 },
  legend:        { fontSize: 13, fontWeight: 700, color: "#8b4513", padding: "0 8px" },
  hint:          { fontSize: 12, color: "#888", marginTop: 0, marginBottom: 16 },
  variantRow:    { display: "flex", gap: 10, alignItems: "center", marginBottom: 14 },
  removeBtn:     { background: "none", border: "none", color: "#c00", fontSize: 18, cursor: "pointer" },
  addVariantBtn: { background: "none", border: "1px dashed #c2185b", color: "#c2185b", padding: "7px 16px", borderRadius: 4, cursor: "pointer", fontSize: 13, marginTop: 4 },
  submitBtn:     { background: "#8b4513", color: "#fff", border: "none", padding: "13px 32px", fontSize: 14, fontWeight: 700, borderRadius: 4, cursor: "pointer", width: "100%" },
};
