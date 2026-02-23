const AuthLogic = {
    // Поиск пользователя по имени
    async findUserByUsername(username) {
        try {
            const snapshot = await db.collection('users')
                .where('username', '==', username)
                .get();

            if (snapshot.empty) {
                return null;
            }

            const doc = snapshot.docs[0];
            return {
                uid: doc.id,
                ...doc.data()
            };
        } catch (error) {
            console.error('Ошибка при поиске:', error);
            return null;
        }
    },

    // Создание нового пользователя
    async createUser(username, password) {
        try {
            const docRef = await db.collection('users').add({
                username: username,
                password: password,
                createdAt: new Date().toISOString()
            });

            return {
                uid: docRef.id,
                username: username
            };
        } catch (error) {
            console.error('Ошибка при создании:', error);
            return null;
        }
    },

    // Проверка пароля
    async checkPassword(username, password) {
        const user = await this.findUserByUsername(username);

        if (!user) {
            return { success: false, message: 'Пользователь не найден' };
        }

        if (user.password !== password) {
            return { success: false, message: 'Неверный пароль' };
        }

        return {
            success: true,
            user: {
                uid: user.uid,
                username: user.username
            }
        };
    },

    // Регистрация
    async register(username, password) {
        const existingUser = await this.findUserByUsername(username);

        if (existingUser) {
            return { success: false, message: 'Имя пользователя занято' };
        }

        const newUser = await this.createUser(username, password);

        return {
            success: true,
            user: newUser
        };
    }
};

window.AuthLogic = AuthLogic;
console.log('✅ AuthLogic загружен');