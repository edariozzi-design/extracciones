let turno = [];

export default function handler(req, res) {

    if (req.method === "POST") {
        turno = req.body;
        return res.status(200).json({ ok: true });
    }

    if (req.method === "GET") {
        return res.status(200).json(turno);
    }

    return res.status(405).end();
}