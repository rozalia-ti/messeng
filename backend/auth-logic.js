const AuthLogic = {
    // поиск пользователя в collections по тому, что мы ввели в полях при решистрации
    async findUserByUsername(username) {
        const snapshot = await db.collection('users')
            .where('username', '==', username)
            .get()

        const doc = snapshot.docs[0];

        return {
            uid: doc.id,
            ...doc.data()
        };
    },

    // создание нового пользователя
    async createUser(username, password) {
        const docRef = await db.collection('users').add({
            username: username,
            password: password
        });

        return {
            uid: docRef.id,
            username: username
        };
    },

    // проверяем пароль 
    async checkPassword(username, password) {
        const user = await this.findUserByUsername(username)

        if (user.password != password) {
            return { success: false, message: 'Неверный парооль' };
        }

        return {
            success: true, 
            user: {
                uid: user.uid,
                username: user.username
            }
        }
    },
    // регистрация
    async register(username, password) {
        const existUser = await this.findUserByUsername(username);
        // проверяем при регистрации, вдруг юзернейм уже занят.
        if(existUser) {
            return {success: false, message: 'Имя пользователя занято'};
        }

        const newUser = await this.createUser(username, password);

        return {
            success: true,
            user: newUser
        };
    }
};

window.AuthLogic = AuthLogic;