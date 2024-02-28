import { Hono } from 'hono'
import {categoryRouter} from "./routes/category";
import {todoRouter} from "./routes/todo";
import { cors } from 'hono/cors'

const app = new Hono<{
  Bindings:{
    DATABASE_URL: string;
  }
}>()
app.use('/api/*', cors())
app.get('/', (c) => {
  return c.text('Hello Hono!')
})
app.route('/api/v1/category', categoryRouter)
app.route('/api/v1/todo', todoRouter)

export default app
