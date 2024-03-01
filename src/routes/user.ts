import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { jwt } from "hono/jwt";
import { sign } from "hono/jwt";
export const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET_KEY: string;
  };
}>();

userRouter.post("/signup", async (c) => {
  const body = await c.req.json();

  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: body.password,
      },
    });
    if (user) {
      const token = await sign({email:user.email}, c.env?.JWT_SECRET_KEY);
      c.status(201);
      return c.json({
        user: {
          name: user.name,
          email: user.email,
          token: token,
        },
      });
    } else {
      c.status(500);
      return c.json({
        error: "something went wrong in our server",
      });
    }
  } catch (error) {
    c.status(501);
    return c.json({
      error: "somethign went wrong in our server",
    });
  }
});

userRouter.get("/all", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const users = await prisma.user.findMany();
    if (users) {
      c.status(201);
      return c.json({
        users: users,
      });
    } else {
      c.status(500);
      return c.json({
        error: "somethign went wrong in our server",
      });
    }
  } catch (error) {
    c.status(501);
    return c.json({
      error: "somethign went wrong in our server",
    });
  }
});

userRouter.post('/signin', async(c)=>{
  const email = c.req.header("email");
  const pass = c.req.header("password");

  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL
  }).$extends(withAccelerate());
  
  try{
    const user = await prisma.user.findUnique({
      where:{
        email: email,
        password: pass
      }
    });
    if(user){
      const token = await sign({email:email}, c.env?.JWT_SECRET_KEY);
      c.status(200);
      return c.json({
        token: token
      })
    }else{
      c.status(401);
      return c.json({error: "unauthorized"})
    }
    
  }catch(error){

  }
  
})
