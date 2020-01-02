db.roles.insertMany(
    [
        { name: 'Listar Registro de Jogos e Saldo', description: 'Usuário pode acessar e listar o Registro de Jogos e Saldo', role: 'accessGamesAndBalance', collectionName: 'GamesAndBalance' },
        { name: 'Incluir Registro de Jogos e Saldo', description: 'Usuário pode incluir Registro de Jogos e Saldo', role: 'updateGamesAndBalance', collectionName: 'GamesAndBalance' },
        { name: 'Editar Registro de Jogos e Saldo', description: 'Usuário pode editar Registro de Jogos e Saldo', role: 'insertGamesAndBalance', collectionName: 'GamesAndBalance' },
        { name: 'Excluir Registro de Jogos e Saldo', description: 'Usuário pode excluir Registro de Jogos e Saldo', role: 'deleteGamesAndBalance', collectionName: 'GamesAndBalance' }
    ])