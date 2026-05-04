let datos = [];

export default function handler(req, res) {

    if (req.method === "POST") {
        datos = req.body;
        return res.status(200).json({ ok: true });
    }

    if (req.method === "GET") {
        return res.status(200).json(datos);
    }

}

import { kv } from "@vercel/kv";

export default async function handler(req, res) {
    try {
        const turnos = await kv.get("turnos");
        return res.status(200).json(turnos || []);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}