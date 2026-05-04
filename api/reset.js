import { kv } from "@vercel/kv";

export default async function handler(req, res) {
    await kv.del("turnos");
    return res.json({ ok: true, message: "Datos borrados" });

}
