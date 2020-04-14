const connection = require('../database/connection')

module.exports = {
    async index (request,response){
        const {page = 1} = request.query

        const [count] = await connection('incidents').count()
        const incident = await connection('incidents')
        .join('ongs','ongs.id','=','incidents.ong_id')
        .limit(5)
        .offset((page - 1)* 5)
        .select(['incidents.*',
        'ongs.name',
        'ongs.email',
        'ongs.whatsapp',
        'ongs.city',
        'ongs.uf'
        ])
        
        response.header('X-Total-Count',count['count(*)'])
        return response.json(incident)
    },
    async create (request,response){
        const {title,description,value} = request.body
        const ong_id =  await request.headers.authorization
        const [id] = await connection('incidents').insert({
            title,
            description,
            value,
            ong_id
        })
        return  response.json(id)
    },

    async delete(request,response){
        const ong_id = request.headers.authorization
        const incident = request.params
        console.log(incident.id)
        const [ong] = await connection('incidents').where('id',incident.id).select('*')
        if (ong.ong_id !== ong_id){
            return response.status(401).send({'error': 'Operation not allowed'})
        }
        await connection('incidents').where('id',incident.id).delete()
        return response.status(204).send()
    }

}