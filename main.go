package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Todo struct {
	ID        primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	Completed bool               `json:"completed"`
	Body      string             `json:"body"`
}

var collection *mongo.Collection

func main() {
	fmt.Println("hello")
	//Get env file
	if os.Getenv("ENV") != "production" {
		//Load the env file if not in the production environment
		err := godotenv.Load(".env")
		if err != nil {
			log.Fatal("Error loading .env file:", err)
		}
	}
	//Create connection
	MONGODB_URI := os.Getenv("MONGODB_URI")
	clientOptions := options.Client().ApplyURI(MONGODB_URI)
	client, err := mongo.Connect(context.Background(), clientOptions)
	if err != nil {
		log.Fatal(err)
	}
	// Optimize by disconecting the DB after the function finish
	defer client.Disconnect(context.Background())

	err = client.Ping(context.Background(), nil)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("connected to Mongodb Atlas")
	collection = client.Database("Todolist-Golang").Collection("todos")

	app := fiber.New()

	// app.Use(cors.New(cors.Config{
	// 	AllowOrigins: "http://localhost:5173",
	// 	AllowHeaders: "Origin,Content-Type,Accept",
	// }))

	app.Get("/api/get-todos", getTodos)
	app.Post("/api/todos", createTodo)
	app.Patch("/api/todos/:id", updateTodo)
	app.Delete("/api/todos/:id", deleteTodo)
	app.Delete("/api/todos", deleteAll)
	app.Post("/api/todos/deleteFinished", deleteFinished)

	port := os.Getenv("PORT")
	if port == "" {
		port = "5000"
	}
	if os.Getenv("ENV") == "production" {
		app.Static("/", "./client/dist")
	}
	log.Fatal(app.Listen("0.0.0.0:" + port))
}

func getTodos(c *fiber.Ctx) error {
	var todos []Todo
	// cursor is a cursor to the documents in the collections
	// bson.M{} means get all docs, no filter
	cursor, err := collection.Find(context.Background(), bson.M{})
	if err != nil {
		return nil
	}
	defer cursor.Close(context.Background())
	// for each document the cursor point to, decode it and pass it to variable todo
	for cursor.Next(context.Background()) {
		var todo Todo
		if err := cursor.Decode(&todo); err != nil {
			return err
		}
		todos = append(todos, todo)
	}
	return c.Status(200).JSON(todos)
}

func createTodo(c *fiber.Ctx) error {
	// Create a new Todo struct
	todo := &Todo{}

	if err := c.BodyParser(todo); err != nil {
		return err
	}

	cursor, err := collection.Find(context.Background(), bson.M{})
	if err != nil {
		return err
	}
	for cursor.Next(context.Background()) {
		var available_todo Todo
		if err := cursor.Decode(&available_todo); err != nil {
			return err
		}
		if todo.Body == available_todo.Body {
			return c.Status(200).JSON(fiber.Map{"message": "Task has already appeared in the ToDoList"})
		}
	}

	if todo.Body == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Todo body cannot be empty"})
	}

	insertResult, err := collection.InsertOne(context.Background(), todo)
	if err != nil {
		return err
	}

	// Cast and assign the inserted ID back to the Todo's ID field
	todo.ID = insertResult.InsertedID.(primitive.ObjectID)

	return c.Status(201).JSON(todo)
}

func updateTodo(c *fiber.Ctx) error {
	id := c.Params("id")
	objectId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "cannot find the todo"})
	}
	filter := bson.M{"_id": objectId}
	update := bson.M{"$set": bson.M{"completed": true}}
	_, err = collection.UpdateOne(context.Background(), filter, update)
	if err != nil {
		return err
	}
	return c.Status(200).JSON(fiber.Map{"success": true})
}

func deleteTodo(c *fiber.Ctx) error {
	id := c.Params("id")
	objectId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "cannot find the todo"})
	}
	filter := bson.M{"_id": objectId}
	_, err = collection.DeleteOne(context.Background(), filter)
	if err != nil {
		return err
	}
	return c.Status(200).JSON(fiber.Map{"success": true})
}
func deleteAll(c *fiber.Ctx) error {
	res, err := collection.DeleteMany(context.Background(), bson.M{})
	if err != nil {
		return err
	}
	return c.Status(200).JSON(res)
}

func deleteFinished(c *fiber.Ctx) error {
	var requestBody struct {
		UnFinished []Todo `json:"unFinished"`
	}
	if err := c.BodyParser(&requestBody); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}
	_, err := collection.DeleteMany(context.Background(), bson.M{})
	if err != nil {
		return err
	}
	todos := requestBody.UnFinished
	fmt.Print(todos)
	for _, todo := range todos {
		_, err := collection.InsertOne(context.Background(), todo)
		if err != nil {
			return err
		}
	}
	return c.Status(200).JSON(fiber.Map{"success": true})
}
