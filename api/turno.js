import { kv } from "@vercel/kv";

export default async function handler(req, res) {

    try {

        const datos = await kv.get("turno");

        return res.status(200).json(datos || []);

    } catch (error) {

        return res.status(500).json({
            error: error.message
        });

    }

}