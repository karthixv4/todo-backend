import { Hono } from 'hono'
import {categoryRouter} from "./routes/category";
import {todoRouter} from "./routes/todo";
import {userRouter} from "./routes/user";
import { cors } from 'hono/cors'
import { verify } from 'hono/jwt';
const app = new Hono<{
  Bindings:{
    DATABASE_URL: string;
    JWT_SECRET_KEY: string;
  },
  Variables:{
    userEmail: string
  }
}>()
app.use('*', cors());
app.use('/api/v1/*', async(c, next)=>{
  const auth = c.req.header("Auth");
  if(!auth){
    c.status(403);
    return c.json({error: "unauthorized"})
  }
  try{
    const decoded = await verify(auth, c.env?.JWT_SECRET_KEY);
    c.set('userEmail', decoded.email);
    await next()
    if(!decoded){
      c.status(401);
      return c.json({
        error: "you are unauthorized"
      })
    }
  }catch(err){
    c.status(401);
    return c.json({
      error: "you are unauthorized"
    })
  }
  
  
})
app.get('/', (c) => {
  return c.text('Hello Hono!')
})
app.route('/api/v1/category', categoryRouter)
app.route('/api/v1/todo', todoRouter)
app.route('/auth/v1/user', userRouter);
export default app
