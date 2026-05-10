import { kv } from "@vercel/kv";

export default async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Solo POST permitido"
        });
    }

    try {

        const data = req.body;

        await kv.set("turno", data);

        return res.status(200).json({
            ok: true
        });

    } catch (error) {

        return res.status(500).json({
            error: error.message
        });

    }

}
