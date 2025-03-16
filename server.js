/* import {
    createServer
} from 'node:http'


const server = createServer( (request, response) => {
    
    response.write("resposta do response")

    return response.end()
})
*/


import { fastify } from 'fastify';
import postgres from '@fastify/postgres';
import 'dotenv/config'

//! import { databaseMemory } from './database-memory.js';
//! const database = new databaseMemory();


const server = fastify({logger: true});

server.register(postgres, {
    connectionString: `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_DATABASE}`,
    ssl:{ rejectUnauthorized: false }
});



// CRIAR VIDEO (POST)
server.post('/videos', async (request, reply) => {


    //!database.create({
    //!    title: title,
    //!    description: description,
    //!    duration: duration
    //!})

    const { title, description, duration } = request.body

    const { rows } = await server.pg.query(
        'INSERT INTO videos (title, description, duration) VALUES ($1, $2, $3) RETURNING *',
        [title, description, duration]
    );
    
    return reply.status(201).send(rows);
})

// BUSCAR VIDEO (GET)
server.get('/videos', async (request) => {
    
    // ! const search = request.query.search;
    // ! const videos = database.list(search);

    // ! return videos; 

    const search = request.query.search;

    let query = 'SELECT * FROM videos';
    const params = []

    if (search) {
        query += ' WHERE title ILIKE $1 OR description ILIKE $1';
        params.push(`%${search}%`);
    }

    query += " ORDER BY id";

    const { rows } = await server.pg.query(query, params);
    return rows;
})

// ATUALIZAR VIDEO (PUT)
server.put('/videos/:id', async (request, reply) => {
    
    const {title, description, duration} = request.body;
    const videoID = request.params.id;

    let params = [title, description, duration, videoID];
    let query = `
        UPDATE videos 
        SET 
            title = $1,
            description = $2,
            duration = $3
        WHERE 
            id = $4

    `

    const result = await server.pg.query(query, params)

    return reply.status(204).send(result)


    //! database.update(videoID, {
    //!     title: title,
    //!     description: description,
    //!     duration: duration
    //! })


})

// DELETAR VIDEO (DELETE)
server.delete('/videos/:id', async (request, reply) => {
    const videoID = request.params.id;
    let query = "DELETE FROM videos WHERE id = $1"

    try {
        const result = await server.pg.query(query, [videoID])

        if (result.rowCount === 0) {
            return reply.status(404).send({ error: 'Vídeo não encontrado' });
    2}

        return reply.status(204).send();
    } catch(error) {
        console.error('Erro ao deletar vídeo:', error);
        return reply.status(400).send({ error: 'Falha ao deletar vídeo' });
    }
    
    //! database.delete(videoID);

    
})

const port = process.env.PORT || 3100
const start = async () => {
     try {
         server.listen({port})
     } catch (error) {
         console.log(error)
     }
 }

 start();