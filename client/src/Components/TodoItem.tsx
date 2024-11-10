import { Badge, Box, Flex, Spinner, Text } from "@chakra-ui/react";
import { FaCheckCircle } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { Todo } from "./TodoList";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BASE_URL } from "../App";

const TodoItem = ({ todo }: { todo: Todo }) => {
    const queryClient = useQueryClient()
    const { mutate: updateTodo, isPending: isUpdating } = useMutation({
        mutationKey: ["updateTodo"],
        mutationFn: async () => {
            if (todo.completed) return alert("Todo is already completed")
            try {
                const res = await fetch(BASE_URL + `todos/${todo._id}`,
                    { method: "PATCH", }
                )
                const data = await res.json()
                if (!res.ok) {
                    throw new Error(data.error || "Something went wrong");

                }
            } catch (error) {
                console.log(error)
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["todos"] })
        }
    })

    const { mutate: deleteTodo, isPending: isDeleting } = useMutation({
        mutationKey: ["deleteTodo"],
        mutationFn: async (e: React.FormEvent) => {
            e.preventDefault()
            try {
                const res = await fetch(BASE_URL + `todos/${todo._id}`, {
                    method: "DELETE"
                })
                const data = await res.json()
                if (!res.ok) {
                    throw new Error(data.error || "Something went wrong")
                }
                return data
            } catch (err: any) {
                throw new Error(err)
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["todos"] })
        }

    })
    return (
        <Flex gap={2} alignItems={"center"}>
            <Flex
                flex={1}
                alignItems={"center"}
                border={"1px"}
                borderColor={"gray.600"}
                p={2}
                borderRadius={"lg"}
                justifyContent={"space-between"}
            >
                <Text
                    color={todo.completed ? "green" : "red"}
                    textDecoration={todo.completed ? "line-through" : "none"}
                >
                    {todo.body}
                </Text>
                {todo.completed && (
                    <Badge ml='1' colorScheme='green'>
                        Done
                    </Badge>
                )}
                {!todo.completed && (
                    <Badge ml='1' colorScheme='red'>
                        In Progress
                    </Badge>
                )}
            </Flex>
            <Flex gap={2} alignItems={"center"}>
                <Box color={"green.500"} cursor={"pointer"} onClick={() => updateTodo()}>
                    {isUpdating ? <Spinner size={"sm"} /> : <FaCheckCircle size={20} />}
                </Box>
                <Box color={"red.500"} cursor={"pointer"} onClick={deleteTodo}>
                    {isDeleting ? <Spinner size={"sm"} /> : <MdDelete size={25} />}
                </Box>
            </Flex>
        </Flex>
    );
};
export default TodoItem;