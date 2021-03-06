//import { graphqlUploadExpress } from "graphql-upload"
import { ApolloServer } from "apollo-server-express"
import Express from "express"
import "reflect-metadata"
import { createConnection } from "typeorm"
import session from "express-session"
import connectRedis from "connect-redis"
import {redis} from "./redis"
import cors from "cors"
import { createSchema } from "./utils/createSchema"


const main = async () => {
    await createConnection()

    const schema = await createSchema()
    
    const apolloServer = new ApolloServer({
        schema,
        context: ({ req, res }: any) => ({ req, res }),
        uploads: false
        
    })

    const app = Express()

    const RedisStore = connectRedis(session)

    app.use(cors({
        credentials: true,
        origin: "http://localhost:3000"
        })
    )

    app.use(
        session({
            store: new RedisStore({
                client: redis as any,
            }),
            name: "qid",
            secret: "SESSION_SECRET",
            resave: false,
            saveUninitialized: false,
            cookie: {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 1000 * 60 * 60 * 24 * 7 * 365, // 7 years
            },
        })
    )

    //app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));

    apolloServer.applyMiddleware({app})

    app.listen(4000, () => {
        console.log("server started on local host 4000")
        

    })
}


main()