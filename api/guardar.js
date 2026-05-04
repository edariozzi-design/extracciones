import { kv } from "@vercel/kv";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Solo POST permitido" });
    }

    try {
        const data = req.body;

        // guardamos en KV (puedes cambiar la key luego)
        await kv.set("turno", data);

        return res.status(200).json({ ok: true, message: "Guardado correctamente" });

    } catch (error) {
        return res.status(500).json({ error: "Error al guardar", details: error.message });
    }
}


import { kv } from "@vercel/kv";

export default async function handler(req, res) {
    await kv.del("turnos");
    return res.json({ ok: true, message: "Datos borrados" });
}