import { kv } from "@vercel/kv";

export default async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Solo POST permitido"
        });
    }

    try {

        await kv.set("turno", req.body);

        return res.status(200).json({
            ok: true
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: error.message
        });

    }

}
