import express from 'express';
import graphqlHTTP from 'express-graphql';
import { buildSchema } from 'graphql';

// backend-nodejs/index.js

const app = express();
const PORT = 4000;

// Dados em memória
const participantes = [];

const schema = buildSchema(`
  type Participante {
    id: ID!
    firstname: String!
    lastname: String!
    participation: Int!
  }

  type Query {
    participantes: [Participante]
  }

  type Mutation {
    adicionarParticipante(
        firstname: String!, 
        lastname: String!, 
        participation: 
            Int!): Participante
            removerParticipante(id: ID!): Boolean
  }
`);



const rootValue = {
  participantes: () => participantes,
  adicionarParticipante: ({ firstname, lastname, participation }) => {
    // Validação inicial
    if (participation <= 0) {
      throw new Error('A participação deve ser um número positivo.');
    }

    // Validação da soma total
    const totalAtual = participantes.reduce((soma, p) => soma + p.participation, 0);
    const novoTotal = totalAtual + participation;

    if (novoTotal > 100) {
      throw new Error('A soma total das porcentagens não pode ultrapassar 100%.');
    }

    const novoParticipante = {
      id: String(participantes.length + 1),
      firstname,
      lastname,
      participation,
    };
    participantes.push(novoParticipante);
    return novoParticipante;
  },
  removerParticipante: ({ id }) => {
    const index = participantes.findIndex(p => p.id === id);
    if (index === -1) {
      return false;
    }
    participantes.splice(index, 1);
    return true;
  },
};

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: rootValue,
  graphiql: true,
}));

app.listen(PORT, () => {
  console.log(`Servidor GraphQL rodando em http://localhost:${PORT}/graphql`);
});