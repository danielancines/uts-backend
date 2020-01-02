db.roles.insertMany(
    [
        { name: 'Listar Usuários', description: 'Usuário pode acessar e listar os usuários', role: 'accessUsers', collectionName: 'Users' },
        { name: 'Incluir Usuários', description: 'Usuário pode incluir usuários', role: 'insertUser', collectionName: 'Users' },
        { name: 'Editar Usuários', description: 'Usuário pode editar usuários', role: 'updateUser', collectionName: 'Users' },
        { name: 'Excluir Usuários', description: 'Usuário pode excluir usuários', role: 'deleteUser', collectionName: 'Users' }
    ])