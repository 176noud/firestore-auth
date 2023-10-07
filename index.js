const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const config = require('config');
const { v4: uuidv4 } = require('uuid');

const serviceAccount = require(config.get('env.servicekey'));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

async function register(payload) {
    try {
        await admin.firestore().collection(config.get('env.userdb')).doc(uuidv4()).set(payload);
        const token = jwt.sign(userData, config.get('env.secret'), { expiresIn: '24h' });
        return { success: true, token: token, message: 'succesfully registered account', error: undefined };
    } catch (error) {
        return { success: false, token: undefined, message: 'internal server error', error: error }
    }
}

async function login(payload) {
    try {
        const usersRef = admin.firestore().collection(userdb);
        const snapshotByUsername = await usersRef.where('username', '==', payload.username).where('password', '==', payload.password).get();
        const snapshotByEmail = await usersRef.where('email', '==', payload.email).where('password', '==', payload.password).get();

        if (snapshotByUsername.empty && snapshotByEmail.empty) {
            return { success: false, message: 'user doesnt exist' };
        }

        let userData;
        snapshotByUsername.forEach(doc => {
            userData = doc.data();
        });
        snapshotByEmail.forEach(doc => {
            userData = doc.data();
        });

        const token = jwt.sign(userData, config.get('env.secret'), { expiresIn: '24h' });
        return { success: true, token };
    } catch (error) {
        return { success: false, message: error };
    }
}
