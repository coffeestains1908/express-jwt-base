/**
 * PERMISSIONS:
 * admin: manage license, operator accounts
 * operator: manage face ids, logs
 */
const {COLLECTION_NAMES} = require('./collectionNames');
const bcrypt = require('bcrypt');
const {get_db} = require("../db");
const USER_PERMISSIONS = {
    superAdmin: 'super-admin',
    admin: 'admin',
    siteOperator: 'site-operator'
};
const SALT_ROUNDS = 10;

class BaseUser {
    constructor(
        _id,
        email,
        passwordHash,
        permissions,
        createdAt,
        modifiedAt,
    ) {
        this._id = _id;
        this.email = email;
        this.passwordHash = passwordHash;
        this.createdAt = createdAt;
        this.modifiedAt = modifiedAt;
        this.permissions = permissions;
    }

    /**
     *
     * @param email
     * @return {Promise<{_id, email, passwordHash, createdAt, modifiedAt, permissions: []}>}
     */
    static findByEmail(email) {
        return new Promise(async (resolve, reject) => {
            try {
                const {client, db} = await get_db();
                const col = db.collection(COLLECTION_NAMES.users);
                const user = col.findOne({email});
                await client.close();
                resolve(user);
            } catch (e) {
                reject(e);
            }
        });
    }

    static new(
        email,
        passwordClearText,
        permissions
    ) {
        const passwordHash = BaseUser.encryptPassword(passwordClearText);
        return new this(
            null,
            email,
            passwordHash,
            permissions,
            null,
        );
    }

    /**
     *
     * @param password
     * @return {string}
     */
    static encryptPassword(password) {
        return bcrypt.hashSync(password, SALT_ROUNDS);
    }

    /**
     *
     * @param password
     * @param hash
     * @return {Promise<boolean>}
     */
    static validatePassword(password, hash) {
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, hash, (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });
    }

    data() {
        return {
            email: this.email,
            permissions: this.permissions,
            passwordHash: this.passwordHash,
            createdAt: this.createdAt,
            modifiedAt: this.modifiedAt
        };
    }

    save() {
        return new Promise(async (resolve, reject) => {
            try {
                const {client, db} = await get_db();
                const col = db.collection(COLLECTION_NAMES.users);
                const data = this.data();
                let insertedData = {};

                if (this._id) {
                } else {
                    data['createdAt'] = new Date(Date.now());
                    const r = await col.insertOne(data);
                    insertedData = r.ops[0];
                    insertedData['_id'] = r.insertedId;
                }

                await client.close();
                resolve(insertedData);
            } catch (e) {
                reject(e);
            }
        });
    }
}

module.exports = {
    BaseUser,
    SALT_ROUNDS,
    USER_PERMISSIONS
};
