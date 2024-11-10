import { Button, Flex, Input, Spinner, useColorMode } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { BASE_URL } from "../App";


const TodoForm = () => {
    const [newTodo, setNewTodo] = useState("");
    const { colorMode } = useColorMode();
    const queryClient = useQueryClient()
    const { mutate: createTodo, isPending: isCreating } = useMutation({
        mutationKey: ["createTodo"],
        mutationFn: async (e: React.FormEvent) => {
            e.preventDefault()
            try {
                const res = await fetch(BASE_URL + "todos", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ body: newTodo })
                })
                const data = await res.json()
                if (!res.ok) {
                    throw new Error(data.error || "Something went wrong")
                }
                if (data.message == "Task has already appeared in the ToDoList") {
                    alert("Task has already appeared in the ToDoList")
                }
                console.log(data)
                setNewTodo("")
                return data
            } catch (error: any) {
                throw new Error(error);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["todos"] })
        },
        onError: (error: any) => {
            alert(error.message)
        },
    })
    return (
        <form onSubmit={createTodo}>
            <Flex gap={2} >
                <Input
                    type='text'
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    ref={(input) => input && input.focus()}
                    border={colorMode == "light" ? "1px solid black" : "1px solid white"}
                />
                <Button
                    mx={2}
                    type='submit'
                    _active={{
                        transform: "scale(.97)",
                    }}
                >
                    {isCreating ? <Spinner size={"xs"} /> : <IoMdAdd size={30} />}
                </Button>
            </Flex>
        </form>
    );
};
export default TodoForm;