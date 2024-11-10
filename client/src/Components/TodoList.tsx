import { Flex, Spinner, Stack, Text, useColorMode, Button } from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import TodoItem from "./TodoItem";
import { BASE_URL } from "../App";

export type Todo = {
    _id: number;
    body: string;
    completed: boolean;
}
const TodoList = () => {
    const { colorMode } = useColorMode();
    const queryClient = useQueryClient()
    const { data: todos, isLoading } = useQuery<Todo[]>({
        queryKey: ["todos"],
        queryFn: async () => {
            try {
                const res = await fetch(BASE_URL + "get-todos")
                const data = await res.json()
                if (!res.ok) {
                    throw new Error(data.error || "Something went wrong")
                }
                return data || []
            } catch (error) {
                console.log(error)
            }
        }
    })
    const { mutate: deleteAll, isPending: isDeletingAll } = useMutation({
        mutationKey: ["deleteAll"],
        mutationFn: async (e: React.FormEvent) => {
            e.preventDefault
            try {
                const res = await fetch(BASE_URL + `todos`, {
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
    const { mutate: deleteFinished, isPending: isDeletingFinished } = useMutation({
        mutationKey: ["deleteFinished"],
        mutationFn: async (e: React.FormEvent) => {
            e.preventDefault()
            try {
                const unFinished = todos?.filter((items) => {
                    return items.completed != true
                })
                console.log(unFinished)
                const res = await fetch(BASE_URL + "todos/deleteFinished", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ unFinished })
                })
                const data = await res.json()
                if (!res.ok) {
                    throw new Error(data.error || "Something went wrong")
                }
                console.log(data)
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
        <>
            <Text fontSize={"4xl"} textTransform={"uppercase"} fontWeight={"bold"} textAlign={"center"} my={2}
                color={colorMode == "light" ? "black" : "white"}
            >
                Today's Tasks
            </Text>
            {isLoading && (
                <Flex justifyContent={"center"} my={4}>
                    <Spinner size={"xl"} color={colorMode == "light" ? "black" : "white"} />
                </Flex>
            )}
            {!isLoading && todos?.length === 0 && (
                <Stack alignItems={"center"} gap='3'>
                    <Text fontSize={"xl"} textAlign={"center"} color={colorMode == "light" ? "black" : "white"}>
                        All tasks completed! 🤞
                    </Text>
                    <img src='/go.png' alt='Go logo' width={70} height={70} />
                </Stack>
            )}
            <Stack gap={3}>
                {todos?.map((todo, idx) => (
                    <TodoItem key={idx} todo={todo} />
                ))}
            </Stack>
            {todos?.length != 0 ?
                <Flex maxW={"600px"} alignItems={"center"} justifyContent={"center"} gap={4} marginTop={4}>
                    {isDeletingAll || isDeletingFinished ? <Button onClick={deleteAll}><Spinner size={"sm"} /></Button> : <Button onClick={deleteAll}>Delete All</Button>}

                    {isDeletingAll || isDeletingFinished ? <Button onClick={deleteFinished}><Spinner size={"sm"} /></Button> : <Button onClick={deleteFinished}>Delete finished tasks</Button>}
                </Flex>
                :
                <Flex></Flex>
            }
        </>
    );
};
export default TodoList;