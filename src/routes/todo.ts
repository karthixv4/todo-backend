import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

export const todoRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
  };
}>();
// interface Category {
//     id: number;
//     name?: string;
// }
interface TodoData {
  title: string;
  description?: string;
  isCompleted?: boolean;
  createdAt?: string;
  dueAt?: string;
  category?: any;
}
//Create a Todo
todoRouter.post("/createTodo", async (c) => {
  const body = await c.req.json();
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const todo = await prisma.todo.create({
      data: {
        title: body.title,
        description: body.description,
        isCompleted: body?.isCompleted,
        createdAt: body?.createdAt,
        dueAt: body?.dueAt,
      },
    });
    if (todo) {
      c.status(201);
      return c.json({
        todo: todo,
      });
    } else {
      c.status(500);
      return c.json({
        error: "somethign went wrong in our server",
      });
    }
  } catch (error) {
    console.log("ERROR: ", error, "ERROR LOG OVER");
    c.status(500);
    return c.json({
      error: "somethign went wrong in our server",
    });
  }
});

todoRouter.get("/all", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const todos = await prisma.todo.findMany();
    c.status(200);
    return c.json({
      todos: todos,
    });
  } catch (error) {
    console.log("error: ", error);
    c.status(500);
    return c.json({
      error: error,
    });
  }
});

todoRouter.put("/updateTodo", async (c) => {
  const body = await c.req.json();
  const categoryId = body?.categoryId;
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const todoData: TodoData = {
      title: body.title,
      description: body.description,
      isCompleted: body?.isCompleted,
      createdAt: body?.createdAt,
      dueAt: body?.dueAt,
    };
    if (categoryId) {
      todoData.category = {
        connect: {
          id: categoryId,
        },
      };
    }else{
        todoData.category = {
            disconnect: true
        }
    }
    console.log("todoData: ", todoData);
    const updatedTodo = await prisma.todo.update({
      where: { id: body.id },
      data: todoData,
    });
    c.status(200);
    return c.json({
      updatedTodo: updatedTodo,
    });
  } catch (error) {
    c.status(500);
    console.log("ERROR: ", error, "END");
    return c.json({
      error: error,
    });
  }
});

todoRouter.delete("/delete", async(c)=>{
    const id = c.req.header("todoId");
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
      }).$extends(withAccelerate());
    
    try{
        const deletedTodo = await prisma.todo.delete({
            where: {
                id: id
            }
        })
        c.status(200);
        return c.json({
            todo: deletedTodo
        })
    }catch(error){
        c.status(500);
        console.log("ERROR: ", error, "END");
        return c.json({
          error: error,
        }); 
    }
})