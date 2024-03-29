import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

export const categoryRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
  },
  Variables :{
    userEmail: string
  }
}>();

categoryRouter.post("/createCategory", async (c) => {
  const body = await c.req.json();
  const userEmail = c.get('userEmail')
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());
  const thisUser = await prisma.user.findUnique({
    where:{
      email: userEmail
    }
  })

  if(!thisUser){
    c.status(400);
    return c.json({
      err: "unable to create a category, user might be missing"
    })
  }
  const post = await prisma.category.create({
    data: {
      name: body.name,
      todos: {
        create: [],
      },
      userId: thisUser.id
    },
  });
  c.status(201);
  return c.json({
    category: post,
  });
});

categoryRouter.get("/all", async (c) => {
  const userEmail = c.get('userEmail');
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const thisUser = await prisma.user.findUnique({
      where:{
        email: userEmail
      }
    })
    if(!thisUser){
      c.status(400);
      return c.json({
        err: "unable to create a category, user might be missing"
      })
    }
    const categories = await prisma.category.findMany({
      where:{
        userId: thisUser.id
      },
      include: {
        todos: true,
      },
    });
    c.status(200);
    return c.json({
      categories: categories,
    });
  } catch (error) {
    console.log("error: ", error);
    c.status(500);
    return c.json({
      error: error,
    });
  }
});

categoryRouter.delete("/delete", async(c)=>{
    const catId = c.req.header("catId");
    const catIdInt = parseInt(catId as string,10);
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
      }).$extends(withAccelerate());
    
    try{
        const deletedCategory = await prisma.category.delete({
            where: {
                id: catIdInt
            }, 
            include :{
              todos: true
            }
        })
        c.status(200);
        return c.json({
            category: deletedCategory
        })
    }catch(error){
        c.status(500);
        console.log("ERROR: ", error, "END");
        return c.json({
          error: error,
        }); 
    }
})