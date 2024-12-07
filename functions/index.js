const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });  // Permite todos los orígenes

admin.initializeApp();

exports.getUsers = functions.https.onRequest((req, res) => {
    // Habilitar CORS para esta función
    cors(req, res, async () => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return res.status(403).json({ message: "No autorizado" });
            }

            const idToken = authHeader.split("Bearer ")[1];
            const decodedToken = await admin.auth().verifyIdToken(idToken);

            if (!decodedToken.admin) {
                return res.status(403).json({ message: "Permiso denegado" });
            }

            const listUsersResult = await admin.auth().listUsers();
            const users = listUsersResult.users.map(user => ({
                uid: user.uid,
                email: user.email,
                provider: user.providerData[0]?.providerId || "N/A",
                creationTime: user.metadata.creationTime,
                lastSignInTime: user.metadata.lastSignInTime
            }));

            return res.status(200).json({ users });
        } catch (error) {
            console.error("Error al obtener usuarios:", error);
            return res.status(500).json({ message: "Error interno del servidor" });
        }
    });
});
