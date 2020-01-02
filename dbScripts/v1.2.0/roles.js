db.roles.insertMany(
    [
        { name: 'Listar Salas de Poker', description: 'Usuário pode acessar e listar as Salas de Poker', role: 'accessPokerRooms', collectionName: 'PokerRooms' },
        { name: 'Incluir Salas de Poker', description: 'Usuário pode incluir Salas de Poker', role: 'insertPokerRoom', collectionName: 'PokerRooms' },
        { name: 'Editar Salas de Poker', description: 'Usuário pode editar Salas de Poker', role: 'updatePokerRoom', collectionName: 'PokerRooms' },
        { name: 'Excluir Salas de Poker', description: 'Usuário pode excluir Salas de Poker', role: 'deletePokerRoom', collectionName: 'PokerRooms' }
    ])

db.roles.insertMany(
    [
        { name: 'Listar Solicitação de Aporte', description: 'Usuário pode acessar e listar as Solicitações de Aporte', role: 'accessMoneyRequests', collectionName: 'MoneyRequests' },
        { name: 'Incluir Solicitação de Aporte', description: 'Usuário pode incluir Solicitação de Aporte', role: 'insertMoneyRequest', collectionName: 'MoneyRequests' },
        { name: 'Editar Solicitação de Aporte', description: 'Usuário pode editar Solicitação de Aporte', role: 'updateMoneyRequest', collectionName: 'MoneyRequests' }
    ])